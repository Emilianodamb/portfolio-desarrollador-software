import { useEffect, useRef } from 'react';

export default function DifferenceCursor() {
  const cursor = useRef<HTMLDivElement>(null);
  const shape = useRef<SVGPathElement>(null);

  useEffect(() => {
    const element = cursor.current;
    if (!element) return;

    const capability = window.matchMedia('(hover: hover) and (pointer: fine)');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const root = document.documentElement;
    let frame: number | null = null;
    let active = false;
    let targetX = 0;
    let targetY = 0;
    let followerX = 0;
    let followerY = 0;
    let lastTime = 0;

    const render = (dx = 0, dy = 0) => {
      const distance = Math.hypot(dx, dy);
      const tail = Math.min(distance * 0.65, 56);
      const taper = tail / 56;
      const angle = distance ? Math.atan2(dy, dx) : 0;
      const x = targetX - Math.cos(angle) * tail / 2;
      const y = targetY - Math.sin(angle) * tail / 2;
      // One continuous shape avoids overlapping difference layers cancelling inversion.
      element.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%) rotate(${angle}rad) scale(${1 + tail / 48}, ${1 - tail / 240})`;
      element.style.borderRadius = tail ? '0%' : '50%';
      // Local -X is the trailing edge; keep the rounded head on local +X.
      shape.current?.setAttribute('d', `M 0 50 C ${24 * taper} ${22 + 24 * taper} ${22 + 12 * taper} 0 ${50 + 16 * taper} 0 C ${78 + 8 * taper} 0 100 22 100 50 C 100 78 ${78 + 8 * taper} 100 ${50 + 16 * taper} 100 C ${22 + 12 * taper} 100 ${24 * taper} ${78 - 24 * taper} 0 50 Z`);
    };

    const hide = () => {
      if (frame !== null) cancelAnimationFrame(frame);
      frame = null;
      active = false;
      element.style.opacity = '0';
      delete root.dataset.cursorActive;
    };

    const animate = (time: number) => {
      frame = null;
      const follow = 1 - Math.exp(-Math.min(time - lastTime, 32) / 42);
      lastTime = time;
      followerX += (targetX - followerX) * follow;
      followerY += (targetY - followerY) * follow;
      const dx = targetX - followerX;
      const dy = targetY - followerY;
      if (Math.hypot(dx, dy) < 0.1 || reducedMotion.matches) {
        followerX = targetX;
        followerY = targetY;
        render();
        return;
      }
      render(dx, dy);
      frame = requestAnimationFrame(animate);
    };

    const move = (event: PointerEvent) => {
      if (!capability.matches || event.pointerType !== 'mouse') {
        hide();
        return;
      }
      targetX = event.clientX;
      targetY = event.clientY;
      if (!active || reducedMotion.matches) {
        if (frame !== null) cancelAnimationFrame(frame);
        frame = null;
        followerX = targetX;
        followerY = targetY;
        render();
      } else if (frame === null) {
        lastTime = performance.now();
        frame = requestAnimationFrame(animate);
      }
      active = true;
      element.style.opacity = '1';
      root.dataset.cursorActive = 'true';
    };

    const updateCapability = () => { if (!capability.matches) hide(); };

    document.addEventListener('pointermove', move, { passive: true });
    document.documentElement.addEventListener('pointerleave', hide);
    document.addEventListener('pointercancel', hide);
    document.addEventListener('keydown', hide);
    document.addEventListener('visibilitychange', hide);
    window.addEventListener('blur', hide);
    capability.addEventListener('change', updateCapability);
    reducedMotion.addEventListener('change', hide);

    return () => {
      hide();
      document.removeEventListener('pointermove', move);
      document.documentElement.removeEventListener('pointerleave', hide);
      document.removeEventListener('pointercancel', hide);
      document.removeEventListener('keydown', hide);
      document.removeEventListener('visibilitychange', hide);
      window.removeEventListener('blur', hide);
      capability.removeEventListener('change', updateCapability);
      reducedMotion.removeEventListener('change', hide);
    };
  }, []);

  return (
    <div ref={cursor} className="difference-cursor" aria-hidden="true">
      <svg className="difference-cursor__shape" viewBox="0 0 100 100" focusable="false">
        <path ref={shape} d="M 0 50 C 0 22 22 0 50 0 C 78 0 100 22 100 50 C 100 78 78 100 50 100 C 22 100 0 78 0 50 Z" />
      </svg>
    </div>
  );
}
