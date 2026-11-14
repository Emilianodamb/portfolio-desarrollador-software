import { useEffect, useRef } from 'react';

export default function SectionMarquee({ title }: { title: string }) {
  const marquee = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = marquee.current;
    const track = element?.querySelector<HTMLElement>('.section-marquee__track');
    if (!element || !track) return;
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
    let drag: { id: number; x: number; time: number; period: number; duration: number; animation: Animation; resume: boolean } | null = null;

    const stop = () => {
      if (!drag) return;
      const previous = drag;
      drag = null;
      if (element.hasPointerCapture(previous.id)) element.releasePointerCapture(previous.id);
      if (previous.resume && !reducedMotion.matches) previous.animation.play();
    };
    const start = (event: PointerEvent) => {
      if (!event.isPrimary || event.button !== 0 || drag || reducedMotion.matches) return;
      const animation = track.getAnimations()[0];
      const period = track.firstElementChild?.getBoundingClientRect().width ?? 0;
      const duration = Number(animation?.effect?.getTiming().duration);
      if (!animation || !period || !Number.isFinite(duration) || !duration) return;
      const time = Number(animation.currentTime ?? 0);
      drag = { id: event.pointerId, x: event.clientX, time, period, duration, animation, resume: animation.playState === 'running' };
      animation.pause();
      animation.currentTime = time;
      element.setPointerCapture(event.pointerId);
      event.preventDefault();
    };
    const move = (event: PointerEvent) => {
      if (!drag || drag.id !== event.pointerId) return;
      const time = drag.time - (event.clientX - drag.x) / drag.period * drag.duration;
      drag.animation.currentTime = ((time % drag.duration) + drag.duration) % drag.duration;
    };
    element.addEventListener('pointerdown', start);
    element.addEventListener('pointermove', move);
    element.addEventListener('pointerup', stop);
    element.addEventListener('pointercancel', stop);
    element.addEventListener('lostpointercapture', stop);
    window.addEventListener('blur', stop);
    reducedMotion.addEventListener('change', stop);
    return () => {
      stop();
      element.removeEventListener('pointerdown', start);
      element.removeEventListener('pointermove', move);
      element.removeEventListener('pointerup', stop);
      element.removeEventListener('pointercancel', stop);
      element.removeEventListener('lostpointercapture', stop);
      window.removeEventListener('blur', stop);
      reducedMotion.removeEventListener('change', stop);
    };
  }, []);

  return (
    <div ref={marquee} className="section-marquee" aria-hidden="true">
      <div className="section-marquee__track">
        {[0, 1].map((group) => (
          <span className="section-marquee__group" key={group}>
            {[0, 1, 2, 3].map((word) => (
              <span className="section-marquee__word" key={word}>{title}</span>
            ))}
          </span>
        ))}
      </div>
    </div>
  );
}
