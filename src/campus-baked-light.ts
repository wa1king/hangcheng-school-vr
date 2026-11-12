import { Data3DTexture, LinearFilter, MathUtils, type MeshStandardMaterial, Vector2, Vector3 } from 'three';

const bakeUniforms = /* glsl */`
  varying vec3 vCampusBakeWorld;
  uniform highp sampler3D tCampusBake;
  uniform vec3 uCampusBakeOrigin;
  uniform vec3 uCampusBakeStep;
  uniform vec3 uCampusBakeSize;
  uniform vec2 uCampusBakeRotation;
  uniform float uCampusBakeActive;
`;

const applyBake = /* glsl */`
  if (uCampusBakeActive > 0.0) {
    // Offset toward the visible surface side to avoid using the opposite room's probe.
    vec3 probeWorld = vCampusBakeWorld + transformNormalByInverseViewMatrix(nonPerturbedNormal, viewMatrix) * 0.53;
    float cosine = uCampusBakeRotation.x;
    float sine = uCampusBakeRotation.y;
    vec3 sitePoint = vec3(
      probeWorld.x * cosine + probeWorld.z * sine,
      -probeWorld.x * sine + probeWorld.z * cosine,
      probeWorld.y
    );
    vec3 grid = (sitePoint - uCampusBakeOrigin) / uCampusBakeStep;
    vec3 margin = min(grid, uCampusBakeSize - 1.0 - grid);
    // Ground-level samples are clamped down to the first walkable level.
    float horizontal = smoothstep(0.0, 3.0, min(margin.x, margin.y));
    float vertical = smoothstep(-1.5, -0.1, grid.z) * smoothstep(0.0, 2.0, uCampusBakeSize.z - 1.0 - grid.z);
    float amount = horizontal * vertical;
    if (amount > 0.001) {
      vec3 lighting = texture(tCampusBake, (grid + 0.5) / uCampusBakeSize).rgb;
      float openSky = lighting.r;
      float ambientVisibility = (0.39 + 0.61 * openSky) * (0.72 + 0.28 * lighting.g);
      irradiance *= mix(1.0, ambientVisibility, amount);
      iblIrradiance *= mix(1.0, ambientVisibility, amount);
      vec3 reflectedSun = vec3(0.52, 0.41, 0.29) * lighting.b * (1.0 - 0.55 * openSky);
      irradiance += reflectedSun * amount;
    }
  }
`;

/** Static indirect daylight sampled from a small offline-baked, scene-specific volume. */
export function createCampusBakedLight(manifestURL: URL, campusModel: string) {
  const query = new URLSearchParams(window.location.search);
  if (query.has('debug') && query.get('bake') === '0') return;

  const revision = new URL(campusModel, manifestURL).searchParams.get('v');
  if (!revision || !/^[\da-f]{12}$/.test(revision)) return;

  const uniforms = {
    tCampusBake: { value: null as Data3DTexture | null },
    uCampusBakeOrigin: { value: new Vector3() },
    uCampusBakeStep: { value: new Vector3(1, 1, 1) },
    uCampusBakeSize: { value: new Vector3(1, 1, 1) },
    uCampusBakeRotation: { value: new Vector2(1, 0) },
    uCampusBakeActive: { value: 0 },
  };
  const asset = new URL('campus-baked-light.bin', manifestURL);
  asset.searchParams.set('v', revision);
  const controller = new AbortController();
  const headerSize = 64;
  let started = false;
  function start() {
    if (started || controller.signal.aborted) return;
    started = true;
    void fetch(asset, { signal: controller.signal }).then(async response => {
      if (!response.ok) return;
      const buffer = await response.arrayBuffer();
      if (buffer.byteLength < headerSize || controller.signal.aborted) return;
      const decoder = new TextDecoder();
      if (decoder.decode(new Uint8Array(buffer, 0, 4)) !== 'HCB1'
        || decoder.decode(new Uint8Array(buffer, 48, 12)) !== revision) return;

      const header = new DataView(buffer);
      const width = header.getUint32(4, true);
      const height = header.getUint32(8, true);
      const depth = header.getUint32(12, true);
      const step = [28, 32, 36].map(offset => header.getFloat32(offset, true));
      if (width < 2 || height < 2 || depth < 2 || width * height * depth * 4 !== buffer.byteLength - headerSize
        || step.some(value => !(value > 0) || !Number.isFinite(value))) return;

      const texture = new Data3DTexture(new Uint8Array(buffer, headerSize), width, height, depth);
      texture.minFilter = LinearFilter;
      texture.magFilter = LinearFilter;
      texture.needsUpdate = true;
      uniforms.tCampusBake.value = texture;
      uniforms.uCampusBakeOrigin.value.set(header.getFloat32(16, true), header.getFloat32(20, true), header.getFloat32(24, true));
      uniforms.uCampusBakeStep.value.set(step[0], step[1], step[2]);
      uniforms.uCampusBakeSize.value.set(width, height, depth);
      uniforms.uCampusBakeRotation.value.set(header.getFloat32(40, true), header.getFloat32(44, true));
      uniforms.uCampusBakeActive.value = 1;
    }).catch(() => {
      // Network failures leave the ordinary sky and dynamic direct light active.
    });
  }

  return {
    start,
    skyVisibilityAt(world: Vector3) {
      const texture = uniforms.tCampusBake.value;
      if (!texture) return 1;
      const { width, height, depth } = texture.image;
      const data = texture.image.data as Uint8Array;
      const { x: cosine, y: sine } = uniforms.uCampusBakeRotation.value;
      const origin = uniforms.uCampusBakeOrigin.value;
      const step = uniforms.uCampusBakeStep.value;
      const x = (world.x * cosine + world.z * sine - origin.x) / step.x;
      const z = (-world.x * sine + world.z * cosine - origin.y) / step.y;
      const y = (world.y - origin.z) / step.z;
      const horizontal = MathUtils.smoothstep(Math.min(x, width - 1 - x, z, height - 1 - z), 0, 3);
      const vertical = MathUtils.smoothstep(y, -1.5, -0.1) * MathUtils.smoothstep(depth - 1 - y, 0, 2);
      if (horizontal === 0 || vertical === 0) return 1;

      const x0 = Math.floor(x);
      const z0 = Math.floor(z);
      const layer = Math.max(0, y);
      const y0 = Math.floor(layer);
      const columnStride = 4;
      const rowStride = columnStride * width;
      const layerStride = rowStride * height;
      const index = x0 * columnStride + z0 * rowStride + y0 * layerStride;
      const first = MathUtils.lerp(
        MathUtils.lerp(data[index], data[index + columnStride], x - x0),
        MathUtils.lerp(data[index + rowStride], data[index + rowStride + columnStride], x - x0),
        z - z0,
      );
      const above = index + layerStride;
      const second = MathUtils.lerp(
        MathUtils.lerp(data[above], data[above + columnStride], x - x0),
        MathUtils.lerp(data[above + rowStride], data[above + rowStride + columnStride], x - x0),
        z - z0,
      );
      const sky = MathUtils.lerp(first, second, layer - y0) / 255;
      return MathUtils.lerp(1, sky, horizontal * vertical);
    },
    register(material: MeshStandardMaterial) {
      if (material.transparent || material.name.startsWith('decal-')) return;
      const previousCompile = material.onBeforeCompile;
      const previousKey = material.customProgramCacheKey();
      material.onBeforeCompile = (shader, renderer) => {
        previousCompile.call(material, shader, renderer);
        Object.assign(shader.uniforms, uniforms);
        shader.vertexShader = shader.vertexShader
          .replace('#include <common>', '#include <common>\nvarying vec3 vCampusBakeWorld;')
          .replace('#include <project_vertex>', `
            #include <project_vertex>
            vCampusBakeWorld = (modelMatrix * vec4(transformed, 1.0)).xyz;
          `);
        shader.fragmentShader = shader.fragmentShader
          .replace('#include <common>', `#include <common>\n${bakeUniforms}`)
          .replace('#include <lights_fragment_end>', `${applyBake}\n#include <lights_fragment_end>`);
      };
      material.customProgramCacheKey = () => `${previousKey}|campus-bake-v1`;
    },
    dispose() {
      controller.abort();
      uniforms.uCampusBakeActive.value = 0;
      uniforms.tCampusBake.value?.dispose();
      uniforms.tCampusBake.value = null;
    },
  };
}
