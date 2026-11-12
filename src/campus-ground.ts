import * as THREE from 'three';

// The outdoor paving and the courtyard use slightly different slab heights.
const groundLevel = -0.02;
const rotation = -24 * Math.PI / 180;
const groundMaterials = new Set(['plaza', 'walk', 'courtyard-paving', 'decal-brickline']);

const groundFragment = /* glsl */`
  varying vec3 vCampusMirrorWorld;
  uniform sampler2D tCampusMirror;
  uniform mat4 uCampusMirrorProjection;
  uniform float uCampusMirrorActive;
  uniform float uCampusGroundLevel;
  uniform vec2 uCampusSiteRotation;

  vec2 campusSite(vec2 world) {
    float c = uCampusSiteRotation.x;
    float s = uCampusSiteRotation.y;
    return vec2(c * world.x + s * world.y, -s * world.x + c * world.y);
  }

  float campusDampPatch(vec2 site, vec2 center, vec2 radius, float variation) {
    vec2 d = (site - center) / radius;
    return 1.0 - smoothstep(0.44, 1.0, dot(d, d) + variation);
  }

  float campusDampness(vec3 world) {
    vec2 site = campusSite(world.xz);
    float height = abs(world.y - uCampusGroundLevel);
    if (height > 0.095 || site.x < 3.5 || site.x > 21.0 || site.y < 15.0 || site.y > 63.0) return 0.0;
    float uneven = sin(site.x * 5.8 + sin(site.y * 3.1)) * 0.10
      + sin(site.y * 11.7 + site.x * 3.2) * 0.047;
    // Water gathers immediately beside the trench and on the shaded paving edges.
    float moisture = campusDampPatch(site, vec2(6.3, 54.94), vec2(2.8, 0.55), uneven);
    moisture = max(moisture, campusDampPatch(site, vec2(14.1, 54.79), vec2(3.1, 0.43), uneven));
    moisture = max(moisture, 0.70 * campusDampPatch(site, vec2(19.2, 57.5), vec2(1.05, 2.0), uneven));
    moisture = max(moisture, campusDampPatch(site, vec2(12.35, 59.4), vec2(1.48, 2.15), uneven));
    moisture = max(moisture, 0.70 * campusDampPatch(site, vec2(13.66, 60.6), vec2(0.73, 1.28), uneven));
    moisture = max(moisture, 0.55 * campusDampPatch(site, vec2(19.4, 18.8), vec2(0.87, 2.9), uneven));
    return moisture * (1.0 - smoothstep(0.045, 0.095, height));
  }
`;

export function createCampusGroundReflection(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  visuals: THREE.Object3D,
  enabled: boolean,
) {
  const supported = enabled && renderer.extensions.has('EXT_color_buffer_float');
  const target = new THREE.WebGLRenderTarget(1, 1, {
    type: supported ? THREE.HalfFloatType : THREE.UnsignedByteType,
    minFilter: THREE.LinearMipmapLinearFilter,
    generateMipmaps: true,
  });
  target.texture.name = 'Campus paving reflection';
  const uniforms = {
    tCampusMirror: { value: null as THREE.Texture | null },
    uCampusMirrorProjection: { value: new THREE.Matrix4() },
    uCampusMirrorActive: { value: 0 },
    uCampusGroundLevel: { value: groundLevel },
    uCampusSiteRotation: { value: new THREE.Vector2(Math.cos(rotation), Math.sin(rotation)) },
  };
  const updated = new Set<THREE.MeshStandardMaterial>();
  visuals.traverse(object => {
    if (!(object instanceof THREE.Mesh)) return;
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    for (const material of materials) {
      if (!(material instanceof THREE.MeshStandardMaterial) || updated.has(material) || !groundMaterials.has(material.name)) continue;
      updated.add(material);
      const previousCompile = material.onBeforeCompile.bind(material);
      const previousKey = material.customProgramCacheKey();
      material.customProgramCacheKey = () => `${previousKey}|campus-ground-v1`;
      material.onBeforeCompile = (shader, renderer) => {
        previousCompile(shader, renderer);
        Object.assign(shader.uniforms, uniforms);
        shader.vertexShader = shader.vertexShader
          .replace('#include <common>', '#include <common>\nvarying vec3 vCampusMirrorWorld;')
          .replace('#include <project_vertex>', `
            #include <project_vertex>
            vCampusMirrorWorld = (modelMatrix * vec4(transformed, 1.0)).xyz;
          `);
        shader.fragmentShader = shader.fragmentShader
          .replace('#include <common>', `#include <common>\n${groundFragment}`)
          .replace('#include <metalnessmap_fragment>', `
            #include <metalnessmap_fragment>
            float campusDamp = campusDampness(vCampusMirrorWorld);
            roughnessFactor = mix(roughnessFactor, 0.085, campusDamp * 0.92);
            diffuseColor.rgb *= mix(1.0, 0.76, campusDamp);
          `)
          .replace('#include <lights_fragment_maps>', `
            #include <lights_fragment_maps>
            if (uCampusMirrorActive > 0.0) {
              vec3 groundView = normalize(cameraPosition - vCampusMirrorWorld);
              vec3 groundNormal = transformDirectionByInverseViewMatrix(geometryNormal, viewMatrix);
              vec2 site = campusSite(vCampusMirrorWorld.xz);
              float pavement = step(-2.0, site.x) * step(site.x, 33.0)
                * step(-16.0, site.y) * step(site.y, 87.0)
                * (1.0 - smoothstep(0.045, 0.096, abs(vCampusMirrorWorld.y - uCampusGroundLevel)))
                * smoothstep(0.93, 0.99, groundNormal.y);
              float facing = max(0.0, groundView.y);
              float angle = pow(1.0 - facing, 3.0);
              float range = 1.0 - smoothstep(27.0, 49.0, length(cameraPosition - vCampusMirrorWorld));
              float strength = pavement * range * mix(0.13 * angle, 0.72 + 0.28 * angle, campusDamp);
              if (strength > 0.004) {
                vec4 projected = uCampusMirrorProjection * vec4(vCampusMirrorWorld.x, uCampusGroundLevel, vCampusMirrorWorld.z, 1.0);
                vec2 uv = projected.xy / max(projected.w, 0.001);
                uv += groundNormal.xz * mix(0.017, 0.004, campusDamp);
                vec2 edge = min(uv, 1.0 - uv);
                float edgeFade = smoothstep(0.0, 0.070, min(edge.x, edge.y)) * step(0.001, projected.w);
                float lod = mix(0.8, 5.8, material.roughness);
                vec3 reflected = textureLod(tCampusMirror, clamp(uv, 0.002, 0.998), lod).rgb;
                radiance += min(reflected, vec3(6.0)) * strength * edgeFade;
              }
            }
          `);
      };
      material.needsUpdate = true;
    }
  });

  const reflectedCamera = new THREE.PerspectiveCamera();
  const cameraPosition = new THREE.Vector3();
  const look = new THREE.Vector3();
  const lastPosition = new THREE.Vector3(Infinity, Infinity, Infinity);
  const lastDirection = new THREE.Vector3();
  const buffer = new THREE.Vector2();
  const sitePosition = new THREE.Vector2();
  const plane = new THREE.Plane();
  const clip = new THREE.Vector4();
  const corner = new THREE.Vector4();
  const textureBias = new THREE.Matrix4().set(
    .5, 0, 0, .5,
    0, .5, 0, .5,
    0, 0, .5, .5,
    0, 0, 0, 1,
  );
  let lastCapture = -Infinity;
  let invalidated = true;
  let passes = 0;
  function invalidate() {
    uniforms.uCampusMirrorActive.value = 0;
    invalidated = true;
  }
  if (supported) renderer.domElement.addEventListener('webglcontextrestored', invalidate);

  return {
    get active() { return uniforms.uCampusMirrorActive.value !== 0; },
    get passes() { return passes; },
    update(camera: THREE.PerspectiveCamera, time: number, walking: boolean) {
      camera.getWorldPosition(cameraPosition);
      camera.getWorldDirection(look);
      const c = uniforms.uCampusSiteRotation.value.x;
      const s = uniforms.uCampusSiteRotation.value.y;
      sitePosition.set(c * cameraPosition.x + s * cameraPosition.z, -s * cameraPosition.x + c * cameraPosition.z);
      if (!supported || !walking || renderer.xr.isPresenting || look.y > .58 || cameraPosition.y < .35 || cameraPosition.y > 4.2
        || sitePosition.x < -20 || sitePosition.x > 48 || sitePosition.y < -32 || sitePosition.y > 98) {
        invalidate();
        return;
      }
      // Capture using the current shadow map without consuming the main camera's update.
      if (renderer.shadowMap.needsUpdate) {
        invalidated = true;
        return;
      }
      renderer.getDrawingBufferSize(buffer);
      const scale = Math.min(.43, 576 / Math.max(buffer.x, buffer.y));
      const width = Math.max(16, Math.round(buffer.x * scale));
      const height = Math.max(16, Math.round(buffer.y * scale));
      const resized = target.width !== width || target.height !== height;
      const moved = lastPosition.distanceToSquared(cameraPosition) > .022 ** 2 || lastDirection.dot(look) < .999993;
      if (!resized && (!invalidated && !moved || time - lastCapture < 38)) return;

      if (resized) target.setSize(width, height);
      reflectedCamera.position.copy(cameraPosition);
      reflectedCamera.position.y = 2 * groundLevel - cameraPosition.y;
      reflectedCamera.up.setFromMatrixColumn(camera.matrixWorld, 1);
      reflectedCamera.up.y *= -1;
      look.y *= -1;
      reflectedCamera.lookAt(look.add(reflectedCamera.position));
      reflectedCamera.updateMatrixWorld(true);
      reflectedCamera.near = camera.near;
      reflectedCamera.far = camera.far;
      reflectedCamera.projectionMatrix.copy(camera.projectionMatrix);

      const projection = reflectedCamera.projectionMatrix.elements;
      plane.normal.set(0, 1, 0);
      plane.constant = -groundLevel + .004;
      plane.applyMatrix4(reflectedCamera.matrixWorldInverse);
      clip.set(plane.normal.x, plane.normal.y, plane.normal.z, plane.constant);
      corner.set((Math.sign(clip.x) + projection[8]) / projection[0],
        (Math.sign(clip.y) + projection[9]) / projection[5], -1, (1 + projection[10]) / projection[14]);
      const clipFactor = clip.dot(corner);
      if (Math.abs(clipFactor) < 1e-5) {
        uniforms.uCampusMirrorActive.value = 0;
        return;
      }
      uniforms.uCampusMirrorProjection.value.copy(textureBias)
        .multiply(reflectedCamera.projectionMatrix).multiply(reflectedCamera.matrixWorldInverse);
      clip.multiplyScalar(2 / clipFactor);
      projection[2] = clip.x;
      projection[6] = clip.y;
      projection[10] = clip.z + 1;
      projection[14] = clip.w;
      reflectedCamera.projectionMatrixInverse.copy(reflectedCamera.projectionMatrix).invert();

      const currentTarget = renderer.getRenderTarget();
      const xrEnabled = renderer.xr.enabled;
      uniforms.uCampusMirrorActive.value = 0;
      uniforms.tCampusMirror.value = null;
      try {
        renderer.xr.enabled = false;
        renderer.setRenderTarget(target);
        renderer.state.buffers.depth.setMask(true);
        renderer.render(scene, reflectedCamera);
      } finally {
        renderer.setRenderTarget(currentTarget);
        renderer.xr.enabled = xrEnabled;
      }
      uniforms.tCampusMirror.value = target.texture;
      uniforms.uCampusMirrorActive.value = 1;
      lastPosition.copy(cameraPosition);
      camera.getWorldDirection(lastDirection);
      lastCapture = time;
      invalidated = false;
      passes += 1;
    },
    dispose() {
      if (supported) renderer.domElement.removeEventListener('webglcontextrestored', invalidate);
      target.dispose();
    },
  };
}
