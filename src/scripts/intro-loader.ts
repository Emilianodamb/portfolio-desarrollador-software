import { waitForCriticalAssets, waitForImage } from './intro-readiness';

async function startIntro() {
  const root = document.documentElement;
  if (!root.dataset.intro) return;
  const overlay = document.getElementById('intro-loader');
  const content = document.getElementById('site-content');
  const surface = document.getElementById('intro-liquid-surface');
  const hero = document.querySelector<HTMLImageElement>('.hero__image');
  const logo = document.querySelector<HTMLImageElement>('.intro-loader__logo');
  const controller = new AbortController();
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let disposeAnimation = () => {};
  let finished = false;
  const finish = () => {
    if (finished) return;
    finished = true;
    controller.abort();
    disposeAnimation();
    delete root.dataset.intro;
    content?.removeAttribute('inert');
    overlay?.remove();
    motion.removeEventListener('change', finish);
    window.removeEventListener('intro:timeout', finish);
    window.removeEventListener('pagehide', finish);
  };
  motion.addEventListener('change', finish);
  window.addEventListener('intro:timeout', finish);
  window.addEventListener('pagehide', finish, { once: true });

  if (!overlay || !content || !surface || !hero || !logo || motion.matches) { finish(); return; }

  try {
    // Start readiness before importing animation code, keeping critical downloads concurrent.
    const ready = waitForCriticalAssets(hero, logo, document.fonts, controller.signal);
    const { gsap } = await import('gsap');
    await waitForImage(logo, controller.signal);
    if (finished) return;
    const liquid = { level: 1.05, phase: 0 };
    const draw = () => {
      const points = Array.from({ length: 33 }, (_, index) => {
        const x = index / 32;
        const y = liquid.level + Math.sin(x * Math.PI * 4 + liquid.phase) * 0.018;
        return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
      });
      surface.setAttribute('d', `${points.join(' ')} L 1 1.1 L 0 1.1 Z`);
    };
    const wave = gsap.to(liquid, { phase: Math.PI * 2, duration: 1.6, repeat: -1, ease: 'none', onUpdate: draw });
    const fill = gsap.timeline();
    disposeAnimation = () => { wave.kill(); fill.kill(); gsap.killTweensOf([logo, overlay]); };
    draw();
    await new Promise<void>(resolve => {
      fill.to(liquid, { level: 0.12, duration: 2, ease: 'power1.inOut', onUpdate: draw, onComplete: resolve });
    });
    await ready;
    if (finished) return;
    fill.to(liquid, { level: -0.05, duration: 0.55, ease: 'sine.out', onUpdate: draw })
      .call(() => { root.dataset.intro = 'revealing'; })
      .to(logo, { opacity: 0, filter: 'blur(16px)', duration: 0.65, ease: 'power2.in' }, '+=0.15')
      .to(overlay, { opacity: 0, duration: 0.7, ease: 'power2.inOut', onComplete: finish }, '<0.15');
  } catch {
    finish();
  }
}

void startIntro();
