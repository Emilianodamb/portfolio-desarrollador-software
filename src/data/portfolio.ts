import type { ImageMetadata } from 'astro';
import totalMecanica from '../assets/projects/totalmecanica.jpg';
import baseInteractiva from '../assets/projects/baseinteractiva-anonimizada.jpg';
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
  action: 'site' | 'application' | 'demo' | 'video';
  showUrl?: boolean;
  repositoryUrl?: string;
  technologies: string[];
  description: string;
  contribution?: string;
  metric?: string;
  status?: string;
  url: string;
  image: ImageMetadata;
}

export const projects: Project[] = [
  {
    title: 'Historial vehicular de Total Mecánica',
    image: baseInteractiva,
    category: 'En producción',
    group: 'featured',
    action: 'video',
    description: 'Desarrollé una aplicación para consultar y actualizar el historial de vehículos del taller. Migré más de 3.000 registros del sistema anterior y publiqué la aplicación para que el equipo pudiera acceder desde distintos dispositivos.',
    contribution: 'Transformé los registros históricos de XML a JSON para incorporarlos a Firestore. Implementé la búsqueda de historiales en React y el acceso mediante Firebase Authentication.',
    technologies: ['HTML', 'CSS', 'JavaScript', 'React', 'Tailwind CSS', 'Python', 'Firebase', 'Git', 'GitHub', 'Visual Studio Code'],
    url: 'https://lnkd.in/p/d6vi4X_H',
  },
  {
    title: 'Aureq',
    image: aureq,
    category: 'En producción',
    group: 'featured',
    action: 'site',
    description: 'Diseñé y publiqué el sitio de mi emprendimiento de desarrollo web para presentar sus servicios y facilitar el contacto con comercios y profesionales.',
    contribution: 'Organicé el contenido, desarrollé la interfaz adaptable con Astro e incorporé animaciones con GSAP.',
    technologies: ['HTML', 'CSS', 'JavaScript', 'Astro', 'GSAP', 'Git', 'GitHub', 'Google Cloud', 'Visual Studio Code'],
    showUrl: true,
    url: 'https://aureq.com.ar',
  },
  {
    title: 'Sitio web de Total Mecánica',
    image: totalMecanica,
    category: 'En producción',
    group: 'featured',
    action: 'site',
    technologies: ['HTML', 'CSS', 'JavaScript', 'TypeScript', 'React', 'Vite', 'Next.js', 'Google Analytics', 'Git', 'GitHub', 'GitHub Copilot', 'Tailwind CSS', 'Visual Studio Code'],
    showUrl: true,
    description: 'Desarrollé el sitio institucional de un taller mecánico de Banfield para presentar sus servicios y facilitar las consultas de potenciales clientes.',
    contribution: 'Migré el sitio a Next.js y configuré la exportación estática para mantener la compatibilidad con el alojamiento existente. También trabajé sobre el SEO técnico inicial e integré Google Analytics.',
    url: 'https://www.totalmecanica.com.ar',
  },
  {
    title: 'Sitio web de Ayelén Argerich',
    image: ayeArgerich,
    category: 'En producción',
    group: 'featured',
    action: 'site',
    technologies: ['HTML', 'CSS', 'JavaScript', 'Astro', 'PHP', 'Git', 'GitHub', 'Visual Studio Code'],
    showUrl: true,
    description: 'Desarrollé y publiqué el sitio de Ayelén Argerich para reunir la presentación de su trabajo y facilitar el contacto desde una página propia.',
    url: 'https://ayelenargerich.com',
  },
  {
    title: 'The Mobile Shop',
    image: mobileShop,
    category: 'E-commerce de práctica',
    group: 'training',
    action: 'demo',
    technologies: ['HTML', 'CSS', 'JavaScript', 'React', 'Firebase', 'Git', 'GitHub', 'Visual Studio Code'],
    description: 'Desarrollé una tienda de dispositivos con catálogo por categorías, carrito, flujo de pedido, checkout y base de datos NoSQL. Gestioné el estado compartido del carrito con Context API y guardé las órdenes en Firestore. Este proyecto formó parte del trabajo final del curso de React en Coderhouse.',
    url: 'https://proyecto-coderhouse-react.vercel.app/',
    repositoryUrl: 'https://github.com/Emilianodamb/proyecto-coderhouse-react',
  },
  {
    title: 'Ferretería Online',
    image: ferreteria,
    category: 'E-commerce de práctica',
    group: 'training',
    action: 'demo',
    technologies: ['HTML', 'CSS', 'JavaScript', 'Git', 'GitHub', 'Visual Studio Code'],
    description: 'Desarrollé una tienda interactiva con catálogo, filtros y un flujo de compra simulado. Usé JavaScript Vanilla para actualizar la interfaz y localStorage para recuperar el carrito al volver a abrir la página. Este proyecto fue el trabajo final del curso de Javascript de Coderhouse y fue la primera vez que desarrollé con un lenguaje de programación web.',
    url: 'https://java-script-theta.vercel.app/',
    repositoryUrl: 'https://github.com/Emilianodamb/ferreteria-online',
  },
  {
    title: 'Andes Xtreme',
    image: andesXtreme,
    category: 'Sitio web de práctica',
    group: 'training',
    action: 'site',
    technologies: ['HTML', 'CSS', 'Bootstrap', 'Sass', 'Git', 'GitHub', 'Visual Studio Code'],
    description: 'Maqueté un sitio responsive de turismo aventura para presentar actividades y destinos. Usé HTML semántico y organicé los estilos con Sass y la metodología BEM. Este proyecto fue el trabajo final del curso de desarrollo web de Coderhouse y fue mi primer desarrollo web y el punto de partida de mi carrera en tecnología.',
    url: 'https://andesxtreme.netlify.app/',
    repositoryUrl: 'https://github.com/Emilianodamb/andesXtreme',
  },
];

export type DisplayProject = Omit<Project, 'group' | 'action' | 'url'> & Partial<Pick<Project, 'action' | 'url'>>;

export const otherProjects: DisplayProject[] = [
  {
    title: 'Trivia multijugador en C', image: trivia, category: 'Proyecto universitario',
    description: 'Desarrollé un juego de trivia multijugador para terminal. Usé listas enlazadas, memoria dinámica y archivos para persistir datos entre ejecuciones.',
    technologies: ['C', 'Code::Blocks'],
    action: 'video', url: 'https://lnkd.in/p/dSdJyh5F',
    repositoryUrl: 'https://github.com/Emilianodamb/TP-FINAL-PROGRAMACION',
  },
  {
    title: 'Sistema de temporización en Assembler', image: assembler, category: 'Proyecto universitario',
    description: 'Implementé un sistema de temporización en Assembler para el PIC16F84A, con control de displays y manejo de interrupciones. Este proyecto formó parte del trabajo final de la materia Arquitectura de computadoras, simula la detonación de una bomba y usa un lenguaje de bajo nivel de abstracción.',
    technologies: ['Proteus', 'MPLAB', 'C'],
    action: 'video', url: 'https://lnkd.in/p/dXZXnC-8',
    repositoryUrl: 'https://github.com/Emilianodamb/TP-FINAL-ARQUITECTURA-DE-COMPUTADORAS',
  },
  {
    title: 'Eventyfier', image: eventyfier, category: 'Proyecto de formación',
    description: 'Desarrollé un gestor de eventos con calendario en React y un bot de Telegram que permite cargar eventos por texto o audio.',
    technologies: ['HTML', 'CSS', 'JavaScript', 'TypeScript', 'Supabase', 'n8n', 'Git', 'GitHub', 'Google Cloud', 'Visual Studio Code'], status: 'Demo fuera de línea.',
  },
];

export const experiences = [
  {
    company: 'Aureq', startYear: 2026, endYear: null, role: 'Desarrollador web freelance',
    description: 'Desarrollo de sitios web y soluciones digitales para comercios y profesionales.',
    items: [
      'Gestiono el contacto con clientes, la prospección y las ventas; relevo necesidades y preparo propuestas definiendo el alcance de cada proyecto.',
      'Diseño e implemento sitios y aplicaciones web para comercios y profesionales, desde la organización del contenido y las interfaces hasta su publicación.',
      'Redacto textos comerciales y contenidos web —copywriting— para comunicar servicios y facilitar las consultas.',
      'Gestiono hosting y dominios contratados a proveedores externos, junto con el mantenimiento técnico y la actualización de los sitios.',
      'Desarrollé y publiqué aureq.com.ar para presentar los servicios del emprendimiento y facilitar el contacto',
    ],
  },
  {
    company: 'Total Mecánica', startYear: 2024, endYear: 2026, role: 'Desarrollo y digitalización de procesos',
    description: 'Herramientas web para la presencia digital y la operación del taller.',
    items: [
      'Desarrollé una aplicación de historial vehicular con React, JavaScript y Tailwind CSS, con búsquedas e integración de Firestore y Firebase Authentication.',
      'Migré más de 3.000 registros desde el sistema anterior y publiqué la aplicación en Vercel; está en uso y permite consultar y actualizar información desde distintos dispositivos.',
      'Desarrollé y publiqué el sitio institucional del taller, trabajando sobre contenidos, diseño adaptable, dominio, alojamiento y SEO técnico inicial.',
      'Trabajé en el desarrollo del frontend de un MVP de ERP/CRM con React y TypeScript, con tableros para consultas y órdenes de trabajo y vistas orientadas a los roles del taller.',
    ],
  },
];

export const skillGroups = [
  { title: 'FRONTEND', items: ['HTML semántico y CSS', 'JavaScript y TypeScript', 'React y Next.js', 'Tailwind, Bootstrap, Sass, BEM', 'Diseño responsive'] },
  { title: 'Datos e integración', items: ['Firebase, Firestore', 'Supabase, MySQL, PostgreSQL', 'API REST', 'Python', 'Node.js', 'Google Cloud', 'Docker'] },
  { title: 'Herramientas', items: ['Git y GitHub', 'Vite y Vercel', 'Dominios y DNS', 'Performance y SEO', 'Analytics', 'Visual Studio Code', 'Code::Blocks'] },
  { title: 'Automatización & IA', items: ['n8n', 'Claude AI y OpenAI', 'GitHub Copilot', 'Gentle AI, Gentle Shell y Engram', 'Agentes de IA y LLMs', 'Webhooks', 'Integraciones con Telegram'] },
];

export const certifications = [
  { title: 'Coderhouse', description: 'Desarrollo Web, JavaScript y React JS.' },
  { title: 'EducaciónIT', description: 'UX, transformación digital y marketing digital.' },
  { title: 'Platzi', description: 'Control de versiones con Git y GitHub.' },
];
