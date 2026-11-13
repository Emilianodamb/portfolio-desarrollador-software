import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('sections omit description elements while retaining accessible headings and content', async () => {
  const section = await readFile(new URL('../src/components/Section.tsx', import.meta.url), 'utf8');
  assert.ok(!section.includes('section__description'));
  assert.ok(section.includes('aria-labelledby={`${id}-title`}'));
  assert.ok(section.includes('<h2 id={`${id}-title`}'));
  assert.ok(section.includes('{children}'));
});

test('section marquees size their headings relative to viewport height', async () => {
  const css = await readFile(new URL('../src/styles/global.css', import.meta.url), 'utf8');
  assert.match(css, /\.section-marquee\s*{[^}]*font-size:\s*40vh\s*;/);
  assert.match(css, /@media\s*\(max-width:\s*960px\)\s*{[\s\S]*?\.section-marquee\s*{\s*font-size:\s*25vh\s*;/);
});

test('built portfolio includes all reference sections and ten open project rows', async () => {
  const html = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
  for (const id of ['inicio', 'proyectos', 'experiencia', 'habilidades', 'sobre-mi', 'contacto']) {
    assert.ok(html.includes(`id="${id}"`), `Missing section: ${id}`);
  }
  assert.equal((html.match(/class="project-card"/g) ?? []).length, 10);
  assert.ok(html.includes('lang="es"'));
  assert.equal((html.match(/<h1[ >]/g) ?? []).length, 1);
  assert.ok(html.includes('id="cv-download"'));
  assert.ok(html.includes('href="/cv/es.pdf"'));
  assert.ok(html.includes('href="/cv/en.pdf"'));
  assert.ok(html.includes('https://github.com/Emilianodamb'));
  assert.ok(html.includes('mailto:emiliano.dambrosio.dev@gmail.com'));
  assert.ok(!html.includes('href="#"'));
  assert.ok(!html.includes('<form'));
  assert.ok(html.includes('astro-island'));
  assert.ok(!html.includes('cdn.tailwindcss.com'));
});

test('both CV downloads use their corresponding root CV source files', async () => {
  for (const [language, name] of [
    ['es', "CV_Emiliano_D'Ambrosio_Desarrollador_Frontend.pdf"],
    ['en', "CV_Emiliano_D'Ambrosio_Frontend_Developer.pdf"],
  ]) {
    const original = await readFile(new URL(`../CV/${name}`, import.meta.url));
    const published = await readFile(new URL(`../dist/cv/${language}.pdf`, import.meta.url));
    assert.deepEqual(published, original);
  }
});

test('local typography assets are included in the build', async () => {
  const html = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
  const stylesheet = html.match(/href="([^\"]+\.css)"/)[1];
  const css = await readFile(new URL(`../dist${stylesheet}`, import.meta.url), 'utf8');
  assert.match(css, /font-family:\s*["']?Cabinet Grotesk["']?;[^}]*font-weight:\s*500/);
  assert.match(css, /font-family:\s*["']?DM Sans["']?;[^}]*font-weight:\s*(?:400|normal)/);
  for (const asset of [
    'fonts/cabinet-grotesk/CabinetGrotesk-Medium.woff2',
    'fonts/cabinet-grotesk/FFL.txt',
    'fonts/dm-sans/DMSans-Regular.ttf',
    'fonts/dm-sans/OFL.txt',
  ]) {
    assert.ok((await readFile(new URL(`../dist/${asset}`, import.meta.url))).length > 0);
  }
});

test('hero publishes the supplied WebP with dimensions and descriptive alt text', async () => {
  const html = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
  const image = html.match(/<img\b[^>]*class="hero__image"[^>]*>/)?.[0];
  assert.ok(image, 'Missing hero image');
  assert.match(image, /alt="Emiliano D(?:'|&#x27;|&#39;)Ambrosio"/);
  assert.match(image, /width="\d+"/);
  assert.match(image, /height="\d+"/);
  const src = image.match(/src="([^"]+)"/)[1];
  const published = await readFile(new URL(`../dist${src}`, import.meta.url));
  const original = await readFile(new URL('../src/assets/profile-hd.webp', import.meta.url));
  assert.deepEqual(published, original);
});

test('project rows publish ten local images while skill lists remain text-only', async () => {
  const html = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
  const images = html.match(/<img\b[^>]*class="project-card__image(?: [^"]*)?"[^>]*>/g) ?? [];
  assert.equal(images.length, 10);
  for (const image of images) {
    assert.match(image, /loading="lazy"/);
    assert.match(image, /width="\d+"/);
    assert.match(image, /height="\d+"/);
    assert.match(image, /alt="[^"]+"/);
    const src = image.match(/src="([^"]+)"/)[1];
    assert.ok((await readFile(new URL(`../dist${src}`, import.meta.url))).length > 0);
  }
  const skillCard = html.match(/<section class="content-section">(?:(?!<\/section>)[\s\S])*?<h3 class="content-section__title">FRONTEND<\/h3>[\s\S]*?<\/section>/)?.[0];
  assert.ok(skillCard);
  assert.ok(!skillCard.includes('<img'));
});

test('featured websites appear once and use a portrait-only stacked layout', async () => {
  const html = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
  for (const title of ['Aureq', 'Sitio web de Total Mecánica', 'Sitio web de Ayelén Argerich']) {
    assert.equal(html.split(`<h3 class="project-card__title">${title}</h3>`).length - 1, 1);
  }
  for (const url of ['https://aureq.com.ar', 'https://www.totalmecanica.com.ar', 'https://ayelenargerich.com']) {
    assert.ok(html.includes(`href="${url}"`));
  }
  const css = await readFile(new URL('../src/styles/global.css', import.meta.url), 'utf8');
  assert.match(css, /grid-template-areas:\s*"content image"/);
  assert.match(css, /@media\s*\(orientation:\s*portrait\)\s*{\s*\.project-card\s*{[^}]*grid-template-areas:\s*"image"\s*"content"/);
});
