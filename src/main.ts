import * as THREE from 'three';
import { loadCampus, type CampusPoint } from './campus.ts';
import { createCampusTravelLimit, type CampusTravelLimit } from './campus-boundary.ts';
import { createCampusGroundReflection } from './campus-ground.ts';
import { createCampusLighting } from './campus-lighting.ts';
import { createCampusRenderer } from './campus-render.ts';
import type { createStreetLife } from './campus-street-life.ts';
import { createInput, type Mode } from './input.ts';
import { createLandingQuery } from './landing.ts';
import { createXrLocomotion } from './xr-locomotion.ts';
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
const places = get('places');
const placesToggle = get<HTMLButtonElement>('places-toggle');
const compass = get<HTMLButtonElement>('compass');
const compassLabel = get('compass-label');
const reset = get<HTMLButtonElement>('reset');
const controlsHint = get('controls-hint');
const diagnostics = get('diagnostics');
const query = new URLSearchParams(window.location.search);
const debug = query.has('debug');
const contactOcclusion = !debug || query.get('occlusion') !== '0';
const cameraResponse = !debug || query.get('camera') !== '0';
const groundReflections = !debug || query.get('reflection') !== '0';
// View yaw is measured from north and grows to the left, so bearings run the other way.
const bearings = ['北', '东北', '东', '东南', '南', '西南', '西', '西北'];
const quarterTurn = Math.PI / 2;
const lookLimit = 1.25;
const lookRate = .0045; // Radians per CSS pixel, so a hand-width drag turns about a quarter.
const takeoffClimb = 7;
const forward = new THREE.Vector3();
const right = new THREE.Vector3();
const direction = new THREE.Vector3();
const lastSafeFeet = new THREE.Vector3();
const flightFeet = new THREE.Vector3();
const flightGoal = new THREE.Vector3();
const xrLocomotion = createXrLocomotion();
const point = new THREE.Vector3();

let mode: Mode = 'walk';
let campus: Awaited<ReturnType<typeof loadCampus>> | undefined;
let player: PlayerController | undefined;
let travelLimit: CampusTravelLimit | undefined;
let landingQuery: ReturnType<typeof createLandingQuery> | undefined;
let renderer: THREE.WebGLRenderer;
let lighting: ReturnType<typeof createCampusLighting> | undefined;
let streetLife: ReturnType<typeof createStreetLife> | undefined;
let pavement: ReturnType<typeof createCampusGroundReflection> | undefined;
let campusRenderer: ReturnType<typeof createCampusRenderer>;
let viewYaw = 0;
let shownYaw = Number.NaN;
let turnMotion: { start: number; arc: number; durationMs: number; startTime: number } | undefined;
let pitch = 0;
let climb = 0;
let lastLandingProbe = 0;
let viewZoom = 1;
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
const updateCamera = createTourCamera(camera);

function startTurn(target: number) {
  if (!finished || xrSession) return;
  const arc = target - viewYaw;
  turnMotion = Math.abs(arc) < .001 ? undefined
    : { start: viewYaw, arc, durationMs: Math.max(320, 1180 * Math.abs(arc) / quarterTurn), startTime: performance.now() };
}

function advanceTurn(time: number) {
  if (!turnMotion) return;
  const progress = THREE.MathUtils.clamp((time - turnMotion.startTime) / turnMotion.durationMs, 0, 1);
  viewYaw = turnMotion.start + turnMotion.arc * (progress * progress * (3 - 2 * progress));
  if (progress === 1) turnMotion = undefined;
}

/** Turn to the next compass point, wherever the view was dragged to. */
function turn(step: -1 | 1) {
  const quarters = -(turnMotion ? turnMotion.start + turnMotion.arc : viewYaw) / quarterTurn;
  startTurn(-(step > 0 ? Math.floor(quarters + 1.001) : Math.ceil(quarters - 1.001)) * quarterTurn);
}

function faceNorth() {
  startTurn(viewYaw - (THREE.MathUtils.euclideanModulo(viewYaw + Math.PI, Math.PI * 2) - Math.PI));
}

function look(dx: number, dy: number) {
  if (!finished || xrSession) return;
  turnMotion = undefined;
  const rate = lookRate / camera.zoom;
  viewYaw -= dx * rate;
  pitch = THREE.MathUtils.clamp(pitch - dy * rate, -lookLimit, lookLimit);
}

function directionYaw() {
  return (campus?.manifest.northYaw ?? 0) + viewYaw;
}

function setCameraZoom() {
  camera.zoom = viewZoom;
  camera.updateProjectionMatrix();
}

function zoom(scale: number) {
  if (!finished || xrSession || !Number.isFinite(scale) || scale <= 0) return;
  viewZoom = THREE.MathUtils.clamp(viewZoom * scale, .78, 2.5);
  setCameraZoom();
}

const input = createInput({
  surface,
  movePad: get('move-pad'),
  thumb: get('move-thumb'),
  lever: get('lift-lever'),
  leverThumb: get('lift-thumb'),
  toggleFlight,
  reset: resetView,
  turn,
  look,
  zoom,
  onDeviceChange: updateHud,
});

function updateCompass() {
  if (viewYaw === shownYaw) return;
  shownYaw = viewYaw;
  compass.style.setProperty('--turn', `${viewYaw.toFixed(4)}rad`);
  const facing = `朝${bearings[THREE.MathUtils.euclideanModulo(Math.round(-viewYaw / (quarterTurn / 2)), bearings.length)]}`;
  if (compassLabel.textContent !== facing) compassLabel.textContent = facing;
}

function updateHud() {
  const ready = Boolean(campus && finished);
  const touring = ready && !xrSession;
  app.dataset.mode = mode;
  reset.disabled = !touring;
  placesToggle.disabled = !touring;
  if (!touring) togglePlaces(false);
  compass.hidden = !touring;
  get('move-pad').hidden = !touring;
  get('lift-lever').hidden = !touring || !player;
  controlsHint.hidden = !ready;
  if (!ready) return;
  const desktop: Record<Mode, string> = {
    walk: '拖动画面转视角 · WASD 或摇杆移动 · 推杆向上或按 E 起飞',
    fly: '飞行中 · 推杆或 E、Q 升降 · 降到地面自动落地',
  };
  const touch: Record<Mode, string> = {
    walk: '拖动画面转视角 · 摇杆移动 · 推杆向上起飞',
    fly: '飞行中 · 推杆升降 · 降到地面自动落地',
  };
  controlsHint.textContent = landingNotice || (input.touch ? touch : desktop)[mode];
}

function constrainTravel(from: THREE.Vector3, to: THREE.Vector3) {
  const fraction = travelLimit?.(from.x, from.z, to.x, to.z) ?? 1;
  to.x = from.x + (to.x - from.x) * fraction;
  to.z = from.z + (to.z - from.z) * fraction;
}

function updateTourView() {
  const feet = mode === 'walk' ? player?.position : flightFeet;
  if (feet && !xrSession) updateCamera(feet, directionYaw(), pitch);
}

function faceLocation(at: CampusPoint, defaultPitch = 0) {
  const north = campus?.manifest.northYaw ?? 0;
  viewYaw = (at.yaw ?? north) - north;
  turnMotion = undefined;
  pitch = at.pitch ?? defaultPitch;
}

function resetFeet(at: CampusPoint) {
  point.fromArray(at.position);
  player?.teleport(point);
  lastSafeFeet.copy(point);
  faceLocation(at);
}

/** Without walkable collision the tour stays in the air above a place. */
function hoverAbove(at: CampusPoint, height: number, defaultPitch: number) {
  flightFeet.fromArray(at.position);
  flightFeet.y += height;
  faceLocation(at, defaultPitch);
}

function clearLandingNotice() {
  window.clearTimeout(landingNoticeTimer);
  landingNotice = '';
}

function resetView() {
  if (!campus || xrSession) return;
  viewZoom = 1;
  setCameraZoom();
  goTo(campus.manifest.spawn);
}

function goTo(at: CampusPoint) {
  if (!campus || xrSession) return;
  if (player) {
    setMode('walk', at);
  } else {
    clearLandingNotice();
    input.releaseAll();
    hoverAbove(at, at === campus.manifest.spawn ? Math.max(10, campus.size.y * .6) : 2, -.2);
    updateTourView();
    updateHud();
  }
}

function findLanding() {
  if (!campus || !player) return undefined;
  return campus.manifest.collisionFromModels
    ? player.findLanding(flightFeet)
    : landingQuery?.(point.copy(flightFeet).addScaledVector(camera.up, eyeHeight));
}

function setMode(next: Mode, destination?: CampusPoint, landing?: THREE.Vector3) {
  if (!finished || !campus || xrSession || !player || (next === mode && !destination)) return;
  clearLandingNotice();
  if (mode === 'fly' && next === 'walk' && !destination && !landing) {
    landing = findLanding();
    if (!landing && (campus.manifest.collisionFromModels || landingQuery)) {
      landingNotice = '脚下没有足够的落脚空间，换个位置再落地';
      landingNoticeTimer = window.setTimeout(() => {
        landingNotice = '';
        updateHud();
      }, 3000);
      updateHud();
      return;
    }
  }
  // A jump to another place drops held controls. Taking off or landing on the
  // spot keeps them, so the lever and joystick carry straight through.
  if (destination) input.releaseAll();
  climb = 0;
  if (next === 'fly') flightFeet.copy(player.position);
  mode = next;
  if (next === 'walk') {
    if (destination) resetFeet(destination);
    else {
      player.teleport(landing ?? lastSafeFeet);
      if (landing) lastSafeFeet.copy(landing);
    }
  }
  updateTourView();
  updateHud();
}

/** The F key lifts off with a short rise, or sets down where the visitor hovers. */
function toggleFlight() {
  const flying = mode === 'fly';
  setMode(flying ? 'walk' : 'fly');
  if (!flying && mode === 'fly') climb = takeoffClimb;
}

function togglePlaces(force?: boolean) {
  const show = force ?? places.hidden;
  if (show) toggleInfo(false);
  places.hidden = !show;
  placesToggle.setAttribute('aria-expanded', String(show));
}

function resize() {
  const width = surface.clientWidth;
  const height = surface.clientHeight;
  if (!width || !height) return;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  if (!renderer || xrSession) return;
  renderer.setPixelRatio(Math.min(devicePixelRatio, input.touch ? 1.5 : 2));
  renderer.setSize(width, height, false);
}

function readMovement() {
  const yaw = directionYaw();
  forward.set(-Math.sin(yaw), 0, -Math.cos(yaw));
  right.set(Math.cos(yaw), 0, -Math.sin(yaw));
  direction.copy(forward).multiplyScalar(input.ahead).addScaledVector(right, input.side);
  direction.clampLength(0, 1);
}

function moveFlat(dt: number, time: number) {
  readMovement();
  if (mode === 'walk' && player && input.takeoff) setMode('fly');
  if (mode === 'walk' && player) {
    player.update(dt, direction, input.running, input.jumping);
    if (player.grounded) lastSafeFeet.copy(player.position);
    if (campus && player.position.y < campus.bounds.min.y - 8) player.teleport(lastSafeFeet);
    updateTourView();
    return;
  }
  if (!campus) return;
  const speed = input.running ? 32 : 16;
  let lift = THREE.MathUtils.clamp(input.lift, -1, 1);
  if (lift) climb = 0;
  else if (climb > 0) {
    // The take-off rise eases out and yields as soon as the visitor steers the height.
    const rise = Math.min(climb, Math.max(.6, climb * 2.4) * dt);
    climb -= rise;
    lift = rise / (speed * dt || 1);
  }
  const usesModelCollision = campus.manifest.collisionFromModels && player;
  const padding = usesModelCollision ? 0 : Math.max(25, Math.max(campus.size.x, campus.size.z) * .4);
  flightGoal.copy(flightFeet).addScaledVector(direction, dt * speed);
  if (travelLimit) {
    constrainTravel(flightFeet, flightGoal);
  } else if (!usesModelCollision) {
    flightGoal.x = THREE.MathUtils.clamp(flightGoal.x, campus.bounds.min.x - padding, campus.bounds.max.x + padding);
    flightGoal.z = THREE.MathUtils.clamp(flightGoal.z, campus.bounds.min.z - padding, campus.bounds.max.z + padding);
  }
  flightGoal.copy(player?.constrainFlight(flightFeet, flightGoal) ?? flightGoal);
  constrainTravel(flightFeet, flightGoal);
  flightFeet.copy(flightGoal);
  flightGoal.copy(flightFeet);
  flightGoal.y += lift * speed * dt;
  if (!usesModelCollision) {
    flightGoal.y = THREE.MathUtils.clamp(flightGoal.y, campus.bounds.min.y + .02, campus.bounds.max.y + padding * 2);
  }
  const wanted = flightFeet.y - flightGoal.y;
  flightFeet.copy(player?.constrainFlight(flightFeet, flightGoal) ?? flightGoal);
  // Descending onto a surface sets the visitor down and returns to walking.
  if (lift < 0 && wanted > 0 && flightFeet.y - flightGoal.y > wanted * .5 && time - lastLandingProbe > 200) {
    lastLandingProbe = time;
    const landing = findLanding();
    if (landing && flightFeet.y - landing.y < 1.2) setMode('walk', undefined, landing);
  }
  updateTourView();
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
  if (travelLimit) {
    const head = viewerPose.transform.position;
    point.set(head.x, 0, head.z).applyAxisAngle(camera.up, rig.rotation.y);
    const fraction = travelLimit(player.position.x, player.position.z,
      player.position.x + point.x, player.position.z + point.z);
    rig.position.addScaledVector(point, fraction - 1);
  }
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
    turnMotion = undefined;
    xrSession = session;
    input.releaseAll();
    updateHud();
    rig.position.copy(player.position);
    rig.rotation.y = directionYaw();
    camera.position.set(0, 0, 0);
    camera.quaternion.identity();
    session.addEventListener('end', () => {
      xrSession = undefined;
      rig.position.set(0, 0, 0);
      rig.rotation.y = 0;
      updateTourView();
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
    else {
      advanceTurn(time);
      moveFlat(dt, time);
      updateCompass();
    }
  }
  const feet = mode === 'walk' ? player?.position : flightFeet;
  lighting?.update(mode, feet, firstFramePresented, dt);
  streetLife?.(dt, xrSession ? rig.position : camera.position);
  pavement?.update(camera, time, finished && mode === 'walk');
  if (finished && !input.touch && !renderer.xr.isPresenting && campusRenderer) {
    campusRenderer.render(scene, camera);
  } else {
    renderer.render(scene, camera);
  }
  if (!firstFramePresented) {
    firstFramePresented = true;
    notice.hidden = true;
    if (campus) {
      const { visuals, manifestURL, manifest } = campus;
      void campus.loadSurroundings().then(async context => {
        visuals.add(context);
        const { createStreetLife } = await import('./campus-street-life.ts');
        streetLife = createStreetLife(context, manifestURL, manifest.streetRoutes,
          vehicles => lighting?.addStreetReflections(vehicles));
      }).catch(error => console.warn('校园周边场景载入失败', error));
    }
  }
  if (debug) {
    const coords = camera.position.toArray().map(value => value.toFixed(2)).join(', ');
    const { calls, triangles } = renderer.info.render;
    const feetCoords = feet?.toArray().map(value => value.toFixed(2)).join(', ') ?? '—';
    diagnostics.textContent = `${mode}${mode === 'walk' && player?.grounded ? ' grounded' : ''}\n${coords}\n${calls} draws · ${triangles.toLocaleString()} tris\nheading ${directionYaw().toFixed(3)}\nfeet ${feetCoords}\nfacing ${compassLabel.textContent}\nzoom ${camera.zoom.toFixed(3)}\nmirror ${pavement?.active ? 'on' : 'off'} · ${pavement?.passes ?? 0} captures`;
  }
}

function toggleInfo(force?: boolean) {
  const show = force ?? info.hidden;
  if (show) togglePlaces(false);
  info.hidden = !show;
  infoButton.setAttribute('aria-expanded', String(show));
}

function configureInfo(manifest: NonNullable<typeof campus>['manifest'], manifestURL: URL) {
  get('campus-title').textContent = manifest.title;
  document.title = `${manifest.title} · 3D 校园`;
  get('campus-status').textContent = manifest.status ?? '3D 校园';
  get('description').textContent = manifest.description ?? manifest.status ?? '可以步行或飞行查看校园场景。';
  if (manifest.evidenceUrl) {
    const url = new URL(manifest.evidenceUrl, manifestURL);
    if (url.protocol === 'https:' || url.protocol === 'http:') {
      const evidence = get<HTMLAnchorElement>('evidence');
      evidence.href = url.href;
      evidence.hidden = false;
    }
  }
  for (const location of manifest.locations ?? []) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = location.label;
    button.addEventListener('click', () => {
      togglePlaces(false);
      goTo(location);
      surface.focus({ preventScroll: true });
    });
    places.append(button);
  }
  placesToggle.hidden = !places.childElementCount;
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
    if (!input.touch && contactOcclusion) campusRenderer = createCampusRenderer(renderer, cameraResponse);
    surface.tabIndex = 0;
    surface.appendChild(renderer.domElement);
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(surface);
    resize();
    diagnostics.hidden = !debug;
    fullscreen.hidden = !document.fullscreenEnabled;

    campus = await loadCampus();
    if (campus.manifest.tourBoundary) travelLimit = createCampusTravelLimit(campus.manifest.tourBoundary);
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
          travelLimit,
        );
        if (!campus.manifest.collisionFromModels && campus.manifest.landingBoundary) {
          landingQuery = createLandingQuery(campus.collision, campus.manifest.landingBoundary);
        }
      } catch (error) {
        console.warn('校园碰撞载入失败', error);
        get('description').append(' 本次载入未启用步行。');
      }
    }
    if (!player && campus.collision.children.length === 0) get('description').append(' 当前场景支持飞行。');
    if (!player) mode = 'fly';
    finished = true;
    goTo(campus.manifest.spawn);
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

compass.addEventListener('click', () => {
  faceNorth();
  surface.focus({ preventScroll: true });
});
reset.addEventListener('click', () => {
  resetView();
  surface.focus({ preventScroll: true });
});
placesToggle.addEventListener('click', () => togglePlaces());
infoButton.addEventListener('click', () => toggleInfo());
// Touching the scene puts away whichever panel is open.
surface.addEventListener('pointerdown', () => {
  togglePlaces(false);
  toggleInfo(false);
});
document.addEventListener('keydown', event => {
  if (event.key !== 'Escape') return;
  if (!info.hidden) {
    toggleInfo(false);
    infoButton.focus();
  } else if (!places.hidden) {
    togglePlaces(false);
    placesToggle.focus();
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
get('retry').addEventListener('click', () => window.location.reload());
window.addEventListener('pagehide', event => {
  if (event.persisted) return;
  player?.dispose();
  lighting?.dispose();
  pavement?.dispose();
  campusRenderer?.dispose();
  if (!renderer) return;
  renderer.setAnimationLoop(null);
  renderer.dispose();
});
void initialize();
