import analytics from '../../tech-logos/ANALYTICS.svg?url&no-inline';
import astro from '../../tech-logos/ASTRO.svg?url&no-inline';
import bootstrap from '../../tech-logos/BOOTSTRAP.svg?url&no-inline';
import c from '../../tech-logos/C.svg?url&no-inline';
import css from '../../tech-logos/CSS.svg?url&no-inline';
import docker from '../../tech-logos/DOCKER.svg?url&no-inline';
import firebase from '../../tech-logos/FIREBASE.svg?url&no-inline';
import git from '../../tech-logos/GIT.svg?url&no-inline';
import github from '../../tech-logos/GITHUB.svg?url&no-inline';
import copilot from '../../tech-logos/GITHUBCOPILOT.svg?url&no-inline';
import cloud from '../../tech-logos/GOOGLECLOUD.svg?url&no-inline';
import gsap from '../../tech-logos/GSAP.svg?url&no-inline';
import html from '../../tech-logos/HTML.svg?url&no-inline';
import javascript from '../../tech-logos/JS.svg?url&no-inline';
import n8n from '../../tech-logos/N8N.svg?url&no-inline';
import nest from '../../tech-logos/NEST.svg?url&no-inline';
import next from '../../tech-logos/NEXT JS.svg?url&no-inline';
import postgresql from '../../tech-logos/POSTGRESQL.svg?url&no-inline';
import prisma from '../../tech-logos/PRISMA.svg?url&no-inline';
import python from '../../tech-logos/PYTHON.svg?url&no-inline';
import react from '../../tech-logos/REACT.svg?url&no-inline';
import sass from '../../tech-logos/SASS.svg?url&no-inline';
import supabase from '../../tech-logos/SUPABASE.svg?url&no-inline';
import tailwind from '../../tech-logos/TAILWIND.svg?url&no-inline';
import typescript from '../../tech-logos/TS.svg?url&no-inline';
import vercel from '../../tech-logos/VERCEL.svg?url&no-inline';
import vite from '../../tech-logos/VITE.svg?url&no-inline';
import codeblocks from '../../tech-logos/CODEBLOCKS.svg?url&no-inline';
import mplab from '../../tech-logos/MPLAB.svg?url&no-inline';
import php from '../../tech-logos/PHP.svg?url&no-inline';
import proteus from '../../tech-logos/PROTEUS.svg?url&no-inline';
import vsc from '../../tech-logos/VSC.svg?url&no-inline';

const assets: Record<string, string> = {
  ANALYTICS: analytics, ASTRO: astro, BOOTSTRAP: bootstrap, C: c, CSS: css,
  DOCKER: docker, FIREBASE: firebase, GIT: git, GITHUB: github, GITHUBCOPILOT: copilot,
  GOOGLECLOUD: cloud, GSAP: gsap, HTML: html, JS: javascript, N8N: n8n, NEST: nest,
  'NEXT JS': next, POSTGRESQL: postgresql, PRISMA: prisma, PYTHON: python, REACT: react,
  SASS: sass, SUPABASE: supabase, TAILWIND: tailwind, TS: typescript, VERCEL: vercel, VITE: vite,
  CODEBLOCKS: codeblocks, MPLAB: mplab, PHP: php, PROTEUS: proteus, VSC: vsc,
};

type LogoTone = 'light' | 'dark' | 'mixed';
const definitions: Record<string, { name: string; tone?: LogoTone }> = {
  ANALYTICS: { name: 'Google Analytics' },
  ASTRO: { name: 'Astro', tone: 'mixed' },
  BOOTSTRAP: { name: 'Bootstrap' },
  C: { name: 'C' },
  CSS: { name: 'CSS' },
  DOCKER: { name: 'Docker' },
  FIREBASE: { name: 'Firebase' },
  GIT: { name: 'Git' },
  GITHUB: { name: 'GitHub', tone: 'light' },
  GITHUBCOPILOT: { name: 'GitHub Copilot', tone: 'light' },
  GOOGLECLOUD: { name: 'Google Cloud' },
  GSAP: { name: 'GSAP' },
  HTML: { name: 'HTML' },
  JS: { name: 'JavaScript' },
  N8N: { name: 'n8n', tone: 'mixed' },
  NEST: { name: 'NestJS' },
  'NEXT JS': { name: 'Next.js', tone: 'dark' },
  POSTGRESQL: { name: 'PostgreSQL' },
  PRISMA: { name: 'Prisma', tone: 'light' },
  PYTHON: { name: 'Python' },
  REACT: { name: 'React' },
  SASS: { name: 'Sass' },
  SUPABASE: { name: 'Supabase' },
  TAILWIND: { name: 'Tailwind CSS' },
  TS: { name: 'TypeScript' },
  VERCEL: { name: 'Vercel', tone: 'dark' },
  VITE: { name: 'Vite' },
  CODEBLOCKS: { name: 'Code::Blocks' },
  MPLAB: { name: 'MPLAB' },
  PHP: { name: 'PHP' },
  PROTEUS: { name: 'Proteus' },
  VSC: { name: 'Visual Studio Code' },
};

export const technologyLogos = Object.entries(assets).map(([file, src]) => {
  return { src, ...definitions[file], name: definitions[file]?.name ?? file };
});

export type TechnologyLogoAsset = (typeof technologyLogos)[number];

const aliases: Record<string, string> = {
  'Context API': 'React',
  Firestore: 'Firebase',
  'Firebase Authentication': 'Firebase',
};

export function findTechnologyLogo(technology: string) {
  return technologyLogos.find((logo) => logo.name === (aliases[technology] ?? technology));
}
