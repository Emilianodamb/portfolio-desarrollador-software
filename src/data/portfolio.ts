import type { ImageMetadata } from 'astro';
import totalMecanica from '../assets/projects/totalmecanica.jpg';
import baseInteractiva from '../assets/projects/baseinteractiva.jpg';
import mobileShop from '../assets/projects/mobileshop.jpg';
import ferreteria from '../assets/projects/ferreteriaonline.jpg';
import andesXtreme from '../assets/projects/andesxtreme.jpg';
import trivia from '../assets/projects/triviagame.jpg';
import assembler from '../assets/projects/assembler.jpg';
import eventyfier from '../assets/projects/eventyfier.jpg';
import aureq from '../assets/projects/aureq.jpg';
import ayeArgerich from '../assets/projects/ayeargerich.jpg';

export const profile = {
  name: "Emiliano D'Ambrosio",
  role: 'Desarrollador Frontend',
  introduction: 'Programador en constante crecimiento y aprendizaje permanente. Aplico mis concimientos en cada nuevo proyecto y me esfuerzo por crear productos de calidad. Estudio Licenciatura en Sistemas en la Universidad Nacional de Lanús.',
  email: 'emiliano.dambrosio.dev@gmail.com',
  github: 'https://github.com/Emilianodamb',
  linkedin: 'https://www.linkedin.com/in/emiliano-dambrosio/',
  whatsapp: 'https://wa.me/5491124012037',
};

export interface Project {
  title: string;
  category: string;
  group: 'featured' | 'training';
  action: 'site' | 'application' | 'demo';
  technologies: string[];
  description: string;
  contribution?: string;
  metric?: string;
  status?: string;
  url: string;
  image: ImageMetadata;
  imageOrientation?: 'portrait';
}

export const projects: Project[] = [
  {
    title: 'Historial vehicular de Total Mecánica',
    image: baseInteractiva,
    imageOrientation: 'portrait',
    category: 'Aplicación interna en uso',
    group: 'featured',
    action: 'application',
    description: 'Desarrollé una aplicación para consultar y actualizar el historial de vehículos del taller. Migré más de 3.000 registros del sistema anterior y publiqué la aplicación para que el equipo pudiera acceder desde distintos dispositivos.',
    contribution: 'Transformé los registros históricos de XML a JSON para incorporarlos a Firestore. Implementé la búsqueda de historiales en React y el acceso mediante Firebase Authentication.',
    technologies: ['React', 'Tailwind CSS', 'Python', 'Firebase'],
    status: 'Acceso restringido',
    url: 'https://total-mecanica.vercel.app/',
  },
  {
    title: 'Aureq',
    image: aureq,
    category: 'Sitio comercial',
    group: 'featured',
    action: 'site',
    description: 'Diseñé y publiqué el sitio de mi emprendimiento de desarrollo web para presentar sus servicios y facilitar el contacto con comercios y profesionales.',
    contribution: 'Organicé el contenido, desarrollé la interfaz adaptable con Astro e incorporé animaciones con GSAP.',
    technologies: ['Astro', 'GSAP'],
    url: 'https://aureq.com.ar',
  },
  {
    title: 'Sitio web de Total Mecánica',
    image: totalMecanica,
    category: 'Sitio institucional',
    group: 'featured',
    action: 'site',
    technologies: ['Next.js', 'React', 'TypeScript', 'Google Analytics'],
    description: 'Desarrollé el sitio institucional de un taller mecánico de Banfield para presentar sus servicios y facilitar las consultas de potenciales clientes.',
    contribution: 'Migré el sitio a Next.js y configuré la exportación estática para mantener la compatibilidad con el alojamiento existente. También trabajé sobre el SEO técnico inicial e integré Google Analytics.',
    url: 'https://www.totalmecanica.com.ar',
  },
  {
    title: 'Sitio web de Ayelén Argerich',
    image: ayeArgerich,
    category: 'Sitio profesional',
    group: 'featured',
    action: 'site',
    technologies: [],
    description: 'Desarrollé y publiqué el sitio de Ayelén Argerich para reunir la presentación de su trabajo y facilitar el contacto desde una página propia.',
    url: 'https://ayeargerich.com',
  },
  {
    title: 'The Mobile Shop',
    image: mobileShop,
    category: 'E-commerce de práctica',
    group: 'training',
    action: 'demo',
    technologies: ['React', 'React Router', 'Context API', 'Firestore'],
    description: 'Desarrollé una tienda de dispositivos con catálogo por categorías, carrito, flujo de pedido, checkout y base de datos NoSQL. Gestioné el estado compartido del carrito con Context API y guardé las órdenes en Firestore. Este proyecto formó parte del trabajo final del curso de React en Coderhouse.',
    url: 'https://proyecto-coderhouse-react.vercel.app/',
  },
  {
    title: 'Ferretería Online',
    image: ferreteria,
    category: 'E-commerce de práctica',
    group: 'training',
    action: 'demo',
    technologies: ['JavaScript', 'localStorage', 'JSON'],
    description: 'Desarrollé una tienda interactiva con catálogo, filtros y un flujo de compra simulado. Usé JavaScript para actualizar la interfaz y localStorage para recuperar el carrito al volver a abrir la página.',
    url: 'https://java-script-theta.vercel.app/',
  },
  {
    title: 'Andes Xtreme',
    image: andesXtreme,
    category: 'Sitio web de práctica',
    group: 'training',
    action: 'site',
    technologies: ['HTML', 'Sass', 'Bootstrap', 'BEM'],
    description: 'Maqueté un sitio responsive de turismo aventura para presentar actividades y destinos. Usé HTML semántico y organicé los estilos con Sass y la metodología BEM.',
    url: 'https://andesxtreme.netlify.app/',
  },
];

interface CompactProject {
  title: string;
  category: string;
  description: string;
  technologies: string[];
  image: ImageMetadata;
  url?: string;
  status?: string;
}

export const otherProjects: CompactProject[] = [
  {
    title: 'Trivia multijugador en C', image: trivia, category: 'Proyecto universitario',
    description: 'Desarrollé un juego de trivia multijugador para terminal. Usé listas enlazadas, memoria dinámica y archivos para persistir datos entre ejecuciones.',
    technologies: ['C', 'Listas enlazadas', 'Archivos'],
  },
  {
    title: 'Sistema de temporización en Assembler', image: assembler, category: 'Proyecto universitario',
    description: 'Implementé un sistema de temporización en Assembler para el PIC16F84A, con control de displays y manejo de interrupciones.',
    technologies: ['Assembler', 'PIC16F84A'],
  },
  {
    title: 'Eventyfier', image: eventyfier, category: 'Proyecto de formación',
    description: 'Desarrollé un gestor de eventos con calendario en React y un bot de Telegram que permite cargar eventos por texto o audio.',
    technologies: ['React', 'n8n', 'Supabase'], status: 'Demo fuera de línea.',
  },
];

export const experiences = [
  { company: 'Aureq', role: 'Desarrollador web freelance', description: 'Desarrollo de sitios web y soluciones digitales para comercios y profesionales.', items: ['Relevamiento de necesidades y desarrollo de interfaces.', 'Gestión de dominios, despliegue y mantenimiento de sitios.'] },
  { company: 'Total Mecánica', role: 'Desarrollo y digitalización de procesos', description: 'Herramientas web para la presencia digital y la operación del taller.', items: ['Desarrollo del sitio institucional y la aplicación de historial vehicular.', 'Integración de datos históricos y herramientas de consulta.'] },
];

export const skillGroups = [
  { title: 'Frontend', items: ['React y Next.js', 'TypeScript y JavaScript', 'HTML semántico y CSS', 'Arquitectura de componentes'] },
  { title: 'Datos e integración', items: ['Firebase y Firestore', 'Supabase y SQL', 'APIs REST', 'Python'] },
  { title: 'Herramientas', items: ['Git y GitHub', 'Vite y Vercel', 'Dominios y DNS', 'Performance y SEO'] },
  { title: 'Automatización e IA', items: ['n8n', 'Agentes y LLMs', 'Webhooks', 'Integraciones con Telegram'] },
];

export const certifications = [
  { title: 'Coderhouse', description: 'Desarrollo Web, JavaScript y React JS.' },
  { title: 'EducaciónIT', description: 'UX, transformación digital y marketing digital.' },
  { title: 'Platzi', description: 'Control de versiones con Git y GitHub.' },
];
