import * as THREE from 'three';

const fullscreenVertex = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const depthFunctions = `
  uniform sampler2D tDepth;
  uniform vec2 uProjection;
  uniform vec2 uTexel;
  uniform float uLogFar;

  vec2 pixelCenter(vec2 uv) {
    vec2 center = (floor(uv / uTexel) + 0.5) * uTexel;
    return clamp(center, uTexel * 0.5, 1.0 - uTexel * 0.5);
  }

  float distanceAt(vec2 uv) {
    // WebGLRenderer stores log2(1 + view distance) for a perspective camera.
    return exp2(texture2D(tDepth, pixelCenter(uv)).r * uLogFar) - 1.0;
  }

  vec3 positionAt(vec2 uv, float distance) {
    return vec3((pixelCenter(uv) * 2.0 - 1.0) * distance / uProjection, -distance);
  }
`;

const occlusionFragment = `
  varying vec2 vUv;
  ${depthFunctions}

  vec3 adjacent(vec2 uv, vec2 texel, float distance) {
    float a = distanceAt(uv - texel);
    float b = distanceAt(uv + texel);
    vec3 p = positionAt(uv, distance);
    return abs(a - distance) < abs(b - distance)
      ? p - positionAt(uv - texel, a)
      : positionAt(uv + texel, b) - p;
  }

  float contribution(vec2 uv, vec3 center, vec3 normal, float radius) {
    vec3 delta = positionAt(uv, distanceAt(uv)) - center;
    float separation = length(delta);
    float height = dot(normal, delta);
    float horizon = max(height - 0.018, 0.0) / max(0.001, separation);
    return max(horizon - 0.085, 0.0) * (1.0 - smoothstep(0.12, radius, separation));
  }

  void main() {
    float distance = distanceAt(vUv);
    if (distance > 105.0 || distance < 0.05) {
      gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
      return;
    }
    vec3 p = positionAt(vUv, distance);
    vec3 dx = adjacent(vUv, vec2(uTexel.x * 2.0, 0.0), distance);
    vec3 dy = adjacent(vUv, vec2(0.0, uTexel.y * 2.0), distance);
    vec3 crossNormal = cross(dx, dy);
    vec3 normal = crossNormal * inversesqrt(max(1e-12, dot(crossNormal, crossNormal)));
    if (dot(normal, p) > 0.0) normal = -normal;
    float radius = mix(0.56, 0.96, smoothstep(3.0, 42.0, distance));
    vec2 scale = uProjection * (radius * 0.5 / distance);
    float occlusion = 0.0;
    for (int i = 0; i < 8; i++) {
      float a = float(i) * 0.78539816 + 0.19634954;
      vec2 stepUv = vec2(cos(a), sin(a)) * scale;
      float nearby = contribution(vUv + stepUv * 0.32, p, normal, radius);
      float farther = contribution(vUv + stepUv * 0.79, p, normal, radius);
      occlusion += max(nearby, farther);
    }
    occlusion = min(0.55, occlusion * 0.2375);
    gl_FragColor = vec4(occlusion, 0.0, 0.0, 1.0);
  }
`;

const compositeFragment = `
  varying vec2 vUv;
  uniform sampler2D tColor;
  uniform sampler2D tOcclusion;
  uniform vec2 uOcclusionSize;
  uniform float uCameraResponse;
  ${depthFunctions}

  float lumaOf(vec3 color) {
    return sqrt(max(0.0, dot(color, vec3(0.2126, 0.7152, 0.0722))));
  }

  // Keep a single depth sample at the pixel center, then smooth color edges.
  vec3 antialiasedColor(vec2 uv, out float highlightSpill) {
    vec3 center = texture2D(tColor, uv).rgb;
    float a = lumaOf(texture2D(tColor, uv + vec2(-1.0, -1.0) * uTexel).rgb);
    float b = lumaOf(texture2D(tColor, uv + vec2( 1.0, -1.0) * uTexel).rgb);
    float c = lumaOf(texture2D(tColor, uv + vec2(-1.0,  1.0) * uTexel).rgb);
    float d = lumaOf(texture2D(tColor, uv + vec2( 1.0,  1.0) * uTexel).rgb);
    float middle = lumaOf(center);
    float neighbourLight = (a * a + b * b + c * c + d * d) * 0.25;
    highlightSpill = clamp(neighbourLight - max(1.25, middle * middle + 0.12), 0.0, 0.7);
    float minimum = min(middle, min(min(a, b), min(c, d)));
    float maximum = max(middle, max(max(a, b), max(c, d)));
    if (maximum - minimum < max(0.045, maximum * 0.12)) return center;
    vec2 direction = vec2(c + d - a - b, a + c - b - d);
    float reduction = max(0.0078, (a + b + c + d) * 0.03125);
    direction = clamp(direction / (min(abs(direction.x), abs(direction.y)) + reduction), -6.0, 6.0) * uTexel;
    vec3 inner = 0.5 * (texture2D(tColor, uv - direction / 6.0).rgb + texture2D(tColor, uv + direction / 6.0).rgb);
    vec3 outer = inner * 0.5 + 0.25 * (texture2D(tColor, uv - direction * 0.5).rgb + texture2D(tColor, uv + direction * 0.5).rgb);
    float value = lumaOf(outer);
    return (value < minimum || value > maximum) ? inner : outer;
  }

  float weightedOcclusion(vec2 uv, float distance, float bilinear, inout float total) {
    float depthDifference = abs(distanceAt(uv) - distance);
    float limit = 0.13 + distance * 0.008;
    float weight = bilinear * (1.0 - smoothstep(limit, limit * 2.6, depthDifference));
    total += weight;
    return texture2D(tOcclusion, uv).r * weight;
  }

  void main() {
    float highlightSpill;
    vec3 color = antialiasedColor(vUv, highlightSpill);
    if (uCameraResponse > 0.0) {
      // Use the same neighbouring samples as antialiasing, with no extra pass.
      vec2 lens = vUv * 2.0 - 1.0;
      float edge = 1.0 - 0.055 * smoothstep(0.34, 1.58, dot(lens, lens));
      color = (color + vec3(1.0, 0.95, 0.88) * highlightSpill * 0.032) * edge;
    }
    float depth = texture2D(tDepth, vUv).r;
    if (depth < 0.99999) {
      float distance = distanceAt(vUv);
      if (distance < 105.0) {
        vec2 texel = 1.0 / uOcclusionSize;
        vec2 index = vUv * uOcclusionSize - 0.5;
        vec2 corner = (floor(index) + 0.5) * texel;
        vec2 blend = fract(index);
        float total = 0.0;
        float ao = weightedOcclusion(corner, distance, (1.0 - blend.x) * (1.0 - blend.y), total);
        ao += weightedOcclusion(corner + vec2(texel.x, 0.0), distance, blend.x * (1.0 - blend.y), total);
        ao += weightedOcclusion(corner + vec2(0.0, texel.y), distance, (1.0 - blend.x) * blend.y, total);
        ao += weightedOcclusion(corner + texel, distance, blend.x * blend.y, total);
        float luma = dot(color, vec3(0.2126, 0.7152, 0.0722));
        color *= 1.0 - ao / max(0.01, total) * mix(0.91, 0.58, smoothstep(0.28, 1.28, luma));
      }
      gl_FragColor = vec4(color, 1.0);
      #include <tonemapping_fragment>
    } else {
      // The sky shader already owns its display response.
      gl_FragColor = vec4(color, 1.0);
    }
    if (uCameraResponse > 0.0) {
      float pixel = fract(dot(gl_FragCoord.xy, vec2(0.1031, 0.11369)));
      float dither = fract(pixel * (pixel + 17.71)) - 0.5;
      gl_FragColor.rgb = max(vec3(0.0), gl_FragColor.rgb + dither * 0.0026);
    }
    #include <colorspace_fragment>
  }
`;

/**
 * Half-resolution contact occlusion reuses the main color pass's depth.
 * Overview, mobile and immersive VR can use the same lighting without this pass.
 */
export function createCampusRenderer(renderer: THREE.WebGLRenderer, cameraResponse: boolean) {
  if (!renderer.extensions.has('EXT_color_buffer_float')) return undefined;

  const beauty = new THREE.WebGLRenderTarget(1, 1, {
    type: THREE.HalfFloatType,
    depthTexture: new THREE.DepthTexture(1, 1, THREE.UnsignedIntType),
  });
  const ambient = new THREE.WebGLRenderTarget(1, 1, {
    depthBuffer: false,
    minFilter: THREE.NearestFilter,
    magFilter: THREE.NearestFilter,
  });
  const shared = {
    tDepth: { value: beauty.depthTexture },
    uProjection: { value: new THREE.Vector2() },
    uTexel: { value: new THREE.Vector2() },
    uLogFar: { value: 0 },
  };
  const aoMaterial = new THREE.ShaderMaterial({
    uniforms: shared,
    vertexShader: fullscreenVertex,
    fragmentShader: occlusionFragment,
    depthTest: false, depthWrite: false, toneMapped: false,
  });
  const outputMaterial = new THREE.ShaderMaterial({
    uniforms: {
      ...shared,
      tColor: { value: beauty.texture },
      tOcclusion: { value: ambient.texture },
      uOcclusionSize: { value: new THREE.Vector2() },
      uCameraResponse: { value: cameraResponse ? 1 : 0 },
    },
    vertexShader: fullscreenVertex,
    fragmentShader: compositeFragment,
    depthTest: false, depthWrite: false,
  });
  const passScene = new THREE.Scene();
  const passCamera = new THREE.OrthographicCamera();
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), aoMaterial);
  quad.frustumCulled = false;
  passScene.add(quad);
  const buffer = new THREE.Vector2();

  return {
    render(scene: THREE.Scene, camera: THREE.PerspectiveCamera) {
      renderer.getDrawingBufferSize(buffer);
      const scale = Math.min(1, Math.sqrt(3_500_000 / (buffer.x * buffer.y)));
      const width = Math.max(1, Math.floor(buffer.x * scale));
      const height = Math.max(1, Math.floor(buffer.y * scale));
      if (beauty.width !== width || beauty.height !== height) {
        const w = Math.max(1, Math.floor(width * 0.5));
        const h = Math.max(1, Math.floor(height * 0.5));
        beauty.setSize(width, height);
        ambient.setSize(w, h);
        shared.uTexel.value.set(1 / width, 1 / height);
        outputMaterial.uniforms.uOcclusionSize.value.set(w, h);
      }
      shared.uProjection.value.set(camera.projectionMatrix.elements[0], camera.projectionMatrix.elements[5]);
      shared.uLogFar.value = Math.log2(camera.far + 1);
      const autoReset = renderer.info.autoReset;
      renderer.info.reset();
      renderer.info.autoReset = false;
      try {
        renderer.setRenderTarget(beauty);
        renderer.render(scene, camera);
        renderer.setRenderTarget(ambient);
        quad.material = aoMaterial;
        renderer.render(passScene, passCamera);
        renderer.setRenderTarget(null);
        quad.material = outputMaterial;
        renderer.render(passScene, passCamera);
      } finally {
        renderer.setRenderTarget(null);
        renderer.info.autoReset = autoReset;
      }
    },
    dispose() {
      beauty.dispose();
      ambient.dispose();
      quad.geometry.dispose();
      aoMaterial.dispose();
      outputMaterial.dispose();
    },
  };
}
