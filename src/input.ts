export type Mode = 'overview' | 'walk' | 'fly';

const movementKeys = new Set(['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowLeft', 'ArrowDown', 'ArrowRight', 'ShiftLeft', 'ShiftRight', 'Space', 'KeyE', 'KeyQ', 'ControlLeft', 'ControlRight']);

export function createInput(options: {
  surface: HTMLElement;
  movePad: HTMLElement;
  thumb: HTMLElement;
  lifts: HTMLElement;
  mode: () => Mode;
  setMode: (mode: Mode) => void;
  reset: () => void;
  look: (x: number, y: number) => void;
  onDeviceChange: () => void;
}) {
  const { surface, movePad, thumb, lifts } = options;
  const keys = new Set<string>();
  const touchQuery = matchMedia('(pointer: coarse)');
  let touch = touchQuery.matches;
  let drag: { id: number; x: number; y: number } | null = null;
  let joystick: number | null = null;
  let stickX = 0;
  let stickY = 0;
  let lift = 0;

  function releaseJoystick() {
    joystick = null;
    stickX = 0;
    stickY = 0;
    thumb.style.transform = '';
  }

  function releaseAll() {
    keys.clear();
    drag = null;
    lift = 0;
    releaseJoystick();
  }

  function setTouch(value: boolean) {
    if (value === touch) return;
    touch = value;
    options.onDeviceChange();
  }

  function moveJoystick(event: PointerEvent) {
    const rect = movePad.getBoundingClientRect();
    const radius = rect.width * .31;
    const x = (event.clientX - rect.left - rect.width / 2) / radius;
    const y = (event.clientY - rect.top - rect.height / 2) / radius;
    const magnitude = Math.hypot(x, y);
    const range = Math.max(1, magnitude);
    stickX = magnitude > .08 ? x / range : 0;
    stickY = magnitude > .08 ? -y / range : 0;
    thumb.style.transform = `translate(${stickX * radius}px, ${-stickY * radius}px)`;
  }

  touchQuery.addEventListener('change', event => setTouch(event.matches));
  window.addEventListener('pointerdown', event => {
    if (event.pointerType === 'touch') setTouch(true);
    else if (event.pointerType === 'mouse' && !touchQuery.matches) setTouch(false);
  });
  surface.addEventListener('pointerdown', event => {
    if (options.mode() === 'overview' || event.button !== 0 || document.pointerLockElement === surface) return;
    if (drag) return;
    drag = { id: event.pointerId, x: event.clientX, y: event.clientY };
    surface.setPointerCapture(event.pointerId);
  });
  surface.addEventListener('pointermove', event => {
    if (event.pointerId !== drag?.id) return;
    options.look(event.clientX - drag.x, event.clientY - drag.y);
    drag.x = event.clientX;
    drag.y = event.clientY;
  });
  for (const end of ['pointerup', 'pointercancel', 'lostpointercapture'] as const) {
    surface.addEventListener(end, event => {
      if (event.pointerId === drag?.id) drag = null;
    });
    movePad.addEventListener(end, event => {
      if (event.pointerId === joystick) releaseJoystick();
    });
  }
  surface.addEventListener('dblclick', () => {
    if (options.mode() === 'overview' || touch || !surface.requestPointerLock) return;
    try {
      const result = surface.requestPointerLock();
      result?.catch(() => {});
    } catch {
      // Drag-look remains available when the browser declines pointer lock.
    }
  });
  document.addEventListener('mousemove', event => {
    if (document.pointerLockElement === surface) options.look(event.movementX, event.movementY);
  });
  movePad.addEventListener('pointerdown', event => {
    if (joystick !== null) return;
    joystick = event.pointerId;
    movePad.setPointerCapture(event.pointerId);
    moveJoystick(event);
  });
  movePad.addEventListener('pointermove', event => {
    if (event.pointerId === joystick) moveJoystick(event);
  });

  for (const button of lifts.querySelectorAll<HTMLButtonElement>('button')) {
    const direction = Number(button.dataset.lift);
    let pointer: number | null = null;
    button.addEventListener('pointerdown', event => {
      if (pointer !== null) return;
      pointer = event.pointerId;
      button.setPointerCapture(event.pointerId);
      lift = direction;
    });
    for (const end of ['pointerup', 'pointercancel', 'lostpointercapture'] as const) {
      button.addEventListener(end, event => {
        if (event.pointerId !== pointer) return;
        pointer = null;
        if (lift === direction) lift = 0;
      });
    }
  }
  window.addEventListener('keydown', event => {
    if (event.target instanceof HTMLElement && event.target.closest('input, select, textarea, button, a, [contenteditable]')) return;
    if (event.ctrlKey || event.metaKey || event.altKey) {
      if (event.code !== 'ControlLeft' && event.code !== 'ControlRight') return;
    }
    if (movementKeys.has(event.code) && options.mode() !== 'overview') {
      event.preventDefault();
      keys.add(event.code);
    }
    if (event.repeat) return;
    if (event.code === 'Digit1') options.setMode('overview');
    if (event.code === 'Digit2') options.setMode('walk');
    if (event.code === 'Digit3') options.setMode('fly');
    if (event.code === 'KeyR') options.reset();
  });
  window.addEventListener('keyup', event => keys.delete(event.code));
  window.addEventListener('blur', releaseAll);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) releaseAll();
  });

  const down = (...codes: string[]) => codes.some(code => keys.has(code));
  return {
    get touch() { return touch; },
    get side() { return Number(down('KeyD', 'ArrowRight')) - Number(down('KeyA', 'ArrowLeft')) + stickX; },
    get ahead() { return Number(down('KeyW', 'ArrowUp')) - Number(down('KeyS', 'ArrowDown')) + stickY; },
    get lift() { return Number(down('Space', 'KeyE')) - Number(down('ControlLeft', 'ControlRight', 'KeyQ')) + lift; },
    get running() { return down('ShiftLeft', 'ShiftRight'); },
    get jumping() { return down('Space'); },
    releaseAll,
  };
}
