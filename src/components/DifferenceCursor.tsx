import { useEffect, useRef } from 'react';

type CursorPosition = { x: number; y: number; time: number };
type CursorFollower = {
  element: HTMLSpanElement;
  delay: number;
  positions: CursorPosition[];
  timer: number | null;
};

export default function DifferenceCursor() {
  const cursor = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLSpanElement>(null);
  const trail = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const element = cursor.current;
    const dotElement = dot.current;
    const trailElement = trail.current;
    if (!element || !dotElement || !trailElement) return;

    const capability = window.matchMedia('(hover: hover) and (pointer: fine)');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const root = document.documentElement;
    const followers: CursorFollower[] = [
      { element: trailElement, delay: 100, positions: [], timer: null },
    ];
    let active = false;

    element.style.transform = '';
    element.style.borderRadius = '';

    const place = (circle: HTMLElement, x: number, y: number) => {
      circle.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
    };

    const cancelPending = () => {
      followers.forEach(follower => {
        if (follower.timer !== null) window.clearTimeout(follower.timer);
        follower.timer = null;
        follower.positions.length = 0;
      });
    };

    const hide = () => {
      cancelPending();
      active = false;
      element.style.opacity = '0';
      delete root.dataset.cursorActive;
    };

    const scheduleTrail = (follower: CursorFollower) => {
      if (follower.timer !== null || follower.positions.length === 0) return;
      const delay = Math.max(0, follower.positions[0].time + follower.delay - performance.now());
      follower.timer = window.setTimeout(() => flushTrail(follower), delay);
    };

    const flushTrail = (follower: CursorFollower) => {
      follower.timer = null;
      if (!active) return;
      const cutoff = performance.now() - follower.delay;
      let latest: CursorPosition | undefined;
      while (follower.positions.length && follower.positions[0].time <= cutoff) latest = follower.positions.shift();
      if (latest) place(follower.element, latest.x, latest.y);
      scheduleTrail(follower);
    };

    const move = (event: PointerEvent) => {
      if (!capability.matches || event.pointerType !== 'mouse') {
        hide();
        return;
      }
      const { clientX: x, clientY: y } = event;
      if (!active || reducedMotion.matches) {
        cancelPending();
        dotElement.style.transition = 'none';
        place(dotElement, x, y);
        followers.forEach(follower => {
          follower.element.style.transition = 'none';
          place(follower.element, x, y);
        });
        dotElement.getBoundingClientRect();
        dotElement.style.transition = '';
        followers.forEach(follower => { follower.element.style.transition = ''; });
      } else {
        place(dotElement, x, y);
        const position = { x, y, time: performance.now() };
        followers.forEach(follower => {
          follower.positions.push(position);
          // Bound high-frequency input without creating one timeout per event.
          if (follower.positions.length > 128) follower.positions.shift();
          scheduleTrail(follower);
        });
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
      <span ref={dot} className="difference-cursor__dot" />
      <span ref={trail} className="difference-cursor__trail" />
    </div>
  );
}
