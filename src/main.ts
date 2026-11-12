import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { loadCampus, type CampusPoint } from './campus.ts';
import { createCampusGroundReflection } from './campus-ground.ts';
import { createCampusLighting } from './campus-lighting.ts';
import { createCampusRenderer } from './campus-render.ts';
import { createInput, type Mode } from './input.ts';
import { createLandingQuery } from './landing.ts';
import { createXrLocomotion } from './xr-locomotion.ts';
import { createTourAvatar, type TourCharacter } from './tour-avatar.ts';
import { createTourCamera, eyeHeight } from './tour-camera.ts';
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
const avatarControls = get('avatar-controls');
const avatarButtons = [...avatarControls.querySelectorAll<HTMLButtonElement>('[data-avatar]')];
const viewToggle = get<HTMLButtonElement>('view-toggle');
const viewLabel = viewToggle.querySelector<HTMLElement>('.view-label')!;
const reset = get<HTMLButtonElement>('reset');
const controlsHint = get('controls-hint');
const diagnostics = get('diagnostics');
const query = new URLSearchParams(window.location.search);
const debug = query.has('debug');
const contactOcclusion = !debug || query.get('occlusion') !== '0';
const groundReflections = !debug || query.get('reflection') !== '0';
const forward = new THREE.Vector3();
const right = new THREE.Vector3();
const direction = new THREE.Vector3();
const lastSafeFeet = new THREE.Vector3();
const previousFeet = new THREE.Vector3();
const flightFeet = new THREE.Vector3();
const flightGoal = new THREE.Vector3();
const xrLocomotion = createXrLocomotion();
const point = new THREE.Vector3();
const orbitOffset = new THREE.Vector3();

let mode: Mode = 'overview';
let campus: Awaited<ReturnType<typeof loadCampus>> | undefined;
let player: PlayerController | undefined;
let landingQuery: ReturnType<typeof createLandingQuery> | undefined;
let renderer: THREE.WebGLRenderer;
let lighting: ReturnType<typeof createCampusLighting> | undefined;
let pavement: ReturnType<typeof createCampusGroundReflection> | undefined;
let campusRenderer: ReturnType<typeof createCampusRenderer>;
let yaw = 0;
let pitch = 0;
let avatarHeading = 0;
let firstPerson = false;
let selectedAvatar: TourCharacter = 'taoqi';
let savedWalkYaw = 0;
let savedWalkPitch = 0;
let finished = false;
let firstFramePresented = false;
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
const tourAvatar = createTourAvatar();
const updateCamera = createTourCamera(camera);
tourAvatar.object.visible = false;
tourAvatar.object.traverse(object => {
  if (object instanceof THREE.Mesh) object.receiveShadow = true;
});
scene.add(tourAvatar.object);

const orbit = new OrbitControls(camera, surface);
orbit.enabled = false;
orbit.enableDamping = true;
orbit.dampingFactor = .095;
orbit.maxPolarAngle = Math.PI / 2 - .035;
orbit.minDistance = 5;
orbit.zoomSpeed = .95;
orbit.rotateSpeed = .6;
orbit.enablePan = true;

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
  avatarControls.hidden = !ready || Boolean(xrSession);
  viewToggle.hidden = !ready || mode === 'overview' || Boolean(xrSession);
  viewToggle.setAttribute('aria-pressed', String(firstPerson));
  viewLabel.textContent = firstPerson ? '第一人称' : '跟随视角';
  for (const button of avatarButtons) {
    button.setAttribute('aria-pressed', String(button.dataset.avatar === selectedAvatar));
  }
  get('reticle').hidden = !ready || mode === 'overview' || input.touch || !firstPerson;
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

function updateTourView(dt: number, speed = 0, lift = 0, snap = false) {
  const feet = mode === 'walk' ? player?.position : flightFeet;
  if (!feet || mode === 'overview' || xrSession) {
    tourAvatar.object.visible = false;
    return;
  }
  tourAvatar.object.position.copy(feet);
  tourAvatar.update(dt, mode, speed, avatarHeading, lift);
  tourAvatar.object.visible = updateCamera(feet, yaw, pitch, mode === 'fly', firstPerson, dt, snap, player?.constrainCamera);
}

function resetFeet(at: CampusPoint) {
  point.fromArray(at.position);
  player?.teleport(point);
  lastSafeFeet.copy(point);
  savedWalkYaw = at.yaw ?? 0;
  savedWalkPitch = at.pitch ?? 0;
  yaw = savedWalkYaw;
  pitch = savedWalkPitch;
  avatarHeading = yaw - .42;
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
  if (mode === 'fly') {
    flightFeet.fromArray(campus.manifest.spawn.position);
    flightFeet.y += Math.max(10, campus.size.y * .6);
    pitch = -.20;
  }
  updateTourView(0, 0, 0, true);
}

function setMode(next: Mode, destination?: CampusPoint) {
  if (!finished || !campus || xrSession || (next === 'walk' && !player) || (next === mode && !destination)) return;
  const previous = mode;
  clearLandingNotice();
  let landing: THREE.Vector3 | undefined;
  if (previous === 'fly' && next === 'walk' && !destination && player) {
    landing = campus.manifest.collisionFromModels
      ? player.findLanding(flightFeet)
      : landingQuery?.(point.copy(flightFeet).addScaledVector(camera.up, eyeHeight));
    if (!landing && (campus.manifest.collisionFromModels || landingQuery)) {
      landingNotice = '脚下没有足够的落脚空间';
      landingNoticeTimer = window.setTimeout(() => {
        landingNotice = '';
        updateHud();
      }, 3000);
      updateHud();
      return;
    }
  }
  if (mode === 'walk') {
    savedWalkYaw = yaw;
    savedWalkPitch = pitch;
  }
  input.releaseAll();
  if (document.pointerLockElement === surface) document.exitPointerLock();
  if (next === 'fly') {
    if (previous === 'walk' && player) {
      flightFeet.copy(player.position);
    } else {
      flightFeet.fromArray(campus.manifest.spawn.position);
      flightFeet.y += Math.max(10, campus.size.y * .6);
      yaw = campus.manifest.spawn.yaw ?? 0;
      pitch = -.22;
      avatarHeading = yaw - .42;
    }
  }
  mode = next;
  orbit.enabled = next === 'overview';
  if (next === 'overview') showOverview();
  if (next === 'walk' && player) {
    if (destination) resetFeet(destination);
    else if (landing) {
      player.teleport(landing);
      lastSafeFeet.copy(landing);
      pitch = THREE.MathUtils.clamp(pitch, -.5, .5);
    } else {
      player.teleport(lastSafeFeet);
      yaw = savedWalkYaw;
      pitch = savedWalkPitch;
    }
  }
  updateTourView(0, 0, 0, true);
  updateHud();
}

function moveToLocation() {
  const choice = campus?.manifest.locations?.find(item => item.id === locations.value);
  if (!choice || xrSession) return;
  if (player) {
    setMode('walk', choice);
  } else {
    setMode('fly');
    flightFeet.fromArray(choice.position);
    flightFeet.y += 2;
    yaw = choice.yaw ?? 0;
    pitch = choice.pitch ?? -.12;
    avatarHeading = yaw - .42;
    updateTourView(0, 0, 0, true);
  }
  locations.value = '';
  surface.focus({ preventScroll: true });
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
  forward.set(-Math.sin(yaw), 0, -Math.cos(yaw));
  right.set(Math.cos(yaw), 0, -Math.sin(yaw));
  direction.copy(forward).multiplyScalar(input.ahead).addScaledVector(right, input.side);
  direction.clampLength(0, 1);
  if (mode === 'walk' && player) {
    previousFeet.copy(player.position);
    player.update(dt, direction, input.running, input.jumping);
    if (player.grounded) lastSafeFeet.copy(player.position);
    if (campus && player.position.y < campus.bounds.min.y - 8) player.teleport(lastSafeFeet);
    updateTourView(dt, updateAvatarHeading(player.position, dt));
    return;
  }
  if (!campus) return;
  previousFeet.copy(flightFeet);
  const speed = input.running ? 22 : 9;
  const lift = THREE.MathUtils.clamp(input.lift, -1, 1);
  const usesModelCollision = campus.manifest.collisionFromModels && player;
  const padding = usesModelCollision ? 0 : Math.max(25, Math.max(campus.size.x, campus.size.z) * .4);
  flightGoal.copy(flightFeet).addScaledVector(direction, dt * speed);
  if (!usesModelCollision) {
    flightGoal.x = THREE.MathUtils.clamp(flightGoal.x, campus.bounds.min.x - padding, campus.bounds.max.x + padding);
    flightGoal.z = THREE.MathUtils.clamp(flightGoal.z, campus.bounds.min.z - padding, campus.bounds.max.z + padding);
  }
  flightFeet.copy(player?.constrainFlight(flightFeet, flightGoal) ?? flightGoal);
  flightGoal.copy(flightFeet);
  flightGoal.y += lift * speed * dt;
  if (!usesModelCollision) {
    flightGoal.y = THREE.MathUtils.clamp(flightGoal.y, campus.bounds.min.y + .02, campus.bounds.max.y + padding * 2);
  }
  flightFeet.copy(player?.constrainFlight(flightFeet, flightGoal) ?? flightGoal);
  updateTourView(dt, updateAvatarHeading(flightFeet, dt), lift);
}

function updateAvatarHeading(feet: THREE.Vector3, dt: number) {
  const dx = feet.x - previousFeet.x;
  const dz = feet.z - previousFeet.z;
  const speed = dt > 0 ? Math.hypot(dx, dz) / dt : 0;
  if (speed > .08) avatarHeading = Math.atan2(-dx, -dz);
  return speed;
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
    tourAvatar.object.visible = false;
    updateHud();
    rig.position.copy(player.position);
    rig.rotation.y = yaw;
    camera.position.set(0, 0, 0);
    camera.quaternion.identity();
    session.addEventListener('end', () => {
      xrSession = undefined;
      rig.position.set(0, 0, 0);
      rig.rotation.y = 0;
      updateTourView(0, 0, 0, true);
      vr.disabled = false;
      updateHud();
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
  const feet = mode === 'walk' ? player?.position : mode === 'fly' ? flightFeet : undefined;
  const ground = feet && tourAvatar.object.visible ? player?.groundSurface(feet) : undefined;
  lighting?.update(mode, feet, ground, firstFramePresented);
  pavement?.update(camera, time, finished && mode === 'walk');
  if (finished && mode !== 'overview' && !input.touch && !renderer.xr.isPresenting && campusRenderer) {
    campusRenderer.render(scene, camera);
  } else {
    renderer.render(scene, camera);
  }
  if (!firstFramePresented) {
    firstFramePresented = true;
    notice.hidden = true;
  }
  if (debug) {
    const coords = camera.position.toArray().map(value => value.toFixed(2)).join(', ');
    const { calls, triangles } = renderer.info.render;
    const avatarCoords = (mode === 'overview' ? player?.position : feet)?.toArray().map(value => value.toFixed(2)).join(', ') ?? '—';
    const view = mode === 'overview' ? 'overview' : tourAvatar.object.visible ? 'follow' : 'eyes';
    diagnostics.textContent = `${mode}${mode === 'walk' && player?.grounded ? ' grounded' : ''}\n${coords}\n${calls} draws · ${triangles.toLocaleString()} tris\nheading ${yaw.toFixed(3)}\navatar ${avatarCoords}\nview ${view}\nmirror ${pavement?.active ? 'on' : 'off'} · ${pavement?.passes ?? 0} captures`;
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
    const pendingPlayer = import('./exploration/player.ts').then(async controller => {
      await controller.preparePlayerPhysics();
      return controller;
    }).catch((loadError: unknown) => ({ loadError }));
    renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance', logarithmicDepthBuffer: true });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.AgXToneMapping;
    renderer.toneMappingExposure = 1.04;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.autoUpdate = false;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.xr.enabled = true;
    renderer.xr.setReferenceSpaceType('local-floor');
    if (!input.touch && contactOcclusion) campusRenderer = createCampusRenderer(renderer);
    surface.tabIndex = 0;
    surface.appendChild(renderer.domElement);
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(surface);
    resize();
    diagnostics.hidden = !debug;
    fullscreen.hidden = !document.fullscreenEnabled;

    campus = await loadCampus();
    scene.add(campus.visuals);
    lighting = createCampusLighting(scene, camera, renderer, campus, input.touch);
    pavement = createCampusGroundReflection(renderer, scene, campus.visuals, groundReflections && !input.touch);
    configureInfo(campus.manifest, campus.manifestURL);
    if (campus.collision.children.length) {
      try {
        const controller = await pendingPlayer;
        if ('loadError' in controller) throw controller.loadError;
        player = await controller.createPlayerController(
          campus.collision,
          new THREE.Vector3().fromArray(campus.manifest.spawn.position),
          { object: new THREE.Group(), updateMotion() {}, dispose() {} },
          campus.manifest.collisionFromModels,
        );
        if (!campus.manifest.collisionFromModels && campus.manifest.landingBoundary) {
          landingQuery = createLandingQuery(campus.collision, campus.manifest.landingBoundary);
        }
      } catch (error) {
        console.warn('校园碰撞载入失败', error);
        get('description').append(' 本次载入未启用步行。');
      }
    }
    if (!player && campus.collision.children.length === 0) get('description').append(' 当前场景支持总览与飞行。');
    resetFeet(campus.manifest.spawn);
    finished = true;
    if (player) setMode('walk');
    else {
      showOverview();
      updateHud();
    }
    renderer.setAnimationLoop(frame);
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
for (const button of avatarButtons) {
  button.addEventListener('click', () => {
    selectedAvatar = button.dataset.avatar === 'xiaoxiao' ? 'xiaoxiao' : 'taoqi';
    tourAvatar.select(selectedAvatar);
    updateHud();
    surface.focus({ preventScroll: true });
  });
}
viewToggle.addEventListener('click', () => {
  firstPerson = !firstPerson;
  updateTourView(0, 0, 0, true);
  updateHud();
  surface.focus({ preventScroll: true });
});
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
  lighting?.dispose();
  pavement?.dispose();
  campusRenderer?.dispose();
  tourAvatar.dispose();
  orbit.dispose();
  if (!renderer) return;
  renderer.setAnimationLoop(null);
  renderer.dispose();
});
void initialize();
