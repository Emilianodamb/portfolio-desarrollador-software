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
    let drag: { id: number; x: number; y: number; time: number } | null = null;

    const render = () => {
      const cx = width / 2;
      const cy = height / 2;
      const zoom = 1.1;
      const radius = (width <= 640 ? height * 0.37 : Math.min(width * 0.4, height * 0.42)) * zoom;
      const cameraDistance = 2.2;
      const hubPerspective = cameraDistance / (cameraDistance - 0.8);
      const hubY = cy - radius * 0.08 * hubPerspective;
      const yaw = phase.current.yaw;
      const tilt = 0.3 + Math.sin(yaw * 0.6) * 0.2 + phase.current.pitch;
      center.setAttribute('cx', String(cx));
      center.setAttribute('cy', String(hubY));
      center.setAttribute('r', String(4 * hubPerspective));

      points.forEach((point, index) => {
        const x = point.x * Math.cos(yaw) + point.z * Math.sin(yaw);
        const rotatedZ = point.z * Math.cos(yaw) - point.x * Math.sin(yaw);
        const y = point.y * Math.cos(tilt) - rotatedZ * Math.sin(tilt);
        const z = point.y * Math.sin(tilt) + rotatedZ * Math.cos(tilt);
        const perspective = cameraDistance / (cameraDistance - z);
        const px = cx + x * radius * perspective;
        const py = cy + y * radius * perspective * 0.78;
        const depth = (z + 1) / 2;
        const node = nodes[index];
        node.style.transform = `translate3d(${px}px, ${py}px, 0) translate(-50%, -100%) scale(${0.95 * perspective * zoom})`;
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
        yawSpeed = defaultSpeed + (yawSpeed - defaultSpeed) * decay;
        pitchSpeed *= decay;
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
      if (logo?.closest<HTMLElement>('.technology-sphere__node')?.dataset.front !== 'true') return;
      surface.setPointerCapture(event.pointerId);
      drag = { id: event.pointerId, x: event.clientX, y: event.clientY, time: event.timeStamp };
      yawSpeed = 0;
      pitchSpeed = 0;
      surface.dataset.dragging = 'true';
      event.preventDefault();
    };
    const moveDrag = (event: PointerEvent) => {
      if (!drag || event.pointerId !== drag.id) return;
      const dx = (event.clientX - drag.x) * 0.006;
      const dy = (drag.y - event.clientY) * 0.006;
      const elapsed = Math.max(event.timeStamp - drag.time, 8);
      phase.current.yaw += dx;
      phase.current.pitch += dy;
      yawSpeed = Math.max(-0.0038, Math.min(0.0038, dx / elapsed));
      pitchSpeed = Math.max(-0.0038, Math.min(0.0038, dy / elapsed));
      drag = { id: drag.id, x: event.clientX, y: event.clientY, time: event.timeStamp };
      render();
    };
    const finishDrag = (event: PointerEvent) => {
      if (!drag || event.pointerId !== drag.id) return;
      if (event.timeStamp - drag.time > 100) {
        yawSpeed = defaultSpeed;
        pitchSpeed = 0;
      }
      stopDrag();
      syncAnimation();
    };
    const cancelDrag = () => {
      if (!drag) return;
      stopDrag();
      yawSpeed = defaultSpeed;
      pitchSpeed = 0;
    };
    const rotateWithKeyboard = (event: KeyboardEvent) => {
      const directions: Record<string, [number, number]> = {
        ArrowLeft: [-0.14, 0], ArrowRight: [0.14, 0], ArrowUp: [0, 0.14], ArrowDown: [0, -0.14],
      };
      const direction = directions[event.key];
      if (!direction) return;
      event.preventDefault();
      phase.current.yaw += direction[0];
      phase.current.pitch += direction[1];
      yawSpeed = defaultSpeed;
      pitchSpeed = 0;
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
    <div ref={container} className="technology-sphere" role="region" aria-label={ui.technologies}>
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
      <button type="button" className="technology-sphere__pause" aria-pressed={paused} onClick={() => setPaused(previous => !previous)}>
        {paused ? ui.resumeRotation : ui.pauseRotation}
      </button>
    </div>
  );
}
