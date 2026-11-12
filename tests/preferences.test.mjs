import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { extname, join } from 'node:path';
import test from 'node:test';

const browserPath = [
  process.env.PORTFOLIO_TEST_BROWSER,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/google-chrome',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].find((path) => path && existsSync(path));

async function waitFor(probe, message) {
  const deadline = Date.now() + 12000;
  while (Date.now() < deadline) {
    const value = await probe().catch(() => false);
    if (value) return value;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(message);
}

test('React preferences and bilingual CV downloads work in a browser', {
  skip: browserPath ? false : 'Set PORTFOLIO_TEST_BROWSER to a Chromium browser executable',
  timeout: 60000,
}, async (t) => {
  const scratch = await mkdtemp(join(tmpdir(), 'portfolio-browser-'));
  const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.pdf': 'application/pdf', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.ttf': 'font/ttf' };
  const server = createServer(async (request, response) => {
    try {
      const path = new URL(request.url, 'http://localhost').pathname;
      const file = new URL(`../dist${path === '/' ? '/index.html' : path}`, import.meta.url);
      response.setHeader('Content-Type', mime[extname(file.pathname)] ?? 'application/octet-stream');
      response.end(await readFile(file));
    } catch {
      response.writeHead(404).end();
    }
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const browser = spawn(browserPath, ['--headless=new', '--no-first-run', '--no-default-browser-check', '--remote-debugging-port=0', `--user-data-dir=${scratch}`, 'about:blank'], { stdio: 'ignore' });
  const exited = new Promise((resolve) => browser.once('exit', resolve));
  let socket;

  try {
    const portFile = join(scratch, 'DevToolsActivePort');
    const debugPort = await waitFor(async () => (await readFile(portFile, 'utf8')).split('\n')[0], 'Browser did not start');
    const tabs = await (await fetch(`http://127.0.0.1:${debugPort}/json/list`)).json();
    socket = new WebSocket(tabs.find((tab) => tab.type === 'page').webSocketDebuggerUrl);
    await new Promise((resolve, reject) => { socket.addEventListener('open', resolve, { once: true }); socket.addEventListener('error', reject, { once: true }); });
    let sequence = 0;
    const pending = new Map();
    const errors = [];
    socket.addEventListener('message', ({ data }) => {
      const message = JSON.parse(data);
      if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails);
      const request = pending.get(message.id);
      if (!request) return;
      pending.delete(message.id);
      clearTimeout(request.timer);
      if (message.error) request.reject(new Error(JSON.stringify(message.error)));
      else request.resolve(message.result);
    });
    const send = (method, params = {}) => new Promise((resolve, reject) => {
      const id = ++sequence;
      const timer = setTimeout(() => { pending.delete(id); reject(new Error(`Timed out: ${method}`)); }, 5000);
      pending.set(id, { resolve, reject, timer });
      socket.send(JSON.stringify({ id, method, params }));
    });
    const evaluate = async (expression) => {
      const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true, userGesture: true });
      if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
      return result.result.value;
    };
    const click = (id) => evaluate(`document.getElementById(${JSON.stringify(id)}).click()`);
    await send('Runtime.enable');
    await send('Page.enable');
    await send('Page.navigate', { url: `http://127.0.0.1:${server.address().port}/` });
    await waitFor(() => evaluate("!!document.querySelector('astro-island:not([ssr])') && document.documentElement.dataset.theme === 'light'"), 'React did not hydrate');

    await t.test('theme changes neutral colors but preserves orange and images', async () => {
      const accent = await evaluate("getComputedStyle(document.documentElement).getPropertyValue('--color-accent').trim()");
      await click('theme-toggle');
      await waitFor(() => evaluate("document.documentElement.dataset.theme === 'dark'"), 'Dark theme did not apply');
      assert.equal(await evaluate("document.getElementById('theme-toggle').getAttribute('aria-checked')"), 'true');
      assert.equal(await evaluate("getComputedStyle(document.body).color"), 'rgb(255, 255, 255)');
      assert.equal(await evaluate("getComputedStyle(document.querySelector('.project-card')).backgroundColor"), 'rgb(0, 0, 0)');
      assert.equal(await evaluate("getComputedStyle(document.documentElement).getPropertyValue('--color-accent').trim()"), accent);
      assert.equal(await evaluate("getComputedStyle(document.querySelector('.hero__image')).filter"), 'none');
    });

    await t.test('language updates all sections, metadata and card content independently', async () => {
      await click('language-toggle');
      await waitFor(() => evaluate("document.documentElement.lang === 'en'"), 'English did not apply');
      const labels = await evaluate("[...document.querySelectorAll('h2')].map(node => node.textContent)");
      assert.deepEqual(labels, ['Featured projects', 'Professional experience', 'Skills and methodology', 'Education and profile', 'Let’s talk about your next project']);
      assert.equal(await evaluate("document.querySelector('.project-card__title').textContent"), 'Aureq website');
      assert.match(await evaluate('document.title'), /Software development/);
      assert.equal(await evaluate('document.documentElement.dataset.theme'), 'dark');
    });

    await t.test('modal shows only ES/EN and downloads the matching PDF', async () => {
      await send('Page.setDownloadBehavior', { behavior: 'allow', downloadPath: scratch });
      for (const [language, name] of [
        ['es', "CV_Emiliano_D'Ambrosio_Desarrollador_Frontend.pdf"],
        ['en', "CV_Emiliano_D'Ambrosio_Frontend_Developer.pdf"],
      ]) {
        await click('cv-download');
        assert.equal(await evaluate("document.querySelector('dialog').open"), true);
        assert.equal(await evaluate("document.querySelector('dialog').innerText.replace(/\\s+/g, ' ').trim()"), '[ES] [EN]');
        await evaluate(`document.querySelector('dialog a[href="/cv/${language}.pdf"]').click()`);
        assert.equal(await evaluate("document.querySelector('dialog').open"), false);
        const downloaded = await waitFor(() => readFile(join(scratch, name)), `Missing ${language} download`);
        const original = await readFile(new URL(`../CV/${name}`, import.meta.url));
        assert.deepEqual(downloaded, original);
      }
      await click('cv-download');
      await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
      await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
      assert.equal(await evaluate("document.querySelector('dialog').open"), false);
      assert.equal(await evaluate('document.activeElement.id'), 'cv-download');
    });

    await t.test('preferences persist and switches remain usable at portrait width', async () => {
      await send('Page.reload');
      await waitFor(() => evaluate("document.documentElement.lang === 'en' && document.documentElement.dataset.theme === 'dark' && !!document.querySelector('astro-island:not([ssr])')"), 'Saved preferences were not restored');
      await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: false });
      assert.ok(await evaluate('document.documentElement.scrollWidth <= innerWidth'));
      assert.ok(await evaluate("document.querySelector('.project-card__image').getBoundingClientRect().top < document.querySelector('.project-card__content').getBoundingClientRect().top"));
      await click('language-toggle');
      await click('theme-toggle');
      await waitFor(() => evaluate("document.documentElement.lang === 'es' && document.documentElement.dataset.theme === 'light'"), 'Switches did not return to Spanish/light');
      assert.equal(await evaluate("document.getElementById('proyectos-title').textContent"), 'Proyectos destacados');
    });
    assert.deepEqual(errors, [], 'Browser runtime errors');
  } finally {
    socket?.close();
    browser.kill();
    await exited;
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
    await rm(scratch, { recursive: true, force: true, maxRetries: 15, retryDelay: 200 });
  }
});
