import { useEffect, useRef, useState } from 'react';
import { usePreferences } from '../context/PreferencesContext';
import { technologyLogos } from '../data/technologyLogos';
import TechnologyLogo from './TechnologyLogo';

// A Fibonacci distribution spreads the catalog evenly over an invisible unit sphere.
const points = technologyLogos.map((_, index) => {
  const y = 1 - 2 * (index + 0.5) / technologyLogos.length;
  const radius = Math.sqrt(1 - y * y);
  const angle = index * Math.PI * (3 - Math.sqrt(5));
  return { x: Math.cos(angle) * radius, y, z: Math.sin(angle) * radius };
});

export default function TechnologySphere() {
  const { ui } = usePreferences();
  const container = useRef<HTMLDivElement>(null);
  const phase = useRef({ yaw: 0, pitch: 0 });
  const viewRotation = useRef([1, 0, 0, 0, 1, 0, 0, 0, 1]);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const element = container.current;
    if (!element) return;
    const nodes = Array.from(element.querySelectorAll<HTMLElement>('.technology-sphere__node'));
    nodes.forEach(node => { node.querySelector('img')!.draggable = false; });
    const lines = Array.from(element.querySelectorAll<SVGLineElement>('.technology-sphere__line'));
    const dots = Array.from(element.querySelectorAll<SVGCircleElement>('.technology-sphere__dot'));
    const center = element.querySelector<SVGCircleElement>('.technology-sphere__center')!;
    const surface = element.querySelector<HTMLElement>('.technology-sphere__interaction')!;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame: number | null = null;
    let lastTime: number | null = null;
    let visible = false;
    let width = element.clientWidth;
    let height = element.clientHeight;
    const defaultSpeed = 0.00018;
    let yawSpeed = defaultSpeed;
    let pitchSpeed = 0;
    let viewYawSpeed = 0;
    let viewPitchSpeed = 0;
    let drag: { id: number; time: number; x: number; y: number; freeRotation: boolean; index: number; u: number; v: number; width: number; height: number; nodeHeight: number } | null = null;
    const zoom = 1.1;
    const cameraDistance = 2.2;
    const getRadius = () => (width <= 640 ? height * 0.37 : Math.min(width * 0.4, height * 0.42)) * zoom;

    const rotateView = (yaw: number, pitch: number) => {
      if (!yaw && !pitch) return;
      const matrix = viewRotation.current;
      const next = new Array<number>(9);
      // Compose rotations in screen axes, so repeated vertical turns never invert horizontal dragging.
      for (let column = 0; column < 3; column++) {
        const x = matrix[column] * Math.cos(yaw) + matrix[6 + column] * Math.sin(yaw);
        const y = matrix[3 + column];
        const z = matrix[6 + column] * Math.cos(yaw) - matrix[column] * Math.sin(yaw);
        next[column] = x;
        next[3 + column] = y * Math.cos(pitch) - z * Math.sin(pitch);
        next[6 + column] = y * Math.sin(pitch) + z * Math.cos(pitch);
      }
      viewRotation.current = next;
    };

    const project = (point: typeof points[number], yaw: number, pitch: number) => {
      const radius = getRadius();
      const tilt = 0.3 + Math.sin(yaw * 0.6) * 0.2 + pitch;
      const x = point.x * Math.cos(yaw) + point.z * Math.sin(yaw);
      const rotatedZ = point.z * Math.cos(yaw) - point.x * Math.sin(yaw);
      const y = point.y * Math.cos(tilt) - rotatedZ * Math.sin(tilt);
      const z = point.y * Math.sin(tilt) + rotatedZ * Math.cos(tilt);
      const matrix = viewRotation.current;
      const viewX = matrix[0] * x + matrix[1] * y + matrix[2] * z;
      const viewY = matrix[3] * x + matrix[4] * y + matrix[5] * z;
      const viewZ = matrix[6] * x + matrix[7] * y + matrix[8] * z;
      const perspective = cameraDistance / (cameraDistance - viewZ);
      return {
        px: width / 2 + viewX * radius * perspective,
        py: height / 2 + viewY * radius * perspective * 0.78,
        depth: (viewZ + 1) / 2,
        scale: 0.95 * perspective * zoom,
      };
    };

    const render = () => {
      const cx = width / 2;
      const cy = height / 2;
      const radius = getRadius();
      const hubPerspective = cameraDistance / (cameraDistance - 0.8);
      const hubY = cy - radius * 0.08 * hubPerspective;
      const yaw = phase.current.yaw;
      center.setAttribute('cx', String(cx));
      center.setAttribute('cy', String(hubY));
      center.setAttribute('r', String(4 * hubPerspective));

      points.forEach((point, index) => {
        const { px, py, depth, scale } = project(point, yaw, phase.current.pitch);
        const node = nodes[index];
        node.style.transform = `translate3d(${px}px, ${py}px, 0) translate(-50%, -100%) scale(${scale})`;
        node.style.opacity = String(0.4 + depth * 0.6);
        node.style.zIndex = String(Math.round(depth * 100) + 1);
        node.dataset.x = String(px);
        node.dataset.y = String(py);
        node.dataset.depth = String(depth);
        node.dataset.front = String(depth > 0.5);
        const line = lines[index];
        line.setAttribute('x1', String(cx));
        line.setAttribute('y1', String(hubY));
        line.setAttribute('x2', String(px));
        line.setAttribute('y2', String(py));
        line.style.opacity = String(0.12 + depth * 0.32);
        const dot = dots[index];
        dot.setAttribute('cx', String(px));
        dot.setAttribute('cy', String(py));
        dot.setAttribute('r', String(1.8 + depth * 1.2));
        dot.style.opacity = String(0.4 + depth * 0.6);
      });
    };

    const animate = (time: number) => {
      if (lastTime !== null && !drag) {
        const elapsed = Math.min(time - lastTime, 64);
        const decay = Math.exp(-elapsed / 500);
        // Integrate the decaying fling, settling back to the original automatic speed.
        phase.current.yaw += defaultSpeed * elapsed + (yawSpeed - defaultSpeed) * 500 * (1 - decay);
        phase.current.pitch += pitchSpeed * 500 * (1 - decay);
        rotateView(viewYawSpeed * 500 * (1 - decay), viewPitchSpeed * 500 * (1 - decay));
        yawSpeed = defaultSpeed + (yawSpeed - defaultSpeed) * decay;
        pitchSpeed *= decay;
        viewYawSpeed *= decay;
        viewPitchSpeed *= decay;
      }
      lastTime = time;
      render();
      frame = requestAnimationFrame(animate);
    };
    const syncAnimation = () => {
      if (frame !== null) cancelAnimationFrame(frame);
      frame = null;
      lastTime = null;
      if (!visible || paused || reducedMotion.matches || document.hidden) {
        yawSpeed = defaultSpeed;
        pitchSpeed = 0;
        viewYawSpeed = 0;
        viewPitchSpeed = 0;
      }
      if (visible && !paused && !reducedMotion.matches && !document.hidden) {
        frame = requestAnimationFrame(animate);
      }
    };
    const stopDrag = () => {
      const pointer = drag?.id;
      drag = null;
      delete surface.dataset.dragging;
      if (pointer !== undefined && surface.hasPointerCapture(pointer)) surface.releasePointerCapture(pointer);
    };
    const startDrag = (event: PointerEvent) => {
      if (!event.isPrimary || event.button !== 0 || drag) return;
      const logo = event.target instanceof HTMLImageElement ? event.target : null;
      const node = logo?.closest<HTMLElement>('.technology-sphere__node');
      if (!logo || !node || node.dataset.front !== 'true') return;
      const rect = logo.getBoundingClientRect();
      surface.setPointerCapture(event.pointerId);
      drag = {
        id: event.pointerId, time: event.timeStamp, x: event.clientX, y: event.clientY, freeRotation: false, index: nodes.indexOf(node),
        u: (event.clientX - rect.left) / rect.width, v: (event.clientY - rect.top) / rect.height,
        width: logo.offsetWidth, height: logo.offsetHeight, nodeHeight: node.offsetHeight,
      };
      yawSpeed = 0;
      pitchSpeed = 0;
      viewYawSpeed = 0;
      viewPitchSpeed = 0;
      surface.dataset.dragging = 'true';
      event.preventDefault();
    };
    const moveDrag = (event: PointerEvent) => {
      if (!drag || event.pointerId !== drag.id) return;
      const selected = drag;
      const elapsed = Math.max(event.timeStamp - selected.time, 8);
      const continueRotation = () => {
        const radius = Math.max(getRadius(), 1);
        const yaw = (event.clientX - selected.x) / radius;
        const pitch = (selected.y - event.clientY) / (radius * 0.78);
        rotateView(yaw, pitch);
        yawSpeed = defaultSpeed;
        pitchSpeed = 0;
        viewYawSpeed = Math.max(-0.0038, Math.min(0.0038, yaw / elapsed));
        viewPitchSpeed = Math.max(-0.0038, Math.min(0.0038, pitch / elapsed));
        selected.x = event.clientX;
        selected.y = event.clientY;
        selected.time = event.timeStamp;
        render();
      };
      if (selected.freeRotation) {
        continueRotation();
        return;
      }
      const box = element.getBoundingClientRect();
      const targetX = event.clientX - box.left;
      const targetY = event.clientY - box.top;
      const grabPoint = (yaw: number, pitch: number) => {
        const projection = project(points[selected.index], yaw, pitch);
        return {
          x: projection.px + (selected.u - 0.5) * selected.width * projection.scale,
          y: projection.py + (selected.v * selected.height - selected.nodeHeight) * projection.scale,
        };
      };
      const initial = { yaw: phase.current.yaw, pitch: phase.current.pitch };
      let yaw = initial.yaw;
      let pitch = initial.pitch;
      let best = { yaw, pitch, error: Infinity };
      // Solve in screen space, including perspective and the actual grab point in the logo.
      for (let iteration = 0; iteration < 12; iteration++) {
        const point = grabPoint(yaw, pitch);
        const ex = targetX - point.x;
        const ey = targetY - point.y;
        const error = Math.hypot(ex, ey);
        if (error < best.error) best = { yaw, pitch, error };
        if (error < 0.02) break;
        const epsilon = 0.0001;
        const horizontal = grabPoint(yaw + epsilon, pitch);
        const vertical = grabPoint(yaw, pitch + epsilon);
        const jx = (horizontal.x - point.x) / epsilon;
        const jy = (horizontal.y - point.y) / epsilon;
        const kx = (vertical.x - point.x) / epsilon;
        const ky = (vertical.y - point.y) / epsilon;
        const a = jx * jx + jy * jy + 0.001;
        const b = jx * kx + jy * ky;
        const c = kx * kx + ky * ky + 0.001;
        const determinant = a * c - b * b;
        const horizontalError = jx * ex + jy * ey;
        const verticalError = kx * ex + ky * ey;
        yaw += Math.max(-0.25, Math.min(0.25, (c * horizontalError - b * verticalError) / determinant));
        pitch += Math.max(-0.25, Math.min(0.25, (a * verticalError - b * horizontalError) / determinant));
      }
      // Beyond the reachable projection, keep following captured pointer deltas until release.
      if (best.error > 1) {
        selected.freeRotation = true;
        continueRotation();
        return;
      }
      phase.current.yaw = best.yaw;
      phase.current.pitch = best.pitch;
      yawSpeed = Math.max(-0.0038, Math.min(0.0038, (best.yaw - initial.yaw) / elapsed));
      pitchSpeed = Math.max(-0.0038, Math.min(0.0038, (best.pitch - initial.pitch) / elapsed));
      selected.x = event.clientX;
      selected.y = event.clientY;
      selected.time = event.timeStamp;
      render();
    };
    const finishDrag = (event: PointerEvent) => {
      if (!drag || event.pointerId !== drag.id) return;
      if (event.timeStamp - drag.time > 100) {
        yawSpeed = defaultSpeed;
        pitchSpeed = 0;
        viewYawSpeed = 0;
        viewPitchSpeed = 0;
      }
      stopDrag();
      syncAnimation();
    };
    const cancelDrag = () => {
      if (!drag) return;
      stopDrag();
      yawSpeed = defaultSpeed;
      pitchSpeed = 0;
      viewYawSpeed = 0;
      viewPitchSpeed = 0;
    };
    const rotateWithKeyboard = (event: KeyboardEvent) => {
      if (event.code === 'Space' || event.key === ' ') {
        event.preventDefault();
        if (!event.repeat) setPaused(previous => !previous);
        return;
      }
      const directions: Record<string, [number, number]> = {
        ArrowLeft: [-0.14, 0], ArrowRight: [0.14, 0], ArrowUp: [0, 0.14], ArrowDown: [0, -0.14],
      };
      const direction = directions[event.key];
      if (!direction) return;
      event.preventDefault();
      rotateView(direction[0], direction[1]);
      yawSpeed = defaultSpeed;
      pitchSpeed = 0;
      viewYawSpeed = 0;
      viewPitchSpeed = 0;
      render();
    };
    const updateVisibility = () => {
      if (document.hidden) cancelDrag();
      syncAnimation();
    };
    const resize = new ResizeObserver(() => {
      width = element.clientWidth;
      height = element.clientHeight;
      render();
    });
    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (!visible) cancelDrag();
      syncAnimation();
    });
    render();
    resize.observe(element);
    intersection.observe(element);
    reducedMotion.addEventListener('change', syncAnimation);
    document.addEventListener('visibilitychange', updateVisibility);
    element.addEventListener('pointerdown', startDrag);
    surface.addEventListener('pointermove', moveDrag);
    surface.addEventListener('pointerup', finishDrag);
    surface.addEventListener('pointercancel', cancelDrag);
    surface.addEventListener('lostpointercapture', cancelDrag);
    surface.addEventListener('keydown', rotateWithKeyboard);
    window.addEventListener('blur', cancelDrag);
    return () => {
      if (frame !== null) cancelAnimationFrame(frame);
      stopDrag();
      resize.disconnect();
      intersection.disconnect();
      reducedMotion.removeEventListener('change', syncAnimation);
      document.removeEventListener('visibilitychange', updateVisibility);
      element.removeEventListener('pointerdown', startDrag);
      surface.removeEventListener('pointermove', moveDrag);
      surface.removeEventListener('pointerup', finishDrag);
      surface.removeEventListener('pointercancel', cancelDrag);
      surface.removeEventListener('lostpointercapture', cancelDrag);
      surface.removeEventListener('keydown', rotateWithKeyboard);
      window.removeEventListener('blur', cancelDrag);
    };
  }, [paused]);

  return (
    <div ref={container} className="technology-sphere" role="region" aria-label={ui.technologies} data-paused={paused}>
      <svg className="technology-sphere__connections" aria-hidden="true" focusable="false">
        {technologyLogos.map(logo => (
          <g key={logo.name}>
            <line className="technology-sphere__line" />
            <circle className="technology-sphere__dot" />
          </g>
        ))}
        <circle className="technology-sphere__center" r="4" />
      </svg>
      <ul className="technology-sphere__logos">
        {technologyLogos.map(logo => (
          <li key={logo.name} className="technology-sphere__node"><TechnologyLogo logo={logo} /></li>
        ))}
      </ul>
      <div className="technology-sphere__interaction" role="group" tabIndex={0} aria-label={ui.rotateSphere} aria-describedby="technology-sphere-hint" />
      <p className="visually-hidden" id="technology-sphere-hint">{ui.rotateSphereHint}</p>
      <p className="visually-hidden" role="status">{paused ? ui.rotationPaused : ui.rotationRunning}</p>
    </div>
  );
}
