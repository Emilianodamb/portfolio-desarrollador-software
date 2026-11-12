import { certifications, experiences, otherProjects, profile, projects, skillGroups, type Project } from './portfolio';

export type Language = 'es' | 'en';

const englishProjects: Record<string, Pick<Project, 'title' | 'category' | 'context' | 'challenge'>> = {
  'https://aureq.com.ar': {
    title: 'Aureq website', category: 'Business website',
    context: 'The Aureq website, showcasing digital services and solutions.',
  },
  'https://www.totalmecanica.com.ar': {
    title: 'Total Mecánica website', category: 'Business website',
    context: 'An online presence for an auto repair shop, focused on customer acquisition and Google Ads campaigns.',
    challenge: 'Migration to Next.js and static export to improve SEO while retaining compatibility with traditional hosting.',
  },
  'https://ayeargerich.com': {
    title: 'Ayelén Argerich website', category: 'Professional website',
    context: 'The professional website of Ayelén Argerich.',
  },
  'https://total-mecanica.vercel.app/': {
    title: 'Total Mecánica interactive database', category: 'Internal application',
    context: 'Digitizing the shop’s vehicle history with search and centralized access to information.',
    challenge: 'Converting historical XML records to JSON and integrating them with a cloud database.',
  },
  'https://proyecto-coderhouse-react.vercel.app/': {
    title: 'The Mobile Shop', category: 'E-commerce',
    context: 'A device store with a category-based catalog, shopping cart and checkout flow.',
    challenge: 'Managing shared state with Context API and integrating orders with Firestore.',
  },
  'https://java-script-theta.vercel.app/': {
    title: 'Online Hardware Store', category: 'E-commerce',
    context: 'An interactive store with product loading, filters and a simulated purchase flow without page reloads.',
    challenge: 'Synchronizing the interface and persistent cart using JavaScript without a UI framework.',
  },
  'https://andesxtreme.netlify.app/': {
    title: 'Andes Xtreme', category: 'Adventure tourism website',
    context: 'A business website for an adventure tourism project, presenting activities and destinations.',
    challenge: 'Responsive layouts, semantic HTML and styles organized with SASS and BEM.',
  },
};

export const localizedData = {
  es: { profile, projects, otherProjects, experiences, skillGroups, certifications },
  en: {
    profile: {
      ...profile,
      role: 'Frontend Developer',
      introduction: 'I build clear, functional web interfaces, from the initial idea to production.',
    },
    projects: projects.map((project) => ({ ...project, ...englishProjects[project.url] })),
    otherProjects: [
      { ...otherProjects[0], title: 'Multiplayer Trivia in C', category: 'Data structures', description: 'A terminal game with linked lists, memory management and file persistence.' },
      { ...otherProjects[1], title: 'Detonation in Assembly', category: 'Hardware and low-level programming', description: 'A PIC16F84A project with timers, displays and interrupts.' },
      { ...otherProjects[2], category: 'Automation and AI', description: 'Event management and messaging bot integrations. Provisional content from the reference design.' },
    ],
    experiences: [
      { company: 'Aureq', role: 'Freelance Web Developer', description: 'Websites and digital solutions for businesses and professionals.', items: ['Gathering requirements and developing interfaces.', 'Managing domains, deployment and website maintenance.'] },
      { company: 'Total Mecánica', role: 'Development and process digitization', description: 'Web tools for the shop’s online presence and day-to-day operations.', items: ['Development of the business website and vehicle history application.', 'Integration of historical data and search tools.'] },
    ],
    skillGroups: [
      { title: 'Frontend', items: ['React and Next.js', 'TypeScript and JavaScript', 'Semantic HTML and CSS', 'Component architecture'] },
      { title: 'Data and integration', items: ['Firebase and Firestore', 'Supabase and SQL', 'REST APIs', 'Python'] },
      { title: 'Tools', items: ['Git and GitHub', 'Vite and Vercel', 'Domains and DNS', 'Performance and SEO'] },
      { title: 'Automation and AI', items: ['n8n', 'Agents and LLMs', 'Webhooks', 'Telegram integrations'] },
    ],
    certifications: [
      { title: 'Coderhouse', description: 'Web Development, JavaScript and React JS.' },
      { title: 'EducaciónIT', description: 'UX, digital transformation and digital marketing.' },
      { title: 'Platzi', description: 'Version control with Git and GitHub.' },
    ],
  },
};

export const copy = {
  es: {
    navigation: 'Navegación principal', projects: 'Proyectos', experience: 'Experiencia', talk: 'Hablemos',
    darkMode: 'Modo oscuro', englishLanguage: 'Usar inglés',
    eyebrow: 'Portfolio / Desarrollo de software', downloadCv: 'Descargar CV', viewProjects: 'Ver proyectos',
    featuredTitle: 'Proyectos destacados', featuredDescription: 'Una selección de sitios, aplicaciones y soluciones para problemas reales.',
    otherTitle: 'Otros proyectos técnicos', experienceTitle: 'Experiencia profesional',
    experienceDescription: 'Desarrollo web, digitalización de procesos y soluciones a medida.',
    skillsTitle: 'Habilidades y metodología', skillsDescription: 'Tecnologías y herramientas para construir, integrar y mantener productos web.',
    educationTitle: 'Formación y perfil', educationDescription: 'Fundamentos de computación y aprendizaje continuo.',
    degree: 'Licenciatura en Sistemas', university: 'Universidad Nacional de Lanús',
    degreeDescription: 'En curso. Formación en algoritmos, estructuras de datos, bases de datos e ingeniería de software.',
    courses: 'Cursos y certificaciones', additionalInfo: 'Información complementaria', languages: 'Idiomas',
    nativeSpanish: 'Español: nativo', intermediateEnglish: 'Inglés: intermedio (nivel por confirmar)',
    workMode: 'Modalidad de trabajo', workDescription: 'Proyectos freelance y oportunidades en equipos de desarrollo. Ubicación y disponibilidad a confirmar.',
    contactTitle: 'Hablemos de tu próximo desarrollo', contactDescription: 'Para una propuesta, una oportunidad laboral o una consulta, podés contactarme por estos canales.',
    emailLabel: 'Correo electrónico', projectQuestion: '¿Tenés un proyecto en mente?',
    contactInvitation: 'Escribime para contarme qué necesitás y conversar sobre los próximos pasos.',
    writeEmail: 'Escribir un email', emailNote: 'Abre tu aplicación de correo. El formulario se incorporará cuando definamos el servicio de envío.',
    viewProject: 'Ver proyecto', repository: 'Repositorio', viewRepository: 'Ver repositorio', technologies: 'Tecnologías',
    context: 'Contexto', challenge: 'Desafío técnico', projectImage: 'Vista del proyecto',
    skip: 'Saltar al contenido', backToTop: 'Volver al inicio', titleSuffix: 'Desarrollo de software',
    metaDescription: "Portfolio de Emiliano D'Ambrosio. Desarrollo frontend, proyectos web y soluciones digitales.",
    downloadSpanishCv: 'Descargar CV en español', downloadEnglishCv: 'Descargar CV en inglés',
  },
  en: {
    navigation: 'Main navigation', projects: 'Projects', experience: 'Experience', talk: 'Let’s talk',
    darkMode: 'Dark mode', englishLanguage: 'Use English',
    eyebrow: 'Portfolio / Software development', downloadCv: 'Download CV', viewProjects: 'View projects',
    featuredTitle: 'Featured projects', featuredDescription: 'A selection of websites, applications and solutions to real-world problems.',
    otherTitle: 'Other technical projects', experienceTitle: 'Professional experience',
    experienceDescription: 'Web development, process digitization and tailored solutions.',
    skillsTitle: 'Skills and methodology', skillsDescription: 'Technologies and tools to build, integrate and maintain web products.',
    educationTitle: 'Education and profile', educationDescription: 'Computing fundamentals and continuous learning.',
    degree: 'Bachelor’s Degree in Information Systems', university: 'Universidad Nacional de Lanús',
    degreeDescription: 'In progress. Studies in algorithms, data structures, databases and software engineering.',
    courses: 'Courses and certifications', additionalInfo: 'Additional information', languages: 'Languages',
    nativeSpanish: 'Spanish: native', intermediateEnglish: 'English: intermediate (level to be confirmed)',
    workMode: 'Work arrangements', workDescription: 'Freelance projects and opportunities in development teams. Location and availability to be confirmed.',
    contactTitle: 'Let’s talk about your next project', contactDescription: 'For a proposal, a job opportunity or a question, you can reach me through these channels.',
    emailLabel: 'Email address', projectQuestion: 'Have a project in mind?',
    contactInvitation: 'Write to tell me what you need and discuss the next steps.',
    writeEmail: 'Write an email', emailNote: 'Opens your email app. A contact form will be added once we choose a delivery service.',
    viewProject: 'View project', repository: 'Repository', viewRepository: 'View repository', technologies: 'Technologies',
    context: 'Context', challenge: 'Technical challenge', projectImage: 'Preview of',
    skip: 'Skip to content', backToTop: 'Back to top', titleSuffix: 'Software development',
    metaDescription: "Emiliano D'Ambrosio’s portfolio. Frontend development, web projects and digital solutions.",
    downloadSpanishCv: 'Download CV in Spanish', downloadEnglishCv: 'Download CV in English',
  },
};
