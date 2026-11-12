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
  introduction: 'Desarrollo interfaces web claras y funcionales, desde la idea inicial hasta su puesta en producción.',
  email: 'emiliano.dambrosio.dev@gmail.com',
  github: 'https://github.com/Emilianodamb',
  linkedin: 'https://www.linkedin.com/in/emiliano-dambrosio/',
  whatsapp: 'https://wa.me/5491124012037',
};

export interface Project {
  title: string;
  category: string;
  technologies: string[];
  context: string;
  challenge?: string;
  url: string;
  repository?: string;
  image: ImageMetadata;
}

export const projects: Project[] = [
  {
    title: 'Sitio web Aureq',
    image: aureq,
    category: 'Sitio institucional',
    technologies: [],
    context: 'Sitio web de Aureq, un espacio de presentación de servicios y soluciones digitales.',
    url: 'https://aureq.com.ar',
  },
  {
    title: 'Sitio web Total Mecánica',
    image: totalMecanica,
    category: 'Sitio institucional',
    technologies: ['Next.js', 'React', 'TypeScript', 'Google Analytics'],
    context: 'Presencia digital para un taller mecánico, orientada a la captación de clientes y campañas de Google Ads.',
    challenge: 'Migración a Next.js y exportación estática para mejorar el SEO y mantener compatibilidad con hosting tradicional.',
    url: 'https://www.totalmecanica.com.ar',
    repository: 'https://github.com/Emilianodamb/landingtm-v3',
  },
  {
    title: 'Sitio web Ayelén Argerich',
    image: ayeArgerich,
    category: 'Sitio profesional',
    technologies: [],
    context: 'Sitio web profesional de Ayelén Argerich.',
    url: 'https://ayeargerich.com',
  },
  {
    title: 'Base de datos interactiva Total Mecánica',
    image: baseInteractiva,
    category: 'Aplicación interna',
    technologies: ['React', 'Python', 'Firebase Firestore', 'Firebase Authentication'],
    context: 'Digitalización del historial vehicular del taller con búsquedas y acceso centralizado a la información.',
    challenge: 'Transformación de registros históricos XML a JSON e integración con una base de datos en la nube.',
    url: 'https://total-mecanica.vercel.app/',
  },
  {
    title: 'The Mobile Shop',
    image: mobileShop,
    category: 'Comercio electrónico',
    technologies: ['React', 'React Router', 'Firestore', 'Context API'],
    context: 'Tienda de dispositivos con catálogo por categorías, carrito de compras y flujo de checkout.',
    challenge: 'Gestión del estado compartido con Context API e integración de las órdenes con Firestore.',
    url: 'https://proyecto-coderhouse-react.vercel.app/',
    repository: 'https://github.com/Emilianodamb/proyecto-coderhouse-react',
  },
  {
    title: 'Ferretería Online',
    image: ferreteria,
    category: 'Comercio electrónico',
    technologies: ['JavaScript', 'LocalStorage', 'JSON', 'SweetAlert'],
    context: 'Tienda interactiva con carga de productos, filtros y simulación de compra sin recargar la página.',
    challenge: 'Sincronización de la interfaz y el carrito persistente utilizando JavaScript sin un framework de UI.',
    url: 'https://java-script-theta.vercel.app/',
    repository: 'https://github.com/Emilianodamb/ferreteria-online',
  },
  {
    title: 'Andes Xtreme',
    image: andesXtreme,
    category: 'Sitio de turismo aventura',
    technologies: ['HTML', 'CSS', 'SASS', 'BEM', 'Bootstrap'],
    context: 'Sitio institucional para un proyecto de turismo aventura, con información de actividades y destinos.',
    challenge: 'Maquetación responsive, HTML semántico y organización de estilos mediante SASS y BEM.',
    url: 'https://andesxtreme.netlify.app/',
    repository: 'https://github.com/Emilianodamb/andesXtreme',
  },
];

export const otherProjects = [
  { title: 'Trivia multijugador en C', image: trivia, category: 'Estructuras de datos', description: 'Juego de terminal con listas enlazadas, gestión de memoria y persistencia en archivos.', technologies: ['C', 'Punteros', 'TDAs'], url: 'https://github.com/Emilianodamb/TP-FINAL-PROGRAMACION' },
  { title: 'Detonación en Assembler', image: assembler, category: 'Hardware y bajo nivel', description: 'Proyecto para PIC16F84A con temporizadores, displays e interrupciones.', technologies: ['Assembler', 'PIC16F84A'], url: 'https://github.com/Emilianodamb/TP-FINAL-ARQUITECTURA-DE-COMPUTADORAS' },
  { title: 'Eventyfier', image: eventyfier, category: 'Automatización e IA', description: 'Gestión de eventos e integraciones con bots de mensajería. Contenido provisional de la referencia.', technologies: ['React', 'n8n', 'Supabase'] },
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
