import type { MeshStandardMaterial } from 'three';

const weathering = new Map<string, number>([
  ['road', .38], ['plaza', .28], ['walk', .28], ['courtyard-paving', .31],
  ['entry-stone', .18], ['stair-stone', .12], ['teaching-floor', .17],
  ['beige', .24], ['terra', .25], ['reveal', .18], ['cream', .15],
]);

const surfaceNoise = /* glsl */`
  varying vec3 vCampusSurface;
  uniform float uCampusWeathering;

  float surfaceSeed(vec2 point) {
    vec3 seed = fract(point.xyx * vec3(0.1031, 0.11369, 0.13787));
    seed += dot(seed, seed.yzx + 19.19);
    return fract((seed.x + seed.y) * seed.z);
  }

  float surfaceNoise(vec2 point) {
    vec2 cell = floor(point);
    vec2 blend = fract(point);
    blend = blend * blend * (3.0 - 2.0 * blend);
    return mix(
      mix(surfaceSeed(cell), surfaceSeed(cell + vec2(1.0, 0.0)), blend.x),
      mix(surfaceSeed(cell + vec2(0.0, 1.0)), surfaceSeed(cell + 1.0), blend.x),
      blend.y
    );
  }
`;

/** Add non-repeating surface variation over the small scanned material tiles. */
export function applyCampusWeathering(material: MeshStandardMaterial) {
  const strength = weathering.get(material.name);
  if (strength === undefined) return;
  material.onBeforeCompile = shader => {
    shader.uniforms.uCampusWeathering = { value: strength };
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vCampusSurface;')
      .replace('#include <project_vertex>', `
        #include <project_vertex>
        vCampusSurface = (modelMatrix * vec4(transformed, 1.0)).xyz;
      `);
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `#include <common>\n${surfaceNoise}`)
      .replace('#include <map_fragment>', `
        #include <map_fragment>
        vec2 weather = vCampusSurface.xz + vCampusSurface.y * vec2(0.61, 0.84);
        float mottling = surfaceNoise(weather * 0.35) * 0.64
          + surfaceNoise(weather * 1.21 + 11.6) * 0.36;
        float staining = smoothstep(0.31, 0.77, mottling) * uCampusWeathering;
        diffuseColor.rgb *= mix(vec3(1.045), vec3(0.71, 0.68, 0.64), staining * 2.1);
      `)
      .replace('#include <roughnessmap_fragment>', `
        #include <roughnessmap_fragment>
        roughnessFactor = clamp(roughnessFactor + staining * 0.52 - 0.032, 0.12, 1.0);
      `);
  };
  material.customProgramCacheKey = () => 'campus-weathering-v1';
}
