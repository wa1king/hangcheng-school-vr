import { Color, EquirectangularReflectionMapping, RepeatWrapping, ShaderMaterial, BackSide } from 'three';
import { HDRLoader } from 'three/addons/loaders/HDRLoader.js';

// Poly Haven Kloofendal 38d Partly Cloudy (Pure Sky), Greg Zaal and Jarod Guest, CC0.
// The rebaked panorama places the solar disc at azimuth 145.94°, elevation 33.29°
// in Three's equirectangular coordinates, within 0.19° of the campus key light.
const skyPath = 'scene/campus-photo-sky.hdr?v=44f8af5b5dda';

export async function loadCampusPhotoSky() {
  const url = new URL(`${import.meta.env.BASE_URL}${skyPath}`, window.location.href);
  const texture = await new HDRLoader().loadAsync(url.href);
  texture.mapping = EquirectangularReflectionMapping;
  texture.wrapS = RepeatWrapping;
  texture.needsUpdate = true;

  const material = new ShaderMaterial({
    uniforms: { uSky: { value: texture }, uHorizon: { value: new Color('#bed0d9') } },
    vertexShader: /* glsl */`
      varying vec3 vSkyRay;
      void main() {
        vSkyRay = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: /* glsl */`
      #include <common>
      uniform sampler2D uSky;
      uniform vec3 uHorizon;
      varying vec3 vSkyRay;
      void main() {
        vec3 ray = normalize(vSkyRay);
        vec3 radiance = texture2D(uSky, equirectUv(ray)).rgb * 1.52;
        // Preserve bright clouds, then let the sensor highlights converge to white.
        float peak = max(1e-6, max(radiance.r, max(radiance.g, radiance.b)));
        float shoulder = peak > 0.62 ? 0.62 + 0.38 * (1.0 - exp(-(peak - 0.62) / 0.38)) : peak;
        vec3 photograph = mix(radiance * (shoulder / peak), vec3(shoulder), smoothstep(2.0, 18.0, peak));
        vec3 skyColor = mix(uHorizon, photograph, smoothstep(-0.01, 0.15, ray.y));
        gl_FragColor = vec4(skyColor, 1.0);
        #include <colorspace_fragment>
      }`,
    side: BackSide,
    depthTest: false,
    depthWrite: false,
    toneMapped: false,
  });

  return { material, texture };
}
