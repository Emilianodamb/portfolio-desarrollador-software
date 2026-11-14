// Wait only for above-the-fold assets, never for the lazy image collection.
export function waitForImage(image: HTMLImageElement, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const clean = () => {
      image.removeEventListener('load', loaded);
      image.removeEventListener('error', failed);
      signal.removeEventListener('abort', aborted);
    };
    const aborted = () => { clean(); reject(new Error('Image readiness aborted')); };
    const failed = () => { clean(); reject(new Error('Critical image unavailable')); };
    const loaded = () => {
      clean();
      if (!image.naturalWidth) { reject(new Error('Critical image unavailable')); return; }
      image.decode().then(resolve, reject);
    };
    if (signal.aborted) { aborted(); return; }
    if (image.complete) { loaded(); return; }
    image.addEventListener('load', loaded, { once: true });
    image.addEventListener('error', failed, { once: true });
    signal.addEventListener('abort', aborted, { once: true });
  });
}

export async function waitForCriticalAssets(hero: HTMLImageElement, logo: HTMLImageElement, fonts: FontFaceSet, signal: AbortSignal) {
  return Promise.allSettled([
    waitForImage(hero, signal),
    waitForImage(logo, signal),
    fonts.load('500 1em "Cabinet Grotesk"'),
    fonts.load('400 1em "DM Sans"'),
    fonts.ready,
  ]);
}
