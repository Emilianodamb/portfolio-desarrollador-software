import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
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
      assert.equal(await evaluate("getComputedStyle(document.querySelector('.project-card')).backgroundColor"), 'rgba(0, 0, 0, 0)');
      assert.equal(await evaluate("getComputedStyle(document.querySelector('.info-card--compact')).backgroundColor"), 'rgb(0, 0, 0)');
      assert.equal(await evaluate("getComputedStyle(document.documentElement).getPropertyValue('--color-accent').trim()"), accent);
      assert.equal(await evaluate("getComputedStyle(document.querySelector('.hero__image')).filter"), 'none');
    });

    await t.test('language updates all sections, metadata and card content independently', async () => {
      await click('language-toggle');
      await waitFor(() => evaluate("document.documentElement.lang === 'en'"), 'English did not apply');
      const labels = await evaluate("[...document.querySelectorAll('h2')].map(node => node.textContent)");
      assert.deepEqual(labels, ['Featured projects', 'Learning projects', 'Other technical projects', 'Professional experience', 'Skills and methodology', 'Education and profile', 'Let’s talk about your next project']);
      assert.equal(await evaluate("document.querySelector('.project-card__title').textContent"), 'Total Mecánica vehicle history');
      assert.match(await evaluate('document.title'), /Software development/);
      assert.equal(await evaluate('document.documentElement.dataset.theme'), 'dark');
    });

    await t.test('projects preserve groups, facts, destinations and layout in both languages', async () => {
      const snapshot = () => evaluate(`Array.from(document.querySelectorAll('[data-project-group]'), group => ({
        group: group.dataset.projectGroup,
        cards: Array.from(group.querySelectorAll('article'), card => ({
          title: card.querySelector('h3').textContent,
          description: card.querySelector('.project-card__description, .info-card__description').textContent,
          contribution: card.querySelector('.project-card__details p')?.textContent ?? null,
          metric: card.querySelector('.project-card__metric')?.textContent ?? null,
          status: card.querySelector('.project-card__status, .info-card__status')?.textContent ?? null,
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
      assert.equal(cards[0].status, 'Restricted access');
      assert.match(cards[1].contribution, /Astro.*GSAP/);
      assert.match(cards[2].description, /Banfield/);
      assert.match(cards[2].contribution, /Next.js.*static export.*existing hosting.*technical SEO.*Google Analytics/);
      assert.ok([3, 4, 5, 6].every((index) => cards[index].contribution === null));
      assert.match(cards[7].description, /linked lists, dynamic memory and files/);
      assert.match(cards[8].description, /PIC16F84A.*display control and interrupt handling/);
      assert.match(cards[9].description, /React calendar.*Telegram bot.*text or audio/);
      assert.equal(cards[9].status, 'Demo offline.');
      assert.deepEqual(cards.map((card) => card.links), [
        [['https://total-mecanica.vercel.app/', 'View application']],
        [['https://aureq.com.ar', 'View site']],
        [['https://www.totalmecanica.com.ar', 'View site']],
        [['https://ayeargerich.com', 'View site']],
        [['https://proyecto-coderhouse-react.vercel.app/', 'View demo']],
        [['https://java-script-theta.vercel.app/', 'View demo']],
        [['https://andesxtreme.netlify.app/', 'View site']],
        [], [], [],
      ]);

      await click('language-toggle');
      await waitFor(() => evaluate("document.documentElement.lang === 'es'"), 'Spanish did not apply');
      const spanish = await snapshot();
      assert.deepEqual(spanish.map((group) => group.cards.map((card) => card.title)), [
        ['Historial vehicular de Total Mecánica', 'Aureq', 'Sitio web de Total Mecánica', 'Sitio web de Ayelén Argerich'],
        ['The Mobile Shop', 'Ferretería Online', 'Andes Xtreme'],
        ['Trivia multijugador en C', 'Sistema de temporización en Assembler', 'Eventyfier'],
      ]);
      assert.equal(spanish[0].cards[0].status, 'Acceso restringido');
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
        assert.ok(await evaluate("Array.from(document.querySelectorAll('.project-card__description, .info-card__description')).every(node => node.scrollWidth <= node.clientWidth)"), `${label}: text overflow`);
        assert.ok(await evaluate("Array.from(document.querySelectorAll('.info-card--compact img')).every(image => image.getBoundingClientRect().height <= 150)"));
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
        assert.ok(cards[0].intrinsicRatio < 0.6 && cards[0].ratio < 0.6, 'Full phone mockup must stay vertical');
        assert.equal(cards[0].radius, '50px');
        assert.ok(await evaluate("Array.from(document.querySelectorAll('#proyectos a')).every(link => !link.href.includes('github.com'))"));
        assert.ok(await evaluate('document.documentElement.scrollWidth <= innerWidth'));
      }
    });
    await t.test('two localized full-width marquees animate left and project rows stay open', async () => {
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
        assert.deepEqual(marquees.map((item) => item.section), ['proyectos', 'experiencia']);
        assert.deepEqual(marquees.map((item) => item.text), ['Proyectos', 'Experiencia']);
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
        assert.ok(await evaluate("Array.from(document.querySelectorAll('.info-card--compact')).every(card => getComputedStyle(card).borderRadius === '24px' && getComputedStyle(card).borderTopWidth === '1px')"));
        assert.equal(await evaluate("getComputedStyle(document.documentElement).getPropertyValue('--color-accent').trim()"), '#b64012');
        const phone = await evaluate("(() => { const image=document.querySelector('.project-card__image--portrait'); return [image.naturalWidth,image.naturalHeight,getComputedStyle(image).borderRadius]; })()");
        assert.deepEqual(phone, [1089, 2272, '50px']);
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
      assert.deepEqual(await evaluate("Array.from(document.querySelectorAll('.section-marquee'), node => node.querySelector('.section-marquee__word').textContent)"), ['Projects', 'Experience']);
      await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
      assert.ok(await evaluate("Array.from(document.querySelectorAll('.section-marquee__track')).every(track => getComputedStyle(track).animationName === 'none')"));
      assert.ok(await evaluate("Array.from(document.querySelectorAll('.section-marquee')).every(marquee => { const words=Array.from(marquee.querySelectorAll('.section-marquee__word')).filter(word=>word.getClientRects().length); return words.length === 1 && words[0].getBoundingClientRect().width <= marquee.getBoundingClientRect().width; })"));
      assert.equal(await evaluate("document.querySelectorAll('.section__title').length"), 3);
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
