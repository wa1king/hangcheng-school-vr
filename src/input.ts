export type Mode = 'overview' | 'walk' | 'fly';

const movementKeys = new Set(['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ShiftLeft', 'ShiftRight', 'Space', 'KeyE', 'KeyQ', 'ControlLeft', 'ControlRight']);

type PointerPosition = { x: number; y: number };

export function createInput(options: {
  surface: HTMLElement;
  movePad: HTMLElement;
  thumb: HTMLElement;
  lifts: HTMLElement;
  mode: () => Mode;
  setMode: (mode: Mode) => void;
  reset: () => void;
  turn: (step: -1 | 1) => void;
  zoom: (scale: number) => void;
  onDeviceChange: () => void;
}) {
  const { surface, movePad, thumb, lifts } = options;
  const keys = new Set<string>();
  const touchQuery = matchMedia('(pointer: coarse)');
  let touch = touchQuery.matches;
  const touches = new Map<number, PointerPosition>();
  let drag: (PointerPosition & { id: number }) | null = null;
  let pinchDistance = 0;
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
    touches.clear();
    pinchDistance = 0;
    lift = 0;
    releaseJoystick();
  }

  function distanceBetweenTouches() {
    if (touches.size !== 2) return 0;
    const [first, second] = touches.values();
    return Math.max(8, Math.hypot(first.x - second.x, first.y - second.y));
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
    if (event.button !== 0) return;
    const position = { x: event.clientX, y: event.clientY };
    if (event.pointerType === 'touch') {
      if (touches.size === 0) drag = { id: event.pointerId, ...position };
      else drag = null;
      touches.set(event.pointerId, position);
      pinchDistance = distanceBetweenTouches();
    } else {
      if (drag || touches.size > 0) return;
      drag = { id: event.pointerId, ...position };
    }
    surface.setPointerCapture(event.pointerId);
  });
  surface.addEventListener('pointermove', event => {
    const position = touches.get(event.pointerId);
    if (!position) return;
    position.x = event.clientX;
    position.y = event.clientY;
    const nextDistance = distanceBetweenTouches();
    if (nextDistance && pinchDistance && options.mode() !== 'overview') {
      options.zoom(nextDistance / pinchDistance);
    }
    pinchDistance = nextDistance;
  });
  for (const end of ['pointerup', 'pointercancel', 'lostpointercapture'] as const) {
    surface.addEventListener(end, event => {
      if (touches.delete(event.pointerId)) pinchDistance = distanceBetweenTouches();
      if (event.pointerId !== drag?.id) return;
      const dx = event.clientX - drag.x;
      const dy = event.clientY - drag.y;
      drag = null;
      if (end === 'pointerup' && Math.abs(dx) >= 36 && Math.abs(dx) > Math.abs(dy) * 1.2) {
        options.turn(dx < 0 ? -1 : 1);
      }
    });
    movePad.addEventListener(end, event => {
      if (event.pointerId === joystick) releaseJoystick();
    });
  }
  surface.addEventListener('wheel', event => {
    if (options.mode() === 'overview' || !event.deltaY) return;
    event.preventDefault();
    const unit = event.deltaMode === WheelEvent.DOM_DELTA_LINE ? 16
      : event.deltaMode === WheelEvent.DOM_DELTA_PAGE ? surface.clientHeight : 1;
    const distance = Math.max(-160, Math.min(160, event.deltaY * unit));
    options.zoom(Math.exp(-distance * .002));
  }, { passive: false });
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
    if (event.code === 'ArrowLeft' || event.code === 'ArrowRight') {
      event.preventDefault();
      if (!event.repeat) options.turn(event.code === 'ArrowLeft' ? -1 : 1);
      return;
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
    get side() { return Number(down('KeyD')) - Number(down('KeyA')) + stickX; },
    get ahead() { return Number(down('KeyW', 'ArrowUp')) - Number(down('KeyS', 'ArrowDown')) + stickY; },
    get lift() { return Number(down('Space', 'KeyE')) - Number(down('ControlLeft', 'ControlRight', 'KeyQ')) + lift; },
    get running() { return down('ShiftLeft', 'ShiftRight'); },
    get jumping() { return down('Space'); },
    releaseAll,
  };
}
