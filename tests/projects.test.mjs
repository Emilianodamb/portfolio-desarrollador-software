import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import test from 'node:test';

const expected = [
  {
    title: 'Historial vehicular de Total Mecánica', category: 'En producción',
    description: 'Desarrollé una aplicación para consultar y actualizar el historial de vehículos del taller. Migré más de 3.000 registros del sistema anterior y publiqué la aplicación para que el equipo pudiera acceder desde distintos dispositivos.',
    contribution: 'Transformé los registros históricos de XML a JSON para incorporarlos a Firestore. Implementé la búsqueda de historiales en React y el acceso mediante Firebase Authentication.',
    technologies: ['HTML', 'CSS', 'JavaScript', 'React', 'Tailwind CSS', 'Python', 'Firebase', 'Git', 'GitHub', 'Visual Studio Code'],
    links: [['https://lnkd.in/p/d6vi4X_H', 'Ver video demostración']],
  },
  {
    title: 'Aureq', category: 'En producción',
    description: 'Diseñé y publiqué el sitio de mi emprendimiento de desarrollo web para presentar sus servicios y facilitar el contacto con comercios y profesionales.',
    contribution: 'Organicé el contenido, desarrollé la interfaz adaptable con Astro e incorporé animaciones con GSAP.',
    technologies: ['HTML', 'CSS', 'JavaScript', 'Astro', 'GSAP', 'Git', 'GitHub', 'Google Cloud', 'Visual Studio Code'], links: [['https://aureq.com.ar', 'Ver sitio']],
  },
  {
    title: 'Sitio web de Total Mecánica', category: 'En producción',
    description: 'Desarrollé el sitio institucional de un taller mecánico de Banfield para presentar sus servicios y facilitar las consultas de potenciales clientes.',
    contribution: 'Migré el sitio a Next.js y configuré la exportación estática para mantener la compatibilidad con el alojamiento existente. También trabajé sobre el SEO técnico inicial e integré Google Analytics.',
    technologies: ['HTML', 'CSS', 'JavaScript', 'TypeScript', 'React', 'Vite', 'Next.js', 'Google Analytics', 'Git', 'GitHub', 'GitHub Copilot', 'Tailwind CSS', 'Visual Studio Code'],
    links: [['https://www.totalmecanica.com.ar', 'Ver sitio']],
  },
  {
    title: 'Sitio web de Ayelén Argerich', category: 'En producción',
    description: 'Desarrollé y publiqué el sitio de Ayelén Argerich para reunir la presentación de su trabajo y facilitar el contacto desde una página propia.',
    technologies: ['HTML', 'CSS', 'JavaScript', 'Astro', 'PHP', 'Git', 'GitHub', 'Visual Studio Code'], links: [['https://ayelenargerich.com', 'Ver sitio']],
  },
  {
    title: 'The Mobile Shop', category: 'E-commerce de práctica',
    description: 'Desarrollé una tienda de dispositivos con catálogo por categorías, carrito, flujo de pedido, checkout y base de datos NoSQL. Gestioné el estado compartido del carrito con Context API y guardé las órdenes en Firestore. Este proyecto formó parte del trabajo final del curso de React en Coderhouse.',
    technologies: ['HTML', 'CSS', 'JavaScript', 'React', 'Firebase', 'Git', 'GitHub', 'Visual Studio Code'],
    links: [['https://proyecto-coderhouse-react.vercel.app/', 'Ver demo'], ['https://github.com/Emilianodamb/proyecto-coderhouse-react', 'Ver repositorio']],
  },
  {
    title: 'Ferretería Online', category: 'E-commerce de práctica',
    description: 'Desarrollé una tienda interactiva con catálogo, filtros y un flujo de compra simulado. Usé JavaScript Vanilla para actualizar la interfaz y localStorage para recuperar el carrito al volver a abrir la página. Este proyecto fue el trabajo final del curso de Javascript de Coderhouse y fue la primera vez que desarrollé con un lenguaje de programación web.',
    technologies: ['HTML', 'CSS', 'JavaScript', 'Git', 'GitHub', 'Visual Studio Code'],
    links: [['https://java-script-theta.vercel.app/', 'Ver demo'], ['https://github.com/Emilianodamb/ferreteria-online', 'Ver repositorio']],
  },
  {
    title: 'Andes Xtreme', category: 'Sitio web de práctica',
    description: 'Maqueté un sitio responsive de turismo aventura para presentar actividades y destinos. Usé HTML semántico y organicé los estilos con Sass y la metodología BEM.',
    technologies: ['HTML', 'CSS', 'Bootstrap', 'Sass', 'Git', 'GitHub', 'Visual Studio Code'],
    links: [['https://andesxtreme.netlify.app/', 'Ver sitio'], ['https://github.com/Emilianodamb/andesXtreme', 'Ver repositorio']],
  },
];

test('contribution text remains visible without a heading label', async () => {
  const html = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
  const contributions = [...html.matchAll(/class="project-card__details">([\s\S]*?)<\/div>/g)].map((match) => match[1]);
  assert.equal(contributions.length, 3);
  assert.ok(contributions.every((content) => content.includes('<p>') && !content.includes('<h4')));
  assert.ok(!html.includes('class="project-card__label"'));
});

test('Spanish projects match the requested groups, copy, technologies and actions', async () => {
  const html = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
  assert.deepEqual([...html.matchAll(/data-project-group="([^"]+)"/g)].map((match) => match[1]), ['featured', 'training', 'other']);
  const groups = html.split(/data-project-group="(?:featured|training|other)"/).slice(1);
  assert.equal((groups[0].match(/class="project-card"/g) ?? []).length, 4);
  assert.equal((groups[1].match(/class="project-card"/g) ?? []).length, 3);
  const cards = [...html.matchAll(/<article class="project-card">[\s\S]*?<\/article>/g)].map((match) => match[0]).slice(0, 7);
  assert.equal(cards.length, expected.length);
  for (const [index, project] of expected.entries()) {
    const card = cards[index];
    assert.ok(card.includes(`>${project.title}</h3>`), project.title);
    for (const text of [project.category, project.description, project.contribution].filter(Boolean)) assert.ok(card.includes(text), text);
    assert.deepEqual([...card.matchAll(/data-technology="([^"]+)"/g)].map((match) => match[1]), project.technologies);
    for (const [url, label] of project.links) assert.ok(card.includes(`href="${url}"`) && card.includes(label), `${project.title}: ${label}`);
    assert.equal((card.match(/<a /g) ?? []).length, project.links.length);
    assert.equal((card.match(/class="project-card__label"/g) ?? []).length, 0);
  }
  assert.ok(cards[0].includes('3.000 registros'));
  assert.ok(!cards[0].includes('Acceso restringido'));
  assert.ok(cards[0].includes('baseinteractiva-anonimizada.'));
  const files = await readdir(new URL('../dist/_astro/', import.meta.url));
  assert.ok(!files.some((file) => file.startsWith('baseinteractiva.')), 'Original customer screenshot must not be published');
});

test('other projects reuse open rows with Eventyfier offline and without links', async () => {
  const html = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
  const cards = [...html.matchAll(/<article class="project-card">[\s\S]*?<\/article>/g)].map((match) => match[0]).slice(7);
  const titles = ['Trivia multijugador en C', 'Sistema de temporización en Assembler', 'Eventyfier'];
  const descriptions = [
    'Desarrollé un juego de trivia multijugador para terminal. Usé listas enlazadas, memoria dinámica y archivos para persistir datos entre ejecuciones.',
    'Implementé un sistema de temporización en Assembler para el PIC16F84A, con control de displays y manejo de interrupciones.',
    'Desarrollé un gestor de eventos con calendario en React y un bot de Telegram que permite cargar eventos por texto o audio.',
  ];
  assert.equal(cards.length, 3);
  for (const [index, title] of titles.entries()) {
    assert.ok(cards[index].includes(`>${title}</h3>`));
    assert.ok(cards[index].includes(descriptions[index]));
  }
  assert.deepEqual([...cards[0].matchAll(/data-technology="([^"]+)"/g)].map((match) => match[1]), ['C', 'Code::Blocks']);
  assert.deepEqual([...cards[1].matchAll(/data-technology="([^"]+)"/g)].map((match) => match[1]), ['Proteus', 'MPLAB', 'C']);
  assert.match(cards[0], /<img[^>]*class="technology-logo[^>]*alt="C"/);
  for (const [index, url] of [[0, 'https://lnkd.in/p/dSdJyh5F'], [1, 'https://lnkd.in/p/dXZXnC-8']]) {
    assert.ok(cards[index].includes(`href="${url}"`));
    assert.ok(cards[index].includes('Ver video demostración'));
    assert.match(cards[index], /target="_blank" rel="noopener noreferrer"/);
  }
  assert.ok(cards[2].includes('Demo fuera de línea.'));
  assert.ok(!cards[2].includes('<a '));
  assert.ok(!html.includes('Contenido provisional de la referencia'));
});

for (const [title, repository, video] of [
  ['Trivia multijugador en C', 'https://github.com/Emilianodamb/TP-FINAL-PROGRAMACION', 'https://lnkd.in/p/dSdJyh5F'],
  ['Sistema de temporización en Assembler', 'https://github.com/Emilianodamb/TP-FINAL-ARQUITECTURA-DE-COMPUTADORAS', 'https://lnkd.in/p/dXZXnC-8'],
]) {
  test(`${title} links to its repository without replacing the demo video`, async () => {
    const html = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
    const row = [...html.matchAll(/<article class="project-card">[\s\S]*?<\/article>/g)].map(match => match[0]).find(card => card.includes(`>${title}</h3>`));
    assert.ok(row);
    const link = row.match(new RegExp(`<a[^>]*href="${repository}"[^>]*>[\\s\\S]*?<\\/a>`))?.[0];
    assert.ok(link, 'Missing exact repository destination');
    assert.match(link, /target="_blank" rel="noopener noreferrer"/);
    assert.ok(link.includes('Ver repositorio'));
    assert.ok(row.includes(`href="${video}"`) && row.includes('Ver video demostración'));
    assert.equal((row.match(/<a /g) ?? []).length, 2);
  });
}

test('published assets contain the anonymized mockup but not the original customer screenshot', async () => {
  const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
  const originalHash = hash(await readFile(new URL('../src/assets/projects/baseinteractiva.jpg', import.meta.url)));
  const safeHash = hash(await readFile(new URL('../src/assets/projects/baseinteractiva-anonimizada.jpg', import.meta.url)));
  let safePublished = false;

  async function inspect(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const path = new URL(entry.name + (entry.isDirectory() ? '/' : ''), directory);
      if (entry.isDirectory()) {
        await inspect(path);
        continue;
      }
      const bytes = await readFile(path);
      assert.notEqual(hash(bytes), originalHash, 'Original customer screenshot is present in dist');
      assert.doesNotMatch(path.pathname, /baseinteractiva\./i);
      if (/\.(html|js|css|json|map)$/i.test(path.pathname)) assert.doesNotMatch(bytes.toString('utf8'), /baseinteractiva\./i);
      if (hash(bytes) === safeHash) safePublished = true;
    }
  }

  await inspect(new URL('../dist/', import.meta.url));
  assert.ok(safePublished, 'The anonymized mockup must be published');
});

test('replacement database image is published as an uncropped landscape screenshot', async () => {
  async function dimensions(name) {
    const bytes = await readFile(new URL(`../src/assets/projects/${name}`, import.meta.url));
    assert.equal(bytes.readUInt16BE(0), 0xffd8);
    for (let index = 2; index < bytes.length;) {
      assert.equal(bytes[index++], 0xff);
      let marker = bytes[index++];
      while (marker === 0xff) marker = bytes[index++];
      if (marker === 0xda || marker === 0xd9) break;
      const length = bytes.readUInt16BE(index);
      if ([0xc0, 0xc1, 0xc2].includes(marker)) {
        return [bytes.readUInt16BE(index + 5), bytes.readUInt16BE(index + 3)];
      }
      index += length;
    }
    assert.fail('Missing JPEG dimensions');
  }

  const safe = await dimensions('baseinteractiva-anonimizada.jpg');
  assert.ok(safe[0] > safe[1], 'The replacement screenshot must be landscape');
  const html = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
  const image = html.match(/<img\b[^>]*class="project-card__image"[^>]*>/)?.[0];
  assert.ok(image?.includes('baseinteractiva-anonimizada.'));
  assert.match(image, new RegExp(`width="${safe[0]}"`));
  assert.match(image, new RegExp(`height="${safe[1]}"`));
  assert.ok(!html.includes('project-card__image--portrait'));
});
