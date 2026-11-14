import test from 'node:test';
import assert from 'node:assert/strict';
import { waitForImage, waitForCriticalAssets } from '../src/scripts/intro-readiness.ts';

function image({ complete = true, naturalWidth = 640, decode = () => Promise.resolve() } = {}) {
  return Object.assign(new EventTarget(), { complete, naturalWidth, decode });
}

test('cached hero is decoded before readiness resolves', async () => {
  let decoded = false;
  await waitForImage(image({ decode: async () => { decoded = true; } }), new AbortController().signal);
  assert.equal(decoded, true);
});

test('uncached hero waits for load and decode', async () => {
  const hero = image({ complete: false });
  let ready = false;
  const pending = waitForImage(hero, new AbortController().signal).then(() => { ready = true; });
  await Promise.resolve();
  assert.equal(ready, false);
  hero.dispatchEvent(new Event('load'));
  await pending;
  assert.equal(ready, true);
});

test('failed image and aborted requests settle instead of trapping the loader', async () => {
  await assert.rejects(waitForImage(image({ naturalWidth: 0 }), new AbortController().signal));
  const controller = new AbortController();
  const pending = waitForImage(image({ complete: false }), controller.signal);
  controller.abort();
  await assert.rejects(pending, /aborted/);
});

test('critical readiness waits for both fonts and hero, tolerating asset failures', async () => {
  const requested = [];
  let releaseFont;
  const fontReady = new Promise(resolve => { releaseFont = resolve; });
  const fonts = { load: font => { requested.push(font); return fontReady; }, ready: Promise.resolve() };
  let ready = false;
  const pending = waitForCriticalAssets(image({ naturalWidth: 0 }), image(), fonts, new AbortController().signal)
    .then(result => { ready = true; return result; });
  await Promise.resolve();
  assert.equal(ready, false);
  assert.deepEqual(requested, ['500 1em "Cabinet Grotesk"', '400 1em "DM Sans"']);
  releaseFont([]);
  const result = await pending;
  assert.equal(ready, true);
  assert.equal(result[0].status, 'rejected');
});

test('readiness independently waits for hero decode and every font barrier', async () => {
  const gates = Array.from({ length: 4 }, () => {
    let resolve;
    const promise = new Promise(done => { resolve = done; });
    return { promise, resolve };
  });
  let calls = 0;
  let done = false;
  const fonts = { load: () => gates[1 + calls++].promise, ready: gates[3].promise };
  const pending = waitForCriticalAssets(
    image({ decode: () => gates[0].promise }), image(), fonts, new AbortController().signal,
  ).then(() => { done = true; });
  for (const gate of gates) {
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(done, false);
    gate.resolve([]);
  }
  await pending;
  assert.equal(done, true);
  assert.equal(calls, 2);
});

test('rejected decode and font loads settle safely', async () => {
  const fail = () => Promise.reject(new Error('Unavailable'));
  const result = await waitForCriticalAssets(
    image({ decode: fail }), image(), { load: fail, ready: Promise.resolve() }, new AbortController().signal,
  );
  assert.deepEqual(result.map(item => item.status), ['rejected', 'fulfilled', 'rejected', 'rejected', 'fulfilled']);
});

test('a pre-aborted wait never invokes image decode', async () => {
  const controller = new AbortController();
  controller.abort();
  let calls = 0;
  await assert.rejects(waitForImage(image({ decode: () => { calls++; return Promise.resolve(); } }), controller.signal), /aborted/);
  assert.equal(calls, 0);
});
