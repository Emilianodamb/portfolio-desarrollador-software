import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { extname, join } from 'node:path';
import test from 'node:test';

const expectedStacks = [
  ['HTML', 'CSS', 'JavaScript', 'React', 'Tailwind CSS', 'Python', 'Firebase', 'Git', 'GitHub', 'Visual Studio Code'],
  ['HTML', 'CSS', 'JavaScript', 'Astro', 'GSAP', 'Git', 'GitHub', 'Google Cloud', 'Visual Studio Code'],
  ['HTML', 'CSS', 'JavaScript', 'TypeScript', 'React', 'Vite', 'Next.js', 'Google Analytics', 'Git', 'GitHub', 'GitHub Copilot', 'Tailwind CSS', 'Visual Studio Code'],
  ['HTML', 'CSS', 'JavaScript', 'Astro', 'PHP', 'Git', 'GitHub', 'Visual Studio Code'],
  ['HTML', 'CSS', 'JavaScript', 'React', 'Firebase', 'Git', 'GitHub', 'Visual Studio Code'],
  ['HTML', 'CSS', 'JavaScript', 'Git', 'GitHub', 'Visual Studio Code'],
  ['HTML', 'CSS', 'Bootstrap', 'Sass', 'Git', 'GitHub', 'Visual Studio Code'],
  ['C', 'Code::Blocks'],
  ['Proteus', 'MPLAB', 'C'],
  ['HTML', 'CSS', 'JavaScript', 'TypeScript', 'Supabase', 'n8n', 'Git', 'GitHub', 'Google Cloud', 'Visual Studio Code'],
];

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
  const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.pdf': 'application/pdf', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.ttf': 'font/ttf' };
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
    const sphereHitPoint = (layer = 'front') => evaluate(`(() => {
      const root = document.querySelector('.technology-sphere');
      const boxes = Array.from(root.querySelectorAll('.technology-sphere__node'), node => ({ node, image:node.querySelector('img'), rect:node.querySelector('img').getBoundingClientRect() }));
      const usable = (x, y) => x > 150 && x < innerWidth - 150 && y > 180 && y < innerHeight - 140;
      if (${JSON.stringify(layer)} === 'air') {
        const area = root.getBoundingClientRect();
        for (let y = Math.max(240, area.top + 80); y < Math.min(innerHeight - 80, area.bottom); y += 35) {
          for (let x = 30; x < innerWidth - 30; x += 35) {
            if (boxes.every(({rect}) => x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) && root.contains(document.elementFromPoint(x,y))) return {x,y};
          }
        }
      } else {
        for (const {node,image,rect} of boxes.sort((a,b) => Number(b.node.dataset.depth) - Number(a.node.dataset.depth))) {
          const x = rect.x + rect.width / 2; const y = rect.y + rect.height / 2;
          const hit = document.elementFromPoint(x,y);
          const front = Number(node.dataset.depth) > 0.5;
          const fits = innerWidth > 640 ? usable(x,y) : x > 35 && x < innerWidth - 35 && y > 180 && y < innerHeight - 140;
          if (fits && (${JSON.stringify(layer)} === 'front' ? front && hit === image : !front && !hit?.closest('.technology-sphere__node[data-front="true"]'))) return {x,y};
        }
      }
      throw new Error('No visible ' + ${JSON.stringify(layer)} + ' sphere hit point');
    })()`);
    await send('Runtime.enable');
    await send('Page.enable');
    await send('Page.navigate', { url: `http://127.0.0.1:${server.address().port}/` });
    await waitFor(() => evaluate("!!document.querySelector('astro-island:not([ssr])') && document.documentElement.dataset.theme === 'light'"), 'React did not hydrate');

    await t.test('cursor circle follows the mouse and inverts underlying pixels without blocking interaction', async () => {
      await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
      await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] });
      assert.ok(await evaluate("!!document.querySelector('.difference-cursor')"), 'Missing difference cursor');
      await evaluate(`(() => {
        const target = document.createElement('button');
        target.id = 'cursor-test-target';
        target.style.cssText = 'position:fixed;left:200px;top:160px;width:100px;height:100px;background:rgb(32,96,160);border:0;z-index:100000;';
        target.onclick = () => target.dataset.clicked = 'true';
        document.body.append(target);
      })()`);
      try {
        for (const theme of ['light', 'dark']) {
          await evaluate(`document.documentElement.dataset.theme = '${theme}'`);
          await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 230, y: 190 });
          await waitFor(() => evaluate(`(() => {
            const rect = document.querySelector('.difference-cursor').getBoundingClientRect();
            return Math.abs(rect.x + rect.width / 2 - 230) < 0.1 && Math.abs(rect.y + rect.height / 2 - 190) < 0.1 && document.querySelector('.difference-cursor').style.borderRadius === '50%';
          })()`), 'Cursor did not settle at the pointer');
          const cursor = await evaluate(`(() => {
            const element = document.querySelector('.difference-cursor');
            const style = getComputedStyle(element);
            const rect = element.getBoundingClientRect();
            return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2,
              blend: style.mixBlendMode, events: style.pointerEvents, opacity: style.opacity,
              round: style.borderRadius, hidden: element.getAttribute('aria-hidden') };
          })()`);
          assert.deepEqual(cursor, { x: 230, y: 190, blend: 'difference', events: 'none', opacity: '1', round: '50%', hidden: 'true' });
          const screenshot = await send('Page.captureScreenshot', { format: 'png', clip: { x: 230, y: 190, width: 1, height: 1, scale: 1 } });
          const pixel = await evaluate(`(async () => {
            const image = new Image(); image.src = 'data:image/png;base64,${screenshot.data}'; await image.decode();
            const canvas = document.createElement('canvas'); canvas.width = canvas.height = 1;
            const context = canvas.getContext('2d'); context.drawImage(image, 0, 0);
            return Array.from(context.getImageData(0, 0, 1, 1).data).slice(0, 3);
          })()`);
          assert.deepEqual(pixel, [223, 159, 95], 'The circle must invert actual rendered colors');
        }
        await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: 230, y: 190, button: 'left', clickCount: 1 });
        await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: 230, y: 190, button: 'left', clickCount: 1 });
        assert.equal(await evaluate("document.getElementById('cursor-test-target').dataset.clicked"), 'true');
        await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 420, y: 340 });
        await waitFor(() => evaluate(`(() => {
          const rect = document.querySelector('.difference-cursor').getBoundingClientRect();
          return Math.abs(rect.x + rect.width / 2 - 420) < 0.1;
        })()`), 'Cursor must settle at its new position');
        await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 });
        assert.equal(await evaluate("getComputedStyle(document.querySelector('.difference-cursor')).opacity"), '0');
        await evaluate("document.dispatchEvent(new PointerEvent('pointermove', { pointerType: 'touch', clientX: 100, clientY: 100, bubbles: true }))");
        assert.equal(await evaluate("getComputedStyle(document.querySelector('.difference-cursor')).opacity"), '0');
        await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 450, y: 350 });
        await evaluate("document.documentElement.dispatchEvent(new PointerEvent('pointerleave', { pointerType: 'mouse' }))");
        assert.equal(await evaluate("getComputedStyle(document.querySelector('.difference-cursor')).opacity"), '0');
        await send('Emulation.setTouchEmulationEnabled', { enabled: true });
        await evaluate("document.dispatchEvent(new PointerEvent('pointermove', { pointerType: 'mouse', clientX: 100, clientY: 100, bubbles: true }))");
        assert.equal(await evaluate("getComputedStyle(document.querySelector('.difference-cursor')).display"), 'none');
      } finally {
        await send('Emulation.setTouchEmulationEnabled', { enabled: false });
        await evaluate("document.getElementById('cursor-test-target')?.remove(); document.documentElement.dataset.theme = 'light'");
      }
    });

    await t.test('smaller fluid cursor stretches behind fast motion and replaces native pointers', async () => {
      await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 300, y: 300 });
      assert.equal(await evaluate("getComputedStyle(document.querySelector('.difference-cursor')).width"), '48px');
      assert.equal(await evaluate("getComputedStyle(document.body).cursor"), 'none');
      assert.equal(await evaluate("getComputedStyle(document.querySelector('.toggle')).cursor"), 'none');
      const sampleMotion = (x) => evaluate(`new Promise(resolve => {
        document.dispatchEvent(new PointerEvent('pointermove', { pointerType: 'mouse', clientX: ${x}, clientY: 300, bubbles: true }));
        requestAnimationFrame(() => {
          const rect = document.querySelector('.difference-cursor').getBoundingClientRect();
          const shape = document.querySelector('.difference-cursor path');
          resolve({ width: rect.width, center: rect.x + rect.width / 2,
            narrowRear: shape ? !shape.isPointInFill(new DOMPoint(15, 30)) && shape.isPointInFill(new DOMPoint(80, 30)) : false });
        });
      })`);
      const slow = await sampleMotion(305);
      const fast = await sampleMotion(750);
      assert.ok(fast.width > slow.width + 5, 'Faster motion must produce a longer fluid trail');
      assert.ok(fast.width > 90, 'Fast movement must produce a longer tail than the previous 76px limit');
      assert.ok(fast.narrowRear, 'The narrow point must trail behind the rounded leading edge');
      assert.ok(fast.center < 750 && fast.center > 700, 'The short trail must extend behind the pointer');
      await waitFor(() => evaluate("Math.abs(document.querySelector('.difference-cursor').getBoundingClientRect().width - 48) < 0.1"), 'Fluid cursor must return to its resting shape');
      await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
      const reduced = await sampleMotion(800);
      assert.equal(reduced.width, 48);
      assert.equal(reduced.center, 800);
      await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] });
      await evaluate("window.dispatchEvent(new Event('blur'))");
      assert.notEqual(await evaluate("getComputedStyle(document.body).cursor"), 'none', 'Native pointer must return when the effect is inactive');
    });

    await t.test('links underline and grow slightly on mouse hover without changing their layout footprint', async () => {
      for (const selector of ['.site-header__link', '.hero__socials a', '.project-card__links a']) {
        await evaluate(`document.querySelector('${selector}').scrollIntoView({ block: 'center' })`);
        const bounds = await evaluate(`(() => {
          const element = document.querySelector('${selector}');
          const rect = element.getBoundingClientRect();
          return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2, width: element.offsetWidth };
        })()`);
        await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: bounds.x, y: bounds.y });
        await waitFor(() => evaluate(`Number(getComputedStyle(document.querySelector('${selector}')).scale) >= 1.039`), 'Hovered links must grow');
        assert.ok(await evaluate(`getComputedStyle(document.querySelector('${selector}')).textDecorationLine.includes('underline')`));
        assert.equal(await evaluate(`document.querySelector('${selector}').offsetWidth`), bounds.width);
        assert.equal(await evaluate(`getComputedStyle(document.querySelector('${selector}')).cursor`), 'none');
      }
      await evaluate('window.scrollTo(0, 0)');
      await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 10, y: 150 });
    });

    await t.test('header has equal-width brand lines and soft accessible switches without a contact button', async () => {
      for (const [width, height] of [[1280, 900], [390, 844]]) {
        await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false });
        await evaluate('document.fonts.ready');
        const brand = await evaluate(`(() => {
          const name = document.querySelector('.site-header__name');
          const role = document.querySelector('.site-header__role');
          return name && role ? { name: name.textContent, role: role.textContent,
            nameWidth: name.getBBox().width, roleWidth: role.getBBox().width,
            color: getComputedStyle(role).fill } : null;
        })()`);
        assert.ok(brand, 'Missing two-line brand');
        assert.equal(brand.name, "Emiliano D'Ambrosio");
        assert.equal(brand.role, 'Desarrollador Frontend');
        assert.ok(Math.abs(brand.nameWidth - brand.roleWidth) <= 1);
        assert.equal(brand.color, 'rgb(182, 64, 18)');
        assert.equal(await evaluate("!!document.querySelector('.site-header a[href=\"#contacto\"]')"), false);
        assert.ok(await evaluate(`Array.from(document.querySelectorAll('.toggle')).every(toggle => {
          const style = getComputedStyle(toggle);
          return toggle.getAttribute('role') === 'switch' && toggle.getAttribute('aria-label') &&
            style.borderTopWidth === '0px' && style.backgroundColor === 'rgba(0, 0, 0, 0)' &&
            toggle.getBoundingClientRect().height >= 44 && !toggle.querySelector('button');
        })`));
        assert.ok(await evaluate('document.documentElement.scrollWidth <= innerWidth'));
      }
      await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
    });

    await t.test('WhatsApp tab reveals a contact link and closes with Escape while restoring focus', async () => {
      for (const [width, height] of [[1280, 900], [390, 844]]) {
        await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false });
        assert.equal(await evaluate("document.getElementById('whatsapp-tab-toggle')?.getAttribute('aria-expanded')"), 'false');
        assert.equal(await evaluate("document.getElementById('whatsapp-tab-panel').getClientRects().length"), 0);
        await click('whatsapp-tab-toggle');
        assert.equal(await evaluate("document.getElementById('whatsapp-tab-toggle').getAttribute('aria-expanded')"), 'true');
        assert.ok(await evaluate(`(() => {
          const panel = document.getElementById('whatsapp-tab-panel');
          const link = panel.querySelector('a');
          const rect = panel.getBoundingClientRect();
          return panel.getClientRects().length > 0 && rect.left >= 0 && rect.right <= innerWidth &&
            rect.bottom <= innerHeight && link.href === document.querySelector('.contact__links a').href &&
            link.target === '_blank' && link.rel.includes('noopener') && link.textContent.includes('WhatsApp') &&
            getComputedStyle(panel).backgroundColor === 'rgb(182, 64, 18)' &&
            getComputedStyle(link).color === 'rgb(255, 255, 255)' &&
            Math.abs(document.getElementById('whatsapp-tab-toggle').getBoundingClientRect().bottom - rect.top) <= 1 &&
            Math.abs(rect.bottom - innerHeight) <= 1;
        })()`), 'WhatsApp must be an orange edge-attached panel below its trigger');
        await evaluate("document.querySelector('#whatsapp-tab-panel a').focus()");
        await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
        await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
        assert.equal(await evaluate("document.getElementById('whatsapp-tab-toggle').getAttribute('aria-expanded')"), 'false');
        assert.equal(await evaluate('document.activeElement.id'), 'whatsapp-tab-toggle');
        await click('whatsapp-tab-toggle');
        await click('whatsapp-tab-toggle');
        assert.equal(await evaluate('document.activeElement.id'), 'whatsapp-tab-toggle');
        assert.equal(await evaluate("document.getElementById('whatsapp-tab-panel').getClientRects().length"), 0);
      }
      await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
    });

    await t.test('project group headings are short uppercase labels with larger responsive typography', async () => {
      for (const [width, height] of [[1280, 900], [390, 844]]) {
        await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false });
        const headings = await evaluate(`Array.from(document.querySelectorAll('.projects__subtitle'), heading => ({
          text: heading.textContent, size: parseFloat(getComputedStyle(heading).fontSize),
          casing: getComputedStyle(heading).textTransform, overflow: heading.scrollWidth > heading.clientWidth
        }))`);
        assert.deepEqual(headings.map((heading) => heading.text), ['DESTACADOS', 'DE FORMACIÓN', 'OTROS']);
        assert.ok(headings.every((heading) => heading.size >= 38 && heading.casing === 'uppercase' && !heading.overflow), 'Project subsection headings must be larger without overflowing');
        assert.ok(await evaluate(`Array.from(document.querySelectorAll('.projects__other')).every(section => {
          const previous = section.previousElementSibling;
          return section.querySelector('.projects__subtitle').getBoundingClientRect().top - previous.getBoundingClientRect().bottom >= 76;
        })`), 'Training and other headings must be spaced farther from the preceding projects');
        assert.ok(await evaluate("Array.from(document.querySelectorAll('[data-project-group]')).every(group => getComputedStyle(group.lastElementChild).borderBottomWidth === '1px')"), 'Every subsection must end with a separator');
      }
    });

    await t.test('experience entries have prominent headings and the supplied date ranges', async () => {
      for (const [width, height] of [[1280, 900], [390, 844]]) {
        await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false });
        const entries = await evaluate(`Array.from(document.querySelectorAll('.experience__entry'), entry => ({
          company: entry.querySelector('.experience__company').textContent,
          dates: entry.querySelector('.experience__period')?.textContent,
          titleSize: parseFloat(getComputedStyle(entry.querySelector('.experience__company')).fontSize),
          roleSize: parseFloat(getComputedStyle(entry.querySelector('.experience__role')).fontSize)
        }))`);
        assert.deepEqual(entries.map(({ company, dates }) => [company, dates]), [
          ['Aureq', '2026 - Actualmente'], ['Total Mecánica', '2024 - 2026'],
        ]);
        assert.ok(entries.every((entry) => entry.titleSize >= 32 && entry.roleSize >= 18));
        assert.ok(await evaluate('document.documentElement.scrollWidth <= innerWidth'));
      }
      await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
    });

    await t.test('all ten project stacks use exactly the requested technologies and logos', async () => {
      assert.equal(await evaluate("document.querySelectorAll('.tag-list').length"), 0);
      const technologies = await evaluate(`Array.from(document.querySelectorAll('[data-project-group] article'), card =>
        Array.from(card.querySelectorAll('.technology-list > li'), item => ({
          name: item.dataset.technology, image: item.querySelector('img')?.alt ?? null, text: item.textContent.trim()
        })))`);
      assert.deepEqual(technologies.map((items) => items.map((item) => item.name)), expectedStacks);
      assert.ok(technologies.flat().every((item) => item.image === item.name), 'Every selected technology must have its supplied logo');
      assert.equal(await evaluate("document.querySelector('[data-project-group=other] .technology-list img')?.alt"), 'C');
      await evaluate("Promise.all(Array.from(document.querySelectorAll('.technology-list img'), image => { image.loading = 'eager'; return image.decode(); }))");
    });

    await t.test('project typography and logos retain their sizes while image width follows orientation', async () => {
      for (const [width, height] of [[1280, 900], [390, 844]]) {
        await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false });
        assert.ok(await evaluate(`Array.from(document.querySelectorAll('.project-card')).every(row => {
          const size = selector => parseFloat(getComputedStyle(row.querySelector(selector)).fontSize);
          const logo = getComputedStyle(row.querySelector('.technology-logo'));
          const image = getComputedStyle(row.querySelector('.project-card__image'));
          const details = row.querySelector('.project-card__details p');
          return Math.abs(size('.project-card__title') - 26.4 * 1.4) < 0.02 &&
            Math.abs(size('.project-card__description') - 15.2 * 1.4) < 0.02 &&
            (!details || Math.abs(parseFloat(getComputedStyle(details).fontSize) - 15.2 * 1.4) < 0.02) &&
            Math.abs(parseFloat(logo.width) - 88 * 0.8) < 0.02 && parseFloat(logo.height) === 32 &&
            image.maxWidth === (matchMedia('(orientation: portrait)').matches ? '100%' : '80%');
        })`), 'Project text and media must match the requested size ratios');
        assert.equal(await evaluate("document.querySelectorAll('.project-card__image--portrait').length"), 0);
        assert.ok(await evaluate('document.documentElement.scrollWidth <= innerWidth'));
      }
    });

    await t.test('mobile portrait hero and all project images fill their padded content width', async () => {
      for (const [width, height] of [[360, 800], [390, 844], [430, 932]]) {
        await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false });
        assert.ok(await evaluate(`(() => {
          const hero = document.querySelector('.hero');
          const style = getComputedStyle(hero);
          const box = hero.getBoundingClientRect();
          const portrait = hero.querySelector('.hero__portrait').getBoundingClientRect();
          const expected = box.width - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
          return Math.abs(portrait.width - expected) < 1 && portrait.left >= box.left && portrait.right <= box.right;
        })()`), `${width}px: hero portrait must fill the available width`);
        assert.ok(await evaluate(`Array.from(document.querySelectorAll('.project-card')).every(row => {
          const image = row.querySelector('.project-card__image');
          const box = row.getBoundingClientRect(); const rect = image.getBoundingClientRect();
          return Math.abs(rect.width - box.width) < 1 && rect.left >= box.left - 1 && rect.right <= box.right + 1 &&
            getComputedStyle(image).maxHeight === 'none';
        })`), `${width}px: project images must use the full row width without special portrait limits`);
        assert.ok(await evaluate('document.documentElement.scrollWidth <= innerWidth'));
      }
      await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
    });

    await t.test('skills remain text-only with the requested frontend, data, tools and AI groups', async () => {
      assert.equal(await evaluate("document.querySelector('#habilidades-title').textContent"), 'Habilidades');
      const skills = await evaluate(`Array.from(document.querySelectorAll('.skills__groups .content-section'), card => ({
        title: card.querySelector('h3').textContent,
        items: Array.from(card.querySelectorAll('li'), item => item.textContent),
        images: card.querySelectorAll('img').length
      }))`);
      assert.deepEqual(skills.map(({ title, items }) => [title, items]), [
        ['FRONTEND', ['HTML semántico y CSS', 'JavaScript y TypeScript', 'React y Next.js', 'Tailwind, Bootstrap, Sass, BEM', 'Diseño responsive']],
        ['Datos e integración', ['Firebase, Firestore', 'Supabase, MySQL, PostgreSQL', 'API REST', 'Python', 'Node.js', 'Google Cloud', 'Docker']],
        ['Herramientas', ['Git y GitHub', 'Vite y Vercel', 'Dominios y DNS', 'Performance y SEO', 'Analytics', 'Visual Studio Code', 'Code::Blocks']],
        ['Automatización & IA', ['n8n', 'Claude AI y OpenAI', 'GitHub Copilot', 'Gentle AI, Gentle Shell y Engram', 'Agentes de IA y LLMs', 'Webhooks', 'Integraciones con Telegram']],
      ]);
      assert.ok(skills.every((group) => group.images === 0));
    });

    await t.test('technology sphere rotates all logos with connected white spokes and endpoint dots below skills', async () => {
      await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] });
      for (const [width, height] of [[1280, 900], [390, 844]]) {
        await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false });
        const marquee = await evaluate(`(() => {
          const root = document.querySelector('#habilidades .technology-sphere');
          if (!root) return null;
          return { names: Array.from(root.querySelectorAll('img'), image => image.alt),
            afterList: !!(document.querySelector('.skills__groups').compareDocumentPosition(root) & Node.DOCUMENT_POSITION_FOLLOWING),
            width: root.getBoundingClientRect().width, height: root.getBoundingClientRect().height,
            viewportWidth: document.documentElement.clientWidth, overflow: getComputedStyle(root).overflowX };
        })()`);
        assert.ok(marquee, 'Missing connected technology sphere');
        assert.equal(marquee.names.length, 32, JSON.stringify(marquee.names));
        assert.equal(new Set(marquee.names).size, 32);
        assert.ok(['Proteus', 'MPLAB', 'PHP', 'Code::Blocks', 'Visual Studio Code'].every((name) => marquee.names.includes(name)));
        assert.ok(marquee.names.includes('GitHub Copilot') && marquee.names.includes('PostgreSQL') && marquee.names.includes('NestJS'));
        assert.ok(marquee.afterList);
        assert.ok(Math.abs(marquee.width - width) <= 1, 'Sphere region must span the viewport width');
        assert.equal(marquee.overflow, 'hidden');
        if (width < 640) assert.ok(Math.abs(marquee.height - height) <= 1, 'Mobile sphere must fill the viewport height');
        assert.equal(await evaluate("document.querySelectorAll('.technology-marquee').length"), 0);
        await evaluate("Promise.all(Array.from(document.querySelectorAll('.technology-sphere img'), image => { image.loading = 'eager'; return image.decode(); }))");
        await evaluate("document.querySelector('.technology-sphere').scrollIntoView({block:'center'})");
        await waitFor(() => evaluate("!!document.querySelector('.technology-sphere__node')?.style.transform"), 'Sphere projection did not initialize');
        const positions = () => evaluate("Array.from(document.querySelectorAll('.technology-sphere__node'), item => item.style.transform)");
        const start = await positions();
        await waitFor(async () => (await positions()).some((value, index) => value !== start[index]), 'Sphere must rotate while visible');
        await evaluate("document.querySelector('.technology-sphere__pause').click()");
        assert.equal(await evaluate("document.querySelector('.technology-sphere__pause').getAttribute('aria-pressed')"), 'true');
        const stopped = await positions();
        await evaluate('new Promise(resolve => setTimeout(resolve, 120))');
        assert.deepEqual(await positions(), stopped, 'Pause must freeze the globe');
        assert.ok(await evaluate(`(() => {
          const root = document.querySelector('.technology-sphere');
          const lines = Array.from(root.querySelectorAll('.technology-sphere__line'));
          const dots = Array.from(root.querySelectorAll('.technology-sphere__dot'));
          const nodes = Array.from(root.querySelectorAll('.technology-sphere__node'));
          const center = root.querySelector('.technology-sphere__center');
          const depths = nodes.map(node => Number(node.dataset.depth));
          const scales = nodes.map(node => new DOMMatrixReadOnly(getComputedStyle(node).transform).m11);
          const xs = nodes.map(node => Number(node.dataset.x));
          const ys = nodes.map(node => Number(node.dataset.y));
          const flattening = (Math.max(...ys) - Math.min(...ys)) / (Math.max(...xs) - Math.min(...xs));
          return lines.length === 32 && dots.length === 32 && Math.max(...depths) - Math.min(...depths) > 0.5 &&
            Math.max(...scales) > 1.75 && Math.min(...scales) < 0.8 && Math.max(...scales) / Math.min(...scales) > 2.4 &&
            flattening < 0.9 && Number(center.getAttribute('r')) > 5 &&
            Number(center.getAttribute('cy')) < root.clientHeight / 2 &&
            lines.every((line, index) => {
              const dot = dots[index]; const style = getComputedStyle(line);
              const logoBox = nodes[index].querySelector('img').getBoundingClientRect();
              const gap = root.getBoundingClientRect().top + Number(dot.getAttribute('cy')) - logoBox.bottom;
              return line.getAttribute('x1') === center.getAttribute('cx') && line.getAttribute('y1') === center.getAttribute('cy') &&
                line.getAttribute('x2') === dot.getAttribute('cx') && line.getAttribute('y2') === dot.getAttribute('cy') &&
                Math.abs(Number(dot.getAttribute('cx')) - Number(nodes[index].dataset.x)) < 0.01 &&
                Math.abs(Number(dot.getAttribute('cy')) - Number(nodes[index].dataset.y)) < 0.01 &&
                style.stroke === 'rgb(255, 255, 255)' && getComputedStyle(dot).fill === 'rgb(255, 255, 255)' &&
                Number(dot.getAttribute('r')) > parseFloat(style.strokeWidth) && gap >= -0.1 && gap <= 9;
            });
        })()`), 'The globe needs enlarged foreground logos, a nearer hub, and a flatter Y silhouette with aligned connections');
        await evaluate("document.querySelector('.technology-sphere__pause').click()");
        assert.ok(await evaluate('document.documentElement.scrollWidth <= innerWidth'));
      }
      await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
      await evaluate('new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))');
      const still = await evaluate("Array.from(document.querySelectorAll('.technology-sphere__node'), item => item.style.transform)");
      await evaluate('new Promise(resolve => setTimeout(resolve, 120))');
      assert.deepEqual(await evaluate("Array.from(document.querySelectorAll('.technology-sphere__node'), item => item.style.transform)"), still, 'Reduced-motion preference must freeze the sphere');
      assert.ok(await evaluate('document.documentElement.scrollWidth <= innerWidth'));
      await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] });
      await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
    });

    await t.test('sphere dragging controls both axes and speed, then smoothly returns to its default rotation', async () => {
      await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
      await evaluate("document.querySelector('.technology-sphere').scrollIntoView({block:'center'})");
      assert.ok(await evaluate("!!document.querySelector('.technology-sphere__interaction')"), 'Missing sphere drag surface');
      const pose = () => evaluate("Array.from(document.querySelectorAll('.technology-sphere__node'), node => ({ x:Number(node.dataset.x), y:Number(node.dataset.y), depth:Number(node.dataset.depth) }))");
      const delay = ms => evaluate(`new Promise(resolve => setTimeout(resolve, ${ms}))`);
      const distance = (a, b) => Math.sqrt(a.reduce((sum, point, index) => sum + (point.x - b[index].x) ** 2 + (point.y - b[index].y) ** 2, 0) / a.length);
      const drag = async (dx, dy, duration = 30, layer = 'front') => {
        const {x,y} = await sphereHitPoint(layer);
        await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y });
        await send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 });
        await delay(duration);
        await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: x + dx, y: y + dy, button: 'left', buttons: 1 });
        await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: x + dx, y: y + dy, button: 'left', clickCount: 1 });
      };
      await evaluate("document.querySelector('.technology-sphere__pause').click()");
      const original = await pose();
      await drag(50, 30, 30, 'air');
      assert.deepEqual(await pose(), original, 'Dragging empty space must not turn the paused globe');
      await drag(50, 30, 30, 'rear');
      assert.deepEqual(await pose(), original, 'Rear-layer logos must not start a drag');
      assert.equal(await evaluate("document.querySelector('.technology-sphere__hint')?.getClientRects().length ?? 0"), 0, 'The visible sphere caption must be removed');
      const front = original.reduce((best, point, index) => point.depth > original[best].depth ? index : best, 0);
      await drag(40, 0);
      const right = await pose();
      assert.ok(right[front].x > original[front].x + 10, 'Horizontal drag must turn the globe toward the gesture');
      await drag(-40, 0);
      assert.ok(distance(original, await pose()) < 0.1, 'Opposite horizontal drag must reverse the rotation');
      await drag(0, 40);
      assert.ok((await pose())[front].y > original[front].y + 10, 'Vertical drag must rotate on the second axis');
      await drag(0, -40);
      assert.ok(distance(original, await pose()) < 0.1, 'Opposite vertical drag must reverse the rotation');
      await evaluate("document.querySelector('.technology-sphere__interaction').focus({preventScroll:true})");
      await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'ArrowRight', code: 'ArrowRight', windowsVirtualKeyCode: 39 });
      assert.ok(distance(original, await pose()) > 5, 'Keyboard users must also be able to rotate the sphere');
      await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'ArrowLeft', code: 'ArrowLeft', windowsVirtualKeyCode: 37 });
      assert.ok(distance(original, await pose()) < 0.1, 'Opposite arrow keys must reverse their rotation');
      assert.equal(await evaluate("document.querySelector('.technology-sphere__pause').getAttribute('aria-pressed')"), 'true', 'Dragging must not silently change an explicit pause');
      await evaluate("document.querySelector('.technology-sphere__pause').click()");
      const baselineStart = await pose(); await delay(120);
      const baseline = distance(baselineStart, await pose());
      await drag(24, 0, 160);
      const slowStart = await pose(); await delay(120);
      const slow = distance(slowStart, await pose());
      await drag(120, 0, 20);
      const fastStart = await pose(); await delay(120);
      const fast = distance(fastStart, await pose());
      assert.ok(fast > slow * 1.5, 'A fast drag must leave more rotational inertia than a slow one');
      assert.ok(fast > baseline * 2, 'A fling must temporarily exceed the default speed');
      await delay(2800);
      const idleStart = await pose(); await delay(120);
      const idle = distance(idleStart, await pose());
      assert.ok(idle > baseline * 0.5 && idle < baseline * 1.8, 'Idle rotation must return to the normal automatic pace');
      await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
      await delay(50);
      const reducedBefore = await pose(); await drag(30, 20);
      const reducedAfter = await pose();
      assert.ok(distance(reducedBefore, reducedAfter) > 5, 'Reduced motion must still permit direct manipulation');
      await delay(150);
      assert.deepEqual(await pose(), reducedAfter, 'Reduced motion must suppress release inertia and autonomous rotation');
      await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] });
    });

    await t.test('sphere supports foreground-logo touch dragging and native page scrolling through empty space', async () => {
      await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
      await send('Emulation.setTouchEmulationEnabled', { enabled: true });
      try {
        await evaluate("document.querySelector('.technology-sphere').scrollIntoView({block:'center'})");
        assert.equal(await evaluate("getComputedStyle(document.querySelector('.technology-sphere__interaction')).pointerEvents"), 'none');
        const {x,y} = await sphereHitPoint();
        const before = await evaluate("document.querySelector('.technology-sphere__node').style.transform");
        await send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
        await send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x + 40, y: y + 40 }] });
        await send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
        assert.notEqual(await evaluate("document.querySelector('.technology-sphere__node').style.transform"), before);
        const scroll = await evaluate('scrollY');
        const air = await sphereHitPoint('air');
        await send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [air] });
        await send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: air.x, y: air.y - 160 }] });
        await send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
        await waitFor(() => evaluate(`scrollY > ${scroll} + 20`), 'The full-height sphere must not trap mobile page scrolling');
      } finally {
        await send('Emulation.setTouchEmulationEnabled', { enabled: false });
        await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
      }
    });

    await t.test('skills, education and contact use open sections instead of boxed cards', async () => {
      assert.equal(await evaluate("document.querySelectorAll('.info-card, .card-grid, .contact__card').length"), 0);
      assert.equal(await evaluate("document.querySelectorAll('[data-project-group=other] > .project-card').length"), 3);
      for (const [width, height] of [[1280, 900], [820, 1180], [390, 844]]) {
        await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false });
        assert.ok(await evaluate(`(() => {
          const groups = Array.from(document.querySelectorAll('.skills__groups > .content-section'));
          return groups.length === 4 && groups.every((group, index) => {
            const rect = group.getBoundingClientRect();
            const style = getComputedStyle(group);
            return style.backgroundColor === 'rgba(0, 0, 0, 0)' && style.borderRadius === '0px' &&
              (innerWidth <= 640 ? index === 0 || rect.top >= groups[index - 1].getBoundingClientRect().bottom :
                Math.abs(rect.top - groups[index - index % 2].getBoundingClientRect().top) < 1 &&
                (index < 2 || rect.top >= groups[index - 2].getBoundingClientRect().bottom));
          });
        })()`), 'Skills must use two columns on desktop/tablet and one on mobile');
        assert.ok(await evaluate("document.querySelectorAll('#sobre-mi .content-section').length === 6"));
        assert.deepEqual(await evaluate("Array.from(document.querySelectorAll('#sobre-mi .education__logo'), image => image.alt)"), ['Universidad Nacional de Lanús', 'Coderhouse', 'EducaciónIT', 'Platzi']);
        await evaluate("Promise.all(Array.from(document.querySelectorAll('.education__logo'), image => { image.loading = 'eager'; return image.decode(); }))");
        assert.ok(await evaluate(`(() => {
          const courses = document.querySelector('.education__certifications');
          const title = courses?.querySelector('.education__subtitle');
          const degree = document.querySelector('.education__main > .content-section');
          return courses && title && getComputedStyle(courses).borderTopWidth === '1px' &&
            courses.getBoundingClientRect().top >= degree.getBoundingClientRect().bottom &&
            title.getBoundingClientRect().top > courses.getBoundingClientRect().top;
        })()`), 'The courses heading must follow the degree separator');
        assert.ok(await evaluate("Array.from(document.querySelectorAll('#sobre-mi .content-section, .contact__invitation')).every(node => { const style = getComputedStyle(node); return style.borderRadius === '0px' && style.backgroundColor === 'rgba(0, 0, 0, 0)' && style.borderLeftWidth === '0px'; })"));
        assert.ok(await evaluate('document.documentElement.scrollWidth <= innerWidth'));
      }
    });

    await t.test('theme changes neutral colors but preserves orange and images', async () => {
      const accent = await evaluate("getComputedStyle(document.documentElement).getPropertyValue('--color-accent').trim()");
      await click('theme-toggle');
      await waitFor(() => evaluate("document.documentElement.dataset.theme === 'dark'"), 'Dark theme did not apply');
      assert.equal(await evaluate("document.getElementById('theme-toggle').getAttribute('aria-checked')"), 'true');
      assert.equal(await evaluate("getComputedStyle(document.body).color"), 'rgb(255, 255, 255)');
      assert.equal(await evaluate("getComputedStyle(document.querySelector('.project-card')).backgroundColor"), 'rgba(0, 0, 0, 0)');
      assert.equal(await evaluate("getComputedStyle(document.querySelector('[data-project-group=other] article')).backgroundColor"), 'rgba(0, 0, 0, 0)');
      assert.equal(await evaluate("getComputedStyle(document.documentElement).getPropertyValue('--color-accent').trim()"), accent);
      assert.equal(await evaluate("getComputedStyle(document.querySelector('.hero__image')).filter"), 'none');
    });

    await t.test('language updates all sections, metadata and card content independently', async () => {
      await click('language-toggle');
      await waitFor(() => evaluate("document.documentElement.lang === 'en'"), 'English did not apply');
      const labels = await evaluate("[...document.querySelectorAll('h2')].map(node => node.textContent)");
      assert.deepEqual(labels, ['Featured projects', 'LEARNING', 'OTHER', 'Professional experience', 'Skills', 'Education', 'Let’s talk about your next project']);
      assert.deepEqual(await evaluate("Array.from(document.querySelectorAll('[data-project-group] article'), card => Array.from(card.querySelectorAll('[data-technology]'), item => item.dataset.technology))"), expectedStacks);
      assert.equal(await evaluate("document.querySelectorAll('.skills__groups img').length"), 0);
      assert.equal(await evaluate("document.querySelectorAll('#habilidades .technology-sphere img').length"), 32);
      assert.ok(await evaluate("['Claude AI', 'OpenAI', 'GitHub Copilot', 'Gentle AI', 'Gentle Shell', 'Engram', 'Node.js', 'Docker'].every(name => document.getElementById('habilidades').textContent.includes(name))"));
      assert.deepEqual(await evaluate("Array.from(document.querySelectorAll('.projects__subtitle'), node => node.textContent)"), ['FEATURED', 'LEARNING', 'OTHER']);
      assert.deepEqual(await evaluate("Array.from(document.querySelectorAll('.experience__period'), node => node.textContent)"), ['2026 - Present', '2024 - 2026']);
      assert.equal(await evaluate("document.querySelector('.project-card__title').textContent"), 'Total Mecánica vehicle history');
      assert.match(await evaluate('document.title'), /Software development/);
      assert.equal(await evaluate('document.documentElement.dataset.theme'), 'dark');
      assert.equal(await evaluate("document.querySelector('.site-header__role').textContent"), 'Frontend Developer');
      assert.match(await evaluate("document.querySelector('.hero__description').textContent"), /continuous growth.*lifelong learning.*quality products.*Information Systems.*Universidad Nacional de Lanús/);
      assert.deepEqual(await evaluate("Array.from(document.querySelectorAll('[data-project-group=featured] .project-card__category'), node => node.textContent)"), Array(4).fill('In production'));
      assert.match(await evaluate("Array.from(document.querySelectorAll('[data-project-group=training] article')).find(node => node.textContent.includes('The Mobile Shop')).querySelector('.project-card__description').textContent"), /checkout.*NoSQL.*Context API.*Firestore.*final.*Coderhouse.*React/);
      assert.deepEqual(await evaluate("Array.from(document.querySelectorAll('.skills__groups > .content-section')).slice(2).map(section => section.querySelectorAll('li').length)"), [7,7]);
      await click('whatsapp-tab-toggle');
      assert.equal(await evaluate("document.querySelector('#whatsapp-tab-panel a').textContent.trim()"), 'Contact via WhatsApp');
      await click('whatsapp-tab-toggle');
    });

    await t.test('projects preserve groups, facts, destinations and layout in both languages', async () => {
      const snapshot = () => evaluate(`Array.from(document.querySelectorAll('[data-project-group]'), group => ({
        group: group.dataset.projectGroup,
        cards: Array.from(group.querySelectorAll('article'), card => ({
          title: card.querySelector('h3').textContent,
           description: card.querySelector('.project-card__description').textContent,
          contribution: card.querySelector('.project-card__details p')?.textContent ?? null,
          metric: card.querySelector('.project-card__metric')?.textContent ?? null,
           status: card.querySelector('.project-card__status')?.textContent ?? null,
          links: Array.from(card.querySelectorAll('a'), link => [link.getAttribute('href'), link.firstChild.textContent.trim()]),
          emptyHeading: Array.from(card.querySelectorAll('h3, h4')).some(heading => !heading.textContent.trim())
        }))
      }))`);
      const english = await snapshot();
      assert.deepEqual(english.map((group) => group.group), ['featured', 'training', 'other']);
      assert.deepEqual(english.map((group) => group.cards.map((card) => card.title)), [
        ['Total Mecánica vehicle history', 'Aureq', 'Total Mecánica website', 'Ayelén Argerich website'],
        ['The Mobile Shop', 'Online Hardware Store', 'Andes Xtreme'],
        ['Multiplayer Trivia in C', 'Timing System in Assembly', 'Eventyfier'],
      ]);
      const cards = english.flatMap((group) => group.cards);
      assert.ok(cards.every((card) => card.description.startsWith('I ') && !card.emptyHeading));
      assert.match(cards[0].description, /over 3,000 records/);
      assert.match(cards[0].contribution, /XML to JSON.*Firestore.*React.*Firebase Authentication/);
      assert.equal(cards[0].status, null);
      assert.match(cards[1].contribution, /Astro.*GSAP/);
      assert.match(cards[2].description, /Banfield/);
      assert.match(cards[2].contribution, /Next.js.*static export.*existing hosting.*technical SEO.*Google Analytics/);
      assert.ok([3, 4, 5, 6].every((index) => cards[index].contribution === null));
      assert.match(cards[7].description, /linked lists, dynamic memory and files/);
      assert.match(cards[8].description, /PIC16F84A.*display control and interrupt handling/);
      assert.match(cards[9].description, /React calendar.*Telegram bot.*text or audio/);
      assert.equal(cards[9].status, 'Demo offline.');
      assert.deepEqual(cards.map((card) => card.links), [
        [['https://lnkd.in/p/d6vi4X_H', 'View demo video']],
        [['https://aureq.com.ar', 'View site']],
        [['https://www.totalmecanica.com.ar', 'View site']],
        [['https://ayelenargerich.com', 'View site']],
        [['https://proyecto-coderhouse-react.vercel.app/', 'View demo']],
        [['https://java-script-theta.vercel.app/', 'View demo']],
        [['https://andesxtreme.netlify.app/', 'View site']],
        [['https://lnkd.in/p/dSdJyh5F', 'View demo video']],
        [['https://lnkd.in/p/dXZXnC-8', 'View demo video']], [],
      ]);

      await click('language-toggle');
      await waitFor(() => evaluate("document.documentElement.lang === 'es'"), 'Spanish did not apply');
      const spanish = await snapshot();
      assert.deepEqual(spanish.map((group) => group.cards.map((card) => card.title)), [
        ['Historial vehicular de Total Mecánica', 'Aureq', 'Sitio web de Total Mecánica', 'Sitio web de Ayelén Argerich'],
        ['The Mobile Shop', 'Ferretería Online', 'Andes Xtreme'],
        ['Trivia multijugador en C', 'Sistema de temporización en Assembler', 'Eventyfier'],
      ]);
      assert.equal(spanish[0].cards[0].status, null);
      assert.deepEqual([spanish[0].cards[0].links, spanish[2].cards[0].links, spanish[2].cards[1].links], [
        [['https://lnkd.in/p/d6vi4X_H', 'Ver video demostración']],
        [['https://lnkd.in/p/dSdJyh5F', 'Ver video demostración']],
        [['https://lnkd.in/p/dXZXnC-8', 'Ver video demostración']],
      ]);
      const siteLinks = await evaluate(`Array.from(document.querySelectorAll('.project-card__destination'), destination => ({
        text: destination.textContent, href: destination.closest('a').getAttribute('href'),
        beforeArrow: destination.nextElementSibling?.textContent === '↗'
      }))`);
      assert.deepEqual(siteLinks.map(({ text, href }) => [text, href]), [
        ['(https://aureq.com.ar)', 'https://aureq.com.ar'],
        ['(https://www.totalmecanica.com.ar)', 'https://www.totalmecanica.com.ar'],
        ['(https://ayelenargerich.com)', 'https://ayelenargerich.com'],
      ]);
      assert.ok(siteLinks.every((link) => link.beforeArrow));
      assert.equal(spanish[2].cards[2].status, 'Demo fuera de línea.');
      assert.deepEqual(spanish[2].cards[2].links, []);

      for (const [label, width, height] of [['desktop', 1280, 900], ['mobile', 390, 844]]) {
        await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false });
        const pageWidth = await evaluate("document.querySelector('.hero').getBoundingClientRect().width");
        const expectedWidth = label === 'desktop' ? width * 0.8 : await evaluate('document.documentElement.clientWidth');
        assert.ok(Math.abs(pageWidth - expectedWidth) <= 1, `${label}: page width ${pageWidth}, expected ${expectedWidth}`);
        assert.ok(await evaluate('document.documentElement.scrollWidth <= innerWidth'), `${label}: page overflow`);
        assert.ok(await evaluate(`Array.from(document.querySelectorAll('.project-card')).every(card => {
          const image = card.querySelector('img').getBoundingClientRect();
          const content = card.querySelector('.project-card__content').getBoundingClientRect();
          return matchMedia('(orientation: portrait)').matches ? image.bottom <= content.top : content.right <= image.left;
        })`), `${label}: project layout`);
        assert.ok(await evaluate("Array.from(document.querySelectorAll('.project-card__description')).every(node => node.scrollWidth <= node.clientWidth)"), `${label}: text overflow`);
        assert.equal(await evaluate("document.querySelectorAll('.project-card').length"), 10);
        if (process.env.PORTFOLIO_TEST_SCREENSHOTS) {
          await evaluate("document.getElementById('proyectos').scrollIntoView()");
          const clip = await evaluate("(() => { const rect = document.querySelector('.project-card').getBoundingClientRect(); return { x: rect.left + scrollX, y: rect.top + scrollY, width: rect.width, height: rect.height, scale: 1 }; })()");
          const screenshot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip });
          await writeFile(join(process.env.PORTFOLIO_TEST_SCREENSHOTS, `portfolio-projects-${label}.png`), Buffer.from(screenshot.data, 'base64'));
        }
      }
      await click('language-toggle');
      await waitFor(() => evaluate("document.documentElement.lang === 'en'"), 'English did not restore');
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
      const mobilePortrait = await evaluate("document.querySelector('.hero__portrait').getBoundingClientRect().width");
      assert.ok(mobilePortrait >= 300, `Mobile portrait is too small: ${mobilePortrait}`);
      await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
      const desktopPortrait = await evaluate("document.querySelector('.hero__portrait').getBoundingClientRect().width");
      assert.ok(desktopPortrait >= 320, `Desktop portrait is too small: ${desktopPortrait}`);
      assert.ok(await evaluate('document.documentElement.scrollWidth <= innerWidth'));
    });
    await t.test('desktop hero fills the viewport below the measured header', async () => {
      for (const width of [1280, 980]) {
        await send('Emulation.setDeviceMetricsOverride', { width, height: 1000, deviceScaleFactor: 1, mobile: false });
        await evaluate('document.fonts.ready');
        await evaluate('new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))');
        const size = await evaluate(`(() => {
          const hero = document.querySelector('.hero');
          return {
            hero: hero.getBoundingClientRect().height,
            header: document.querySelector('.site-header').getBoundingClientRect().height,
            measuredHeader: parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-height')),
            viewport: innerHeight,
            eyebrow: !!hero.querySelector('.hero__eyebrow'),
            title: parseFloat(getComputedStyle(hero.querySelector('h1')).fontSize),
            portrait: hero.querySelector('.hero__portrait').getBoundingClientRect().width,
            button: hero.querySelector('.hero__actions > .button').getBoundingClientRect().height
          };
        })()`);
        assert.ok(size.header + size.hero >= size.viewport - 1, `${width}px: header + hero must fill the viewport`);
        assert.ok(Math.abs(size.header - size.measuredHeader) <= 1, `${width}px: actual header height must be used`);
        if (width === 1280) {
          assert.ok(Math.abs(size.header + size.hero - size.viewport) <= 1, 'Hero should end at the viewport edge when its content fits');
          assert.ok(size.title > 75 && size.portrait > 400 && size.button >= 56);
        }
        assert.equal(size.eyebrow, false);
        assert.ok(await evaluate('document.documentElement.scrollWidth <= innerWidth'));
      }
      await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: false });
      assert.ok(['auto', '0px'].includes(await evaluate("getComputedStyle(document.querySelector('.hero')).minHeight")));
      assert.ok(await evaluate('document.documentElement.scrollWidth <= innerWidth'));
    });
    await t.test('project cards fill their content height and images keep their natural proportions', async () => {
      for (const [width, height] of [[1280, 900], [390, 844]]) {
        await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false });
        await evaluate("Promise.all(Array.from(document.querySelectorAll('#proyectos img'), image => { image.loading = 'eager'; return image.decode(); }))");
        const cards = await evaluate(`Array.from(document.querySelectorAll('.project-card'), card => {
          const content = card.querySelector('.project-card__content').getBoundingClientRect();
          const summary = card.querySelector('.project-card__summary')?.getBoundingClientRect();
          const footer = card.querySelector('.project-card__footer')?.getBoundingClientRect();
          const image = card.querySelector('img');
          const box = image.getBoundingClientRect();
          return {
            summaryAtTop: !!summary && Math.abs(summary.top - content.top) <= 1,
            footerAtBottom: !!footer && Math.abs(footer.bottom - content.bottom) <= 1,
            ratio: box.width / box.height,
            intrinsicRatio: image.naturalWidth / image.naturalHeight,
            radius: getComputedStyle(image).borderTopLeftRadius,
            background: getComputedStyle(image).backgroundColor
          };
        })`);
        assert.ok(cards.every((card) => card.summaryAtTop && card.footerAtBottom), `${width}px: content must span the full card height`);
        assert.ok(cards.every((card) => Math.abs(card.ratio - card.intrinsicRatio) < 0.01), `${width}px: no letterboxing or distortion`);
        assert.ok(cards.every((card) => card.background === 'rgba(0, 0, 0, 0)'));
        assert.ok(cards[0].intrinsicRatio > 1 && cards[0].ratio > 1, 'The replacement database screenshot must remain landscape');
        assert.equal(cards[0].radius, cards[1].radius, 'Database image must use the same rounding as other project images');
        assert.ok(await evaluate("Array.from(document.querySelectorAll('#proyectos a')).every(link => !link.href.includes('github.com'))"));
        assert.ok(await evaluate('document.documentElement.scrollWidth <= innerWidth'));
      }
    });
    await t.test('four localized full-width marquees animate left and project rows stay open', async () => {
      await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] });
      if (await evaluate('document.documentElement.lang') !== 'es') await click('language-toggle');
      for (const [width, height] of [[1280, 900], [390, 844]]) {
        await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false });
        const marquees = await evaluate(`Array.from(document.querySelectorAll('.section-marquee'), marquee => {
          const track = marquee.querySelector('.section-marquee__track');
          const style = getComputedStyle(marquee);
          const groups = Array.from(marquee.querySelectorAll('.section-marquee__group'));
          return { section:marquee.closest('section').id, text:marquee.querySelector('.section-marquee__word').textContent,
            font:style.fontFamily, casing:style.textTransform, width:marquee.getBoundingClientRect().width,
            hidden:marquee.getAttribute('aria-hidden'), groups:groups.map(group=>group.getBoundingClientRect().width),
            iterations:getComputedStyle(track).animationIterationCount, timing:getComputedStyle(track).animationTimingFunction };
        })`);
        assert.deepEqual(marquees.map((item) => item.section), ['proyectos', 'experiencia', 'habilidades', 'sobre-mi']);
        assert.deepEqual(marquees.map((item) => item.text), ['Proyectos', 'Experiencia', 'Habilidades', 'Formación']);
        assert.ok(marquees.every((item) => item.font.includes('DM Sans') && item.casing === 'uppercase' && item.hidden === 'true'));
        assert.ok(marquees.every((item) => item.iterations === 'infinite' && item.timing === 'linear' && item.groups.length === 2 && Math.abs(item.groups[0] - item.groups[1]) < 1));
        const available = await evaluate('document.documentElement.clientWidth');
        assert.ok(marquees.every((item) => Math.abs(item.width - available) <= 1), 'Marquees must reach both viewport edges');
        const positions = () => evaluate("Array.from(document.querySelectorAll('.section-marquee__track'), track => new DOMMatrixReadOnly(getComputedStyle(track).transform).m41)");
        const start = await positions();
        await evaluate('new Promise(resolve => setTimeout(resolve, 140))');
        const end = await positions();
        assert.ok(end.every((position, index) => position < start[index]), 'Marquees must move from right to left');
        assert.ok(await evaluate("Array.from(document.querySelectorAll('.project-card')).every(card => { const s=getComputedStyle(card); return s.backgroundColor === 'rgba(0, 0, 0, 0)' && s.borderRadius === '0px' && s.borderLeftWidth === '0px' && s.borderRightWidth === '0px'; })"));
        assert.equal(await evaluate("document.querySelectorAll('.info-card').length"), 0);
        assert.equal(await evaluate("getComputedStyle(document.documentElement).getPropertyValue('--color-accent').trim()"), '#b64012');
        const database = await evaluate("(() => { const image=document.querySelector('.project-card__image'); return { landscape:image.naturalWidth > image.naturalHeight, src:image.src, radius:getComputedStyle(image).borderRadius }; })()");
        assert.ok(database.landscape && database.src.includes('baseinteractiva-anonimizada.'));
        assert.equal(database.radius, '12px');
        assert.ok(await evaluate('document.documentElement.scrollWidth <= innerWidth'));
        if (process.env.PORTFOLIO_TEST_SCREENSHOTS) {
          for (const section of ['proyectos', 'experiencia']) {
            await evaluate(`document.getElementById('${section}').scrollIntoView({block:'start'})`);
            const screenshot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
            await writeFile(join(process.env.PORTFOLIO_TEST_SCREENSHOTS, `portfolio-marquee-${section}-${width}.png`), Buffer.from(screenshot.data, 'base64'));
          }
        }
      }
      await click('language-toggle');
      await waitFor(() => evaluate("document.documentElement.lang === 'en'"), 'English marquees did not apply');
      assert.deepEqual(await evaluate("Array.from(document.querySelectorAll('.section-marquee'), node => node.querySelector('.section-marquee__word').textContent)"), ['Projects', 'Experience', 'Skills', 'Education']);
      await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
      assert.ok(await evaluate("Array.from(document.querySelectorAll('.section-marquee__track')).every(track => getComputedStyle(track).animationName === 'none')"));
      assert.ok(await evaluate("Array.from(document.querySelectorAll('.section-marquee')).every(marquee => { const words=Array.from(marquee.querySelectorAll('.section-marquee__word')).filter(word=>word.getClientRects().length); return words.length === 1 && words[0].getBoundingClientRect().width <= marquee.getBoundingClientRect().width; })"));
      assert.equal(await evaluate("document.querySelectorAll('.section__title').length"), 1);
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
