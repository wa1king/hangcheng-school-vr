import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { loadCampus, type CampusPoint } from './campus.ts';
import { createInput, type Mode } from './input.ts';
import { createLandingQuery } from './landing.ts';
import { createXrLocomotion } from './xr-locomotion.ts';
import type { PlayerController } from './exploration/player.ts';
import './style.css';

const get = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;
const app = get('app');
const surface = get('viewport');
const notice = get('notice');
const infoButton = get<HTMLButtonElement>('about');
const info = get('about-panel');
const fullscreen = get<HTMLButtonElement>('fullscreen');
const vr = get<HTMLButtonElement>('vr');
const locations = get<HTMLSelectElement>('location');
const modeButtons = [...app.querySelectorAll<HTMLButtonElement>('.mode-controls [data-mode]')];
const reset = get<HTMLButtonElement>('reset');
const controlsHint = get('controls-hint');
const diagnostics = get('diagnostics');
const debug = new URLSearchParams(window.location.search).has('debug');
const eyeHeight = 1.64;
const euler = new THREE.Euler(0, 0, 0, 'YXZ');
const forward = new THREE.Vector3();
const right = new THREE.Vector3();
const direction = new THREE.Vector3();
const lastSafeFeet = new THREE.Vector3();
const lastOrientation = new THREE.Quaternion();
const xrLocomotion = createXrLocomotion();
const point = new THREE.Vector3();
const orbitOffset = new THREE.Vector3();

let mode: Mode = 'overview';
let campus: Awaited<ReturnType<typeof loadCampus>> | undefined;
let player: PlayerController | undefined;
let landingQuery: ReturnType<typeof createLandingQuery> | undefined;
let renderer: THREE.WebGLRenderer;
let yaw = 0;
let pitch = 0;
let savedWalkYaw = 0;
let savedWalkPitch = 0;
let finished = false;
let lastFrame: number | undefined;
let xrSession: XRSession | undefined;
let landingNotice = '';
let landingNoticeTimer: number | undefined;

const scene = new THREE.Scene();
scene.background = new THREE.Color('#b9d5e7');
const camera = new THREE.PerspectiveCamera(57, 1, .07, 1600);
const rig = new THREE.Group();
rig.add(camera);
scene.add(rig);

const orbit = new OrbitControls(camera, surface);
orbit.enabled = false;
orbit.enableDamping = true;
orbit.dampingFactor = .095;
orbit.maxPolarAngle = Math.PI / 2 - .035;
orbit.minDistance = 5;
orbit.zoomSpeed = .95;
orbit.rotateSpeed = .6;
orbit.enablePan = true;

function directionFromCamera() {
  euler.setFromQuaternion(camera.quaternion, 'YXZ');
  yaw = euler.y;
  pitch = euler.x;
}

function look(dx: number, dy: number) {
  if (mode === 'overview' || xrSession) return;
  yaw -= dx * .003;
  pitch = THREE.MathUtils.clamp(pitch - dy * .003, -1.49, 1.49);
}

const input = createInput({
  surface,
  movePad: get('move-pad'),
  thumb: get('move-thumb'),
  lifts: get('vertical-buttons'),
  mode: () => mode,
  setMode,
  reset: resetView,
  look,
  onDeviceChange: updateHud,
});

function updateHud() {
  const ready = Boolean(campus && finished);
  app.dataset.mode = mode;
  for (const button of modeButtons) {
    const buttonMode = button.dataset.mode;
    button.disabled = !ready || (buttonMode === 'walk' && !player);
    button.setAttribute('aria-pressed', String(mode === buttonMode));
  }
  reset.disabled = !ready;
  get('reticle').hidden = !ready || mode === 'overview' || input.touch;
  get('move-pad').hidden = !ready || mode === 'overview' || !input.touch;
  get('vertical-buttons').hidden = !ready || mode !== 'fly' || !input.touch;
  controlsHint.hidden = !ready;
  if (!ready) return;
  const desktop: Record<Mode, string> = {
    overview: '拖动旋转 · 滚轮缩放 · 右键拖动平移',
    walk: 'WASD 移动 · 拖动看向四周 · 双击锁定视角',
    fly: 'WASD 移动 · E 上升 · Q 下降 · 拖动转向',
  };
  const touch: Record<Mode, string> = {
    overview: '单指旋转 · 双指缩放和平移',
    walk: '左侧摇杆移动 · 拖动看向四周',
    fly: '左侧摇杆移动 · 拖动转向',
  };
  controlsHint.textContent = landingNotice || (input.touch ? touch : desktop)[mode];
}

const overviewScale = (aspect: number) => Math.max(1, 1.05 / aspect);

function showOverview() {
  if (!campus) return;
  const config = campus.manifest.overview;
  const span = Math.max(campus.size.x, campus.size.z, campus.size.y, 12);
  if (config) {
    orbit.target.fromArray(config.target);
    camera.position.fromArray(config.position);
  } else {
    orbit.target.copy(campus.center);
    camera.position.copy(campus.center).add(point.set(span * .55, span * .65, span * .68));
  }
  camera.position.copy(orbitOffset.subVectors(camera.position, orbit.target).multiplyScalar(overviewScale(camera.aspect)).add(orbit.target));
  orbit.minDistance = Math.max(3, span * .025);
  orbit.maxDistance = Math.max(span * 3, camera.position.distanceTo(orbit.target) * 1.6);
  camera.lookAt(orbit.target);
  orbit.update();
}

function updateWalkCamera() {
  if (!player) return;
  camera.position.copy(player.position);
  camera.position.y += eyeHeight;
}

function resetFeet(at: CampusPoint) {
  point.fromArray(at.position);
  player?.teleport(point);
  lastSafeFeet.copy(point);
  savedWalkYaw = at.yaw ?? 0;
  savedWalkPitch = at.pitch ?? 0;
  yaw = savedWalkYaw;
  pitch = savedWalkPitch;
}

function clearLandingNotice() {
  window.clearTimeout(landingNoticeTimer);
  landingNotice = '';
}

function resetView() {
  if (!campus || xrSession) return;
  clearLandingNotice();
  updateHud();
  input.releaseAll();
  if (mode === 'overview') {
    showOverview();
    return;
  }
  resetFeet(campus.manifest.spawn);
  if (mode === 'walk') updateWalkCamera();
  else {
    camera.position.fromArray(campus.manifest.spawn.position);
    camera.position.y += Math.max(10, campus.size.y * .6);
    pitch = -.20;
  }
}

function setMode(next: Mode, destination?: CampusPoint) {
  if (!finished || !campus || xrSession || (next === 'walk' && !player) || (next === mode && !destination)) return;
  const previous = mode;
  clearLandingNotice();
  if (mode === 'walk') {
    savedWalkYaw = yaw;
    savedWalkPitch = pitch;
  }
  input.releaseAll();
  if (document.pointerLockElement === surface) document.exitPointerLock();
  if (next === 'fly') directionFromCamera();
  mode = next;
  orbit.enabled = next === 'overview';
  if (next === 'overview') showOverview();
  if (next === 'walk' && player) {
    if (destination) resetFeet(destination);
    else {
      const landing = previous === 'fly' ? landingQuery?.(camera.position) : undefined;
      if (landing) {
        player.teleport(landing);
        lastSafeFeet.copy(landing);
        pitch = THREE.MathUtils.clamp(pitch, -.5, .5);
      } else {
        player.teleport(lastSafeFeet);
        yaw = savedWalkYaw;
        pitch = savedWalkPitch;
        if (previous === 'fly' && landingQuery) {
          landingNotice = '这里没有合适的落脚处，已回到上次步行位置';
          landingNoticeTimer = window.setTimeout(() => {
            landingNotice = '';
            updateHud();
          }, 3000);
        }
      }
    }
    updateWalkCamera();
  }
  updateHud();
}

function moveToLocation() {
  const choice = campus?.manifest.locations?.find(item => item.id === locations.value);
  if (!choice || xrSession) return;
  if (player) {
    setMode('walk', choice);
  } else {
    setMode('fly');
    camera.position.fromArray(choice.position);
    camera.position.y += eyeHeight + 2;
    yaw = choice.yaw ?? 0;
    pitch = choice.pitch ?? -.12;
  }
  locations.value = '';
  surface.focus({ preventScroll: true });
}

function lightCampus() {
  if (!campus) return;
  const span = Math.max(campus.size.x, campus.size.z, 30);
  scene.fog = new THREE.Fog('#b9d5e7', span * 1.9, span * 7);
  camera.far = Math.max(600, span * 8);
  camera.updateProjectionMatrix();
  const backdropWidth = Math.max(3000, span * 16);
  const backdrop = new THREE.Mesh(
    new THREE.PlaneGeometry(backdropWidth, backdropWidth),
    new THREE.MeshStandardMaterial({ color: '#708355', roughness: 1 }),
  );
  backdrop.rotation.x = -Math.PI / 2;
  backdrop.position.set(campus.center.x, campus.bounds.min.y - .36, campus.center.z);
  scene.add(backdrop);
  const sky = new THREE.HemisphereLight('#e8f2fc', '#a9a189', 2.05);
  const sun = new THREE.DirectionalLight('#fff0d5', 2.9);
  sun.position.copy(campus.center).add(point.set(-span * .7, span * .95, -span * .48));
  sun.target.position.copy(campus.center);
  sun.castShadow = true;
  const shadowSize = input.touch ? 1024 : 2048;
  sun.shadow.mapSize.set(shadowSize, shadowSize);
  const radius = Math.max(campus.size.length() * .55, 15);
  Object.assign(sun.shadow.camera, { left: -radius, right: radius, top: radius, bottom: -radius, near: .1, far: span * 3.6 });
  sun.shadow.camera.updateProjectionMatrix();
  sun.shadow.bias = -.00015;
  sun.shadow.normalBias = .10;
  sun.shadow.intensity = .65;
  scene.add(sky, sun, sun.target);
  renderer.shadowMap.needsUpdate = true;
}

function resize() {
  const width = surface.clientWidth;
  const height = surface.clientHeight;
  if (!width || !height) return;
  const previousScale = overviewScale(camera.aspect);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  if (campus && mode === 'overview') {
    const scale = overviewScale(camera.aspect) / previousScale;
    camera.position.copy(orbitOffset.subVectors(camera.position, orbit.target).multiplyScalar(scale).add(orbit.target));
    orbit.maxDistance = Math.max(orbit.maxDistance, camera.position.distanceTo(orbit.target) * 1.6);
    orbit.update();
  }
  if (!renderer || xrSession) return;
  renderer.setPixelRatio(Math.min(devicePixelRatio, input.touch ? 1.5 : 2));
  renderer.setSize(width, height, false);
}

function moveFlat(dt: number) {
  euler.set(pitch, yaw, 0, 'YXZ');
  camera.quaternion.setFromEuler(euler);
  forward.set(-Math.sin(yaw), 0, -Math.cos(yaw));
  right.set(Math.cos(yaw), 0, -Math.sin(yaw));
  direction.copy(forward).multiplyScalar(input.ahead).addScaledVector(right, input.side);
  direction.clampLength(0, 1);
  if (mode === 'walk' && player) {
    player.update(dt, direction, input.running, input.jumping);
    if (player.grounded) lastSafeFeet.copy(player.position);
    if (campus && player.position.y < campus.bounds.min.y - 8) player.teleport(lastSafeFeet);
    updateWalkCamera();
    return;
  }
  const speed = input.running ? 22 : 9;
  camera.position.addScaledVector(direction, dt * speed);
  camera.position.y += THREE.MathUtils.clamp(input.lift, -1, 1) * speed * dt;
  if (!campus) return;
  const padding = Math.max(25, Math.max(campus.size.x, campus.size.z) * .4);
  camera.position.x = THREE.MathUtils.clamp(camera.position.x, campus.bounds.min.x - padding, campus.bounds.max.x + padding);
  camera.position.z = THREE.MathUtils.clamp(camera.position.z, campus.bounds.min.z - padding, campus.bounds.max.z + padding);
  camera.position.y = THREE.MathUtils.clamp(camera.position.y, campus.bounds.min.y + .8, campus.bounds.max.y + padding * 2);
}

function moveXR(dt: number, frame?: XRFrame) {
  if (!player || !xrSession || !frame) return;
  const space = renderer.xr.getReferenceSpace();
  const viewerPose = space && frame.getViewerPose(space);
  if (!viewerPose) return;
  xrLocomotion(viewerPose.transform.orientation, rig.rotation.y, xrSession.inputSources, direction);
  player.update(dt, direction, false, false);
  if (player.grounded) lastSafeFeet.copy(player.position);
  if (campus && player.position.y < campus.bounds.min.y - 8) player.teleport(lastSafeFeet);
  rig.position.copy(player.position);
}

async function initializeVR() {
  if (!navigator.xr || !player || !window.isSecureContext) return;
  try {
    if (!(await navigator.xr.isSessionSupported('immersive-vr'))) return;
    vr.hidden = false;
  } catch {
    // Headset permission or hardware may be unavailable.
  }
}

async function enterVR() {
  if (!player || !navigator.xr || xrSession) return;
  vr.disabled = true;
  try {
    const session = await navigator.xr.requestSession('immersive-vr', { requiredFeatures: ['local-floor'] });
    setMode('walk');
    xrSession = session;
    input.releaseAll();
    rig.position.copy(player.position);
    rig.rotation.y = yaw;
    lastOrientation.copy(camera.quaternion);
    camera.position.set(0, 0, 0);
    camera.quaternion.identity();
    session.addEventListener('end', () => {
      xrSession = undefined;
      rig.position.set(0, 0, 0);
      rig.rotation.y = 0;
      camera.quaternion.copy(lastOrientation);
      updateWalkCamera();
      vr.disabled = false;
      queueMicrotask(resize);
    }, { once: true });
    await renderer.xr.setSession(session);
  } catch (error) {
    if (xrSession) void xrSession.end().catch(() => {});
    vr.disabled = false;
    console.warn('未能进入头显 VR', error);
    controlsHint.textContent = '暂时无法进入头显，请检查浏览器的 VR 连接。';
  }
}

function frame(time: number, xrFrame?: XRFrame) {
  const dt = Math.min(.1, lastFrame === undefined ? 0 : (time - lastFrame) / 1000);
  lastFrame = time;
  if (finished) {
    if (xrSession) moveXR(dt, xrFrame);
    else if (mode === 'overview') orbit.update(dt);
    else moveFlat(dt);
  }
  renderer.render(scene, camera);
  if (debug) {
    const coords = camera.position.toArray().map(value => value.toFixed(2)).join(', ');
    const { calls, triangles } = renderer.info.render;
    diagnostics.textContent = `${mode}${mode === 'walk' && player?.grounded ? ' grounded' : ''}\n${coords}\n${calls} draws · ${triangles.toLocaleString()} tris\nheading ${yaw.toFixed(3)}`;
  }
}

function toggleInfo(force?: boolean) {
  const show = force ?? info.hidden;
  info.hidden = !show;
  infoButton.setAttribute('aria-expanded', String(show));
}

function configureInfo(manifest: NonNullable<typeof campus>['manifest'], manifestURL: URL) {
  get('campus-title').textContent = manifest.title;
  document.title = `${manifest.title} · 3D 校园`;
  get('campus-status').textContent = manifest.status ?? '3D 校园';
  get('description').textContent = manifest.description ?? manifest.status ?? '可从总览、飞行和步行视角查看校园场景。';
  if (manifest.evidenceUrl) {
    const url = new URL(manifest.evidenceUrl, manifestURL);
    if (url.protocol === 'https:' || url.protocol === 'http:') {
      const evidence = get<HTMLAnchorElement>('evidence');
      evidence.href = url.href;
      evidence.hidden = false;
    }
  }
  for (const location of manifest.locations ?? []) locations.add(new Option(location.label, location.id));
  get('location-wrap').hidden = locations.options.length < 2;
}

async function initialize() {
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance', logarithmicDepthBuffer: true });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.autoUpdate = false;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.xr.enabled = true;
    renderer.xr.setReferenceSpaceType('local-floor');
    surface.tabIndex = 0;
    surface.appendChild(renderer.domElement);
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(surface);
    resize();
    renderer.setAnimationLoop(frame);
    diagnostics.hidden = !debug;
    fullscreen.hidden = !document.fullscreenEnabled;

    campus = await loadCampus();
    scene.add(campus.visuals);
    lightCampus();
    showOverview();
    configureInfo(campus.manifest, campus.manifestURL);
    if (campus.collision.children.length) {
      try {
        const { createPlayerController } = await import('./exploration/player.ts');
        player = await createPlayerController(
          campus.collision,
          new THREE.Vector3().fromArray(campus.manifest.spawn.position),
          { object: new THREE.Group(), updateMotion() {}, dispose() {} },
        );
        if (campus.manifest.landingBoundary) landingQuery = createLandingQuery(campus.collision, campus.manifest.landingBoundary);
      } catch (error) {
        console.warn('校园碰撞载入失败', error);
        get('description').append(' 本次载入未启用步行。');
      }
    }
    if (!player && campus.collision.children.length === 0) get('description').append(' 当前场景支持总览与飞行。');
    resetFeet(campus.manifest.spawn);
    finished = true;
    notice.hidden = true;
    updateHud();
    void initializeVR();
  } catch (error) {
    console.error(error);
    get('loading-mark').hidden = true;
    get('notice-title').textContent = '场景未能加载';
    get('notice-detail').textContent = error instanceof Error ? error.message : '请重新加载页面。';
    get('retry').hidden = false;
  }
}

for (const button of modeButtons) {
  button.addEventListener('click', () => {
    setMode(button.dataset.mode as Mode);
    surface.focus({ preventScroll: true });
  });
}
reset.addEventListener('click', () => {
  resetView();
  surface.focus({ preventScroll: true });
});
infoButton.addEventListener('click', () => toggleInfo());
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !info.hidden) {
    toggleInfo(false);
    infoButton.focus();
  }
});
fullscreen.addEventListener('click', async () => {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await app.requestFullscreen();
  } catch {
    // Some embedded browsers disallow fullscreen.
  }
});
document.addEventListener('fullscreenchange', () => {
  fullscreen.lastChild!.textContent = document.fullscreenElement ? '退出全屏' : '全屏';
});
vr.addEventListener('click', () => void enterVR());
locations.addEventListener('change', moveToLocation);
get('retry').addEventListener('click', () => window.location.reload());
window.addEventListener('pagehide', event => {
  if (event.persisted) return;
  player?.dispose();
  orbit.dispose();
  if (!renderer) return;
  renderer.setAnimationLoop(null);
  renderer.dispose();
});
void initialize();
