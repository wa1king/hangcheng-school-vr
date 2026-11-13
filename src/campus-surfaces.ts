import type { MeshStandardMaterial } from 'three';

type SurfaceFamily = 'pavers' | 'scanned' | 'stone' | 'paint';
type SurfaceResponse = [family: SurfaceFamily, soil: number, polish: number, reliefMetres: number];

// Soil is reflected in color and roughness. Relief is physical height and
// stays below a millimeter on the maintained interior finishes.
const surfaces = new Map<string, SurfaceResponse>([
  ['plaza', ['pavers', .31, .26, .0022]],
  ['walk', ['pavers', .30, .22, .0022]],
  ['street-paving', ['stone', .26, .12, .0024]],
  ['street-curb', ['stone', .32, .07, .0020]],
  ['street-verge', ['scanned', .29, .02, .0018]],
  ['street-soil', ['scanned', .33, .03, .0028]],
  ['plaza-inlay', ['stone', .23, .13, .0015]],
  ['courtyard-paving', ['pavers', .33, .24, .0022]],
  ['teaching-floor', ['pavers', .16, .38, .0008]],
  ['beige', ['stone', .23, .06, .0012]],
  ['terra', ['stone', .29, .08, .0014]],
  ['road', ['scanned', .35, .14, .0034]],
  ['teaching-wall', ['scanned', .10, .02, .0005]],
  ['teaching-ceiling', ['scanned', .075, .02, .0005]],
  ['soffit', ['scanned', .20, .04, .0012]],
  ['cream', ['scanned', .17, .05, .0009]],
  ['reveal', ['scanned', .19, .04, .0008]],
  ['entry-stone', ['stone', .22, .27, .0016]],
  ['entry-nosing', ['stone', .19, .20, .0012]],
  ['entry-traction', ['stone', .23, .12, .0022]],
  ['stair-stone', ['stone', .13, .27, .0011]],
  ['gallery-base-stone', ['stone', .17, .15, .0010]],
  ['curb', ['stone', .27, .09, .0026]],
  ['plinth', ['stone', .30, .10, .0018]],
  ['apron', ['stone', .34, .06, .0024]],
  ['decal-brickline', ['stone', .27, .19, .0015]],
  ['decal-paint-yellow', ['paint', .25, .12, 0]],
  ['decal-paint-white', ['paint', .21, .10, 0]],
  ['decal-sports_paint', ['paint', .14, .09, 0]],
]);

const matteGround = new Set(['road', 'street-paving', 'street-curb', 'walk', 'plaza-inlay']);

const leafTransmission = /* glsl */`
  #include <lights_physical_pars_fragment>
  void campusLeafDirect(
    const in IncidentLight light, const in vec3 position, const in vec3 normal,
    const in vec3 view, const in vec3 clearcoatNormal, const in PhysicalMaterial material,
    inout ReflectedLight result
  ) {
    RE_Direct_Physical(light, position, normal, view, clearcoatNormal, material, result);
    float backlight = max(0.0, -dot(normal, light.direction));
    float forwardScatter = max(0.0, dot(view, -light.direction));
    // Direct light already includes the shadow test. A shaded crown cannot glow on its own.
    vec3 transmitted = BRDF_Lambert(material.diffuseColor * vec3(0.99, 1.15, 0.61));
    result.directDiffuse += light.color * transmitted * backlight * (0.22 + 0.34 * forwardScatter * forwardScatter);
  }
  #undef RE_Direct
  #define RE_Direct campusLeafDirect
`;

const functions = /* glsl */`
  varying vec3 vCampusSurface;
  uniform vec3 uCampusSurfaceResponse;

  float campusHash(vec2 point) {
    vec3 seed = fract(point.xyx * vec3(0.1031, 0.11369, 0.13787));
    seed += dot(seed, seed.yzx + 19.19);
    return fract((seed.x + seed.y) * seed.z);
  }

  float campusNoise(vec2 point) {
    vec2 cell = floor(point);
    vec2 t = fract(point);
    t *= t * (3.0 - 2.0 * t);
    return mix(
      mix(campusHash(cell), campusHash(cell + vec2(1.0, 0.0)), t.x),
      mix(campusHash(cell + vec2(0.0, 1.0)), campusHash(cell + 1.0), t.x),
      t.y
    );
  }

  float campusJointMask(vec2 tile, float width) {
    vec2 phase = fract(tile);
    vec2 distanceToEdge = min(phase, 1.0 - phase);
    vec2 aa = max(fwidth(tile) * .62, vec2(.0001));
    vec2 edge = (1.0 - smoothstep(vec2(width) - aa, vec2(width) + aa, distanceToEdge))
      * min(vec2(1.0), vec2(width * 2.0) / aa);
    return max(edge.x, edge.y);
  }
`;

const fields = /* glsl */`
  vec3 campusDx = dFdx(vCampusSurface);
  vec3 campusDy = dFdy(vCampusSurface);
  vec3 campusCross = cross(campusDx, campusDy);
  vec3 campusNormal = campusCross * inversesqrt(max(1e-18, dot(campusCross, campusCross)));
  float campusUp = smoothstep(.30, .88, campusNormal.y);
  float campusWall = 1.0 - smoothstep(.14, .72, abs(campusNormal.y));
  vec2 campusWallUv = vec2(vCampusSurface.x + .84 * vCampusSurface.z, vCampusSurface.y);
  vec2 campusPlane = mix(vCampusSurface.xz, campusWallUv, campusWall);
  float campusFootprint = max(length(campusDx), length(campusDy));

  // Three bands have different uses. Long gradients suppress the 3 m scan
  // repetition, mid-scale soil follows runoff, and grit fades before aliasing.
  float campusLarge = campusNoise(campusPlane * .205 + 8.5);
  float campusMedium = campusNoise(campusPlane * vec2(1.22 + campusWall * 2.30, 1.22 - campusWall * .87) - 9.7);
  float campusFineFade = 1.0 - smoothstep(.013, .048, campusFootprint);
  float campusGritFade = 1.0 - smoothstep(.0035, .015, campusFootprint);
  float campusGrit = .5;
  float campusGrain = .5;
  if (campusFineFade > 0.0) {
    campusGrain = mix(.5, campusNoise(campusPlane * 48.0 + 17.3), campusFineFade);
    if (campusGritFade > 0.0) {
      campusGrit = mix(.5, campusNoise(campusPlane * 126.0 - 5.2), campusGritFade);
    }
  }
  float campusGroundSplash = campusWall * (1.0 - smoothstep(.12, .82, vCampusSurface.y));
  float campusSoil = smoothstep(.34, .77, campusLarge * .57 + campusMedium * .43 + campusGroundSplash * .15);
  float campusWear = smoothstep(.40, .74, campusLarge * .45 + (1.0 - campusMedium) * .55) * campusUp;
  float campusJoint = 0.0;
  float campusTileShade = .5;

  #if defined(USE_MAP) && defined(CAMPUS_PAVERS)
    // Keep the paving joint response aligned with the stone scan.
    vec2 campusTile = vMapUv * 5.0 - vec2(.477, 0.0);
    campusJoint = campusJointMask(campusTile, .012);
    float campusSlabFade = 1.0 - smoothstep(.05, .21, campusFootprint);
    campusTileShade = mix(.5, campusHash(floor(campusTile) + 23.7), campusSlabFade * (1.0 - campusJoint));
  #endif

  #ifdef CAMPUS_SCANNED
    // Warp unjointed scans coherently in all channels, preserving the scale
    // of the scan while breaking up long repeated patches on plaster and asphalt.
    vec2 campusScanShift = (vec2(campusLarge, campusNoise(campusPlane * .173 + 57.1)) - .5) * .85;
    #ifdef USE_MAP
      vec2 campusMapUv = vMapUv + campusScanShift;
      #define vMapUv campusMapUv
    #endif
  #endif
`;

const surfaceColor = /* glsl */`
  #if defined(CAMPUS_SCANNED) && defined(USE_MAP)
    #undef vMapUv
  #endif
  float campusTint = (campusLarge - .5) * .092 + (campusTileShade - .5) * .102;
  float campusAggregate = smoothstep(.61, .88, campusGrain * .62 + campusGrit * .38);
  float campusPores = 1.0 - smoothstep(.19, .42, campusGrain * .53 + campusGrit * .47);
  float campusDirt = uCampusSurfaceResponse.x * campusSoil * (.77 + .50 * campusJoint);
  diffuseColor.rgb *= (1.035 + campusTint + .087 * campusAggregate - .118 * campusPores)
    * mix(vec3(1.0), vec3(.67, .63, .58), campusDirt * 2.02);

  #ifdef CAMPUS_PAINT
    float campusChip = campusGrain * .65 + campusGrit * .35;
    // Paint only, so a rare chip reveals the real pavement underneath.
    if (campusFineFade > .65 && campusChip < .25 + .095 * campusSoil) discard;
    diffuseColor.rgb *= .88 + .17 * smoothstep(.27, .76, campusChip);
  #endif
`;

const surfaceRoughness = /* glsl */`
  #if defined(CAMPUS_SCANNED) && defined(USE_ROUGHNESSMAP)
    #undef vRoughnessMapUv
  #endif
  roughnessFactor = clamp(roughnessFactor + campusDirt * .38 + campusJoint * .10
    + campusPores * .045 - campusWear * uCampusSurfaceResponse.y, .22, .98);
`;

const surfaceNormal = /* glsl */`
  #if defined(CAMPUS_SCANNED) && defined(USE_NORMALMAP_TANGENTSPACE)
    #undef vNormalMapUv
  #endif
  #ifndef CAMPUS_PAINT
    // Screen derivatives express the grain as a shallow height field in metres,
    // without displacing the paved surface or changing its collision geometry.
    float campusHeight = (campusGrain * .57 + campusGrit * .43) * uCampusSurfaceResponse.z;
    vec3 campusViewX = dFdx(-vViewPosition);
    vec3 campusViewY = dFdy(-vViewPosition);
    vec3 campusPerpX = cross(campusViewY, nonPerturbedNormal);
    vec3 campusPerpY = cross(nonPerturbedNormal, campusViewX);
    float campusDet = dot(campusViewX, campusPerpX);
    vec3 campusSlope = sign(campusDet) * (dFdx(campusHeight) * campusPerpX
      + dFdy(campusHeight) * campusPerpY) / max(abs(campusDet), 1e-8);
    normal = normalize(normal - campusSlope / max(1.0, 2.3 * length(campusSlope)));
  #endif
`;

/** Add metre-scale color, roughness, and relief layers over the measured material maps. */
export function applyCampusWeathering(material: MeshStandardMaterial) {
  if (material.name.startsWith('decal-street-leaf-') || material.name.startsWith('decal-leaf-spray-')) {
    const previousCompile = material.onBeforeCompile;
    const previousKey = material.customProgramCacheKey();
    material.onBeforeCompile = (shader, renderer) => {
      previousCompile.call(material, shader, renderer);
      shader.fragmentShader = shader.fragmentShader.replace('#include <lights_physical_pars_fragment>', leafTransmission);
    };
    material.customProgramCacheKey = () => `${previousKey}|campus-leaf-transmission`;
    return;
  }
  const response = surfaces.get(material.name);
  if (!response) return;
  const [family, soil, polish, relief] = response;
  const matte = matteGround.has(material.name);
  const previousCompile = material.onBeforeCompile;
  const previousKey = material.customProgramCacheKey();
  material.onBeforeCompile = (shader, renderer) => {
    previousCompile.call(material, shader, renderer);
    shader.uniforms.uCampusSurfaceResponse = { value: [soil, polish, relief] };
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vCampusSurface;')
      .replace('#include <project_vertex>', `
        #include <project_vertex>
        vCampusSurface = (modelMatrix * vec4(transformed, 1.0)).xyz;
      `);
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `#include <common>\n#define CAMPUS_${family.toUpperCase()}\n${functions}`)
      .replace('#include <map_fragment>', `${fields}\n#include <map_fragment>\n${surfaceColor}`)
      .replace('#include <roughnessmap_fragment>', `
        #if defined(CAMPUS_SCANNED) && defined(USE_ROUGHNESSMAP)
          vec2 campusRoughnessUv = vRoughnessMapUv + campusScanShift;
          #define vRoughnessMapUv campusRoughnessUv
        #endif
        #include <roughnessmap_fragment>
        ${surfaceRoughness}
      `)
      .replace('#include <normal_fragment_maps>', `
        #if defined(CAMPUS_SCANNED) && defined(USE_NORMALMAP_TANGENTSPACE)
          vec2 campusNormalUv = vNormalMapUv + campusScanShift;
          #define vNormalMapUv campusNormalUv
        #endif
        #include <normal_fragment_maps>
        ${surfaceNormal}
      `);
    if (matte) {
      // Preserve diffuse scan detail where grazing light would wash out dry paving.
      shader.fragmentShader = shader.fragmentShader.replace('#include <lights_fragment_end>', `
        #include <lights_fragment_end>
        reflectedLight.directSpecular *= .14;
        reflectedLight.indirectSpecular *= .22;
      `);
    }
  };
  material.customProgramCacheKey = () => `${previousKey}|campus-surface-v2:${family}:${matte}`;
}
