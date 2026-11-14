import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const html = readFileSync(new URL('../dist/index.html', import.meta.url), 'utf8');
const images = [...html.matchAll(/<img\b[^>]*>/g)].map(([tag]) => tag);

test('hero is responsive, optimized and prioritized; other content images stay lazy', () => {
  const hero = images.find(tag => tag.includes('hero__image'));
  assert.ok(hero?.includes('srcSet=') || hero?.includes('srcset='), 'Hero needs responsive variants');
  assert.match(hero, /loading="eager"/);
  assert.match(hero, /fetchPriority="high"|fetchpriority="high"/);
  assert.match(hero, /sizes=/);
  for (const image of images.filter(tag => !/hero__image|intro-loader__logo/.test(tag))) {
    assert.match(image, /loading="lazy"/);
    assert.match(image, /width="\d+"/);
    assert.match(image, /height="\d+"/);
    if (image.includes('project-card__image')) {
      assert.match(image, /srcSet=|srcset=/);
      assert.match(image, /\.webp/);
    }
  }
});

test('intro and critical preloads are present in initial HTML', () => {
  assert.match(html, /id="intro-loader"/);
  assert.match(html, /id="intro-liquid-clip"/);
  assert.match(html, /rel="preload"[^>]*as="image"/);
  assert.equal((html.match(/rel="preload"[^>]*as="font"/g) ?? []).length, 2);
  assert.match(html, /intro:timeout/);
});

test('every emitted image source and responsive candidate exists in the build', () => {
  for (const image of images) {
    const src = image.match(/\ssrc="([^"]+)"/)?.[1];
    const srcSet = image.match(/\ssrcset="([^"]+)"/i)?.[1];
    const urls = [src, ...(srcSet?.split(',').map(candidate => candidate.trim().split(' ')[0]) ?? [])];
    for (const url of urls) {
      assert.ok(url?.startsWith('/'), 'Image sources must be local');
      assert.ok(existsSync(new URL(`../dist${url}`, import.meta.url)), `Missing built image: ${url}`);
    }
  }
});
