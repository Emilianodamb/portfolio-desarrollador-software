import { certifications, experiences, otherProjects, profile, projects, skillGroups, type Project } from './portfolio';

export type Language = 'es' | 'en';

const englishProjects: Record<string, Pick<Project, 'title' | 'category' | 'description' | 'contribution' | 'metric' | 'status'>> = {
  'https://aureq.com.ar': {
    title: 'Aureq', category: 'In production',
    description: 'I designed and launched the website for my web development business to present its services and make it easier for businesses and professionals to get in touch.',
    contribution: 'I organized the content, built the responsive interface with Astro and added animations with GSAP.',
  },
  'https://www.totalmecanica.com.ar': {
    title: 'Total Mecánica website', category: 'In production',
    description: 'I developed the website for an auto repair shop in Banfield to present its services and make it easier for potential customers to send inquiries.',
    contribution: 'I migrated the site to Next.js and configured static export to retain compatibility with the existing hosting. I also handled the initial technical SEO and integrated Google Analytics.',
  },
  'https://ayelenargerich.com': {
    title: 'Ayelén Argerich website', category: 'In production',
    description: 'I developed and launched Ayelén Argerich’s website to bring together an introduction to her work and make it easier to get in touch through her own page.',
  },
  'https://lnkd.in/p/d6vi4X_H': {
    title: 'Total Mecánica vehicle history', category: 'In production',
    description: 'I developed an application to view and update the shop’s vehicle histories. I migrated over 3,000 records from the previous system and deployed the application so the team could access it from different devices.',
    contribution: 'I converted the historical records from XML to JSON to import them into Firestore. I implemented vehicle history search in React and access through Firebase Authentication.',
    },
  'https://proyecto-coderhouse-react.vercel.app/': {
    title: 'The Mobile Shop', category: 'Practice e-commerce project',
    description: 'I developed a device store with a category-based catalog, a shopping cart, an ordering flow, checkout and a NoSQL database. I managed the cart’s shared state with Context API and saved orders in Firestore. This project was the final assignment for Coderhouse’s React course.',
  },
  'https://java-script-theta.vercel.app/': {
    title: 'Online Hardware Store', category: 'Practice e-commerce project',
    description: 'I developed an interactive store with a catalog, filters and a simulated purchase flow. I used vanilla JavaScript to update the interface and localStorage to restore the cart when reopening the page. This was the final project for Coderhouse’s JavaScript course and my first experience developing with a web programming language.',
  },
  'https://andesxtreme.netlify.app/': {
    title: 'Andes Xtreme', category: 'Practice website',
    description: 'I built a responsive adventure tourism website to present activities and destinations. I used semantic HTML and organized the styles with Sass and the BEM methodology. This was the final project for Coderhouse’s Web Development course, my first website and the starting point of my career in technology.',
  },
};

export const localizedData = {
  es: { profile, projects, otherProjects, experiences, skillGroups, certifications },
  en: {
    profile: {
      ...profile,
      role: 'Frontend Developer',
      introduction: 'I am a programmer committed to continuous growth and lifelong learning. I apply my knowledge to every new project and strive to create quality products. I am pursuing a degree in Information Systems at Universidad Nacional de Lanús.',
    },
    projects: projects.map((project) => ({ ...project, ...englishProjects[project.url] })),
    otherProjects: [
      { ...otherProjects[0], title: 'Multiplayer Trivia in C', category: 'University project', description: 'I developed a multiplayer trivia game for the terminal. I used linked lists, dynamic memory and files to persist data between runs.' },
      { ...otherProjects[1], title: 'Timing System in Assembly', category: 'University project', description: 'I implemented a timing system in Assembly for the PIC16F84A, with display control and interrupt handling. This was the final project for the Computer Architecture course; it simulates a bomb detonation using a low-level language.' },
      { ...otherProjects[2], category: 'Learning project', description: 'I developed an event manager with a React calendar and a Telegram bot that lets users add events by text or audio.', status: 'Demo offline.' },
    ],
    experiences: [
      {
        ...experiences[0], role: 'Freelance Web Developer', description: 'Websites and digital solutions for businesses and professionals.',
        items: [
          'I manage contact with clients, prospecting and sales; I gather requirements and prepare proposals defining the scope of each project.',
          'I design and implement websites and web applications for businesses and professionals, from organizing content and interfaces through launch.',
          'I write commercial and website copy —copywriting— to communicate services and encourage inquiries.',
          'I manage hosting and domains purchased from external providers, along with technical maintenance and website updates.',
          'I developed and launched aureq.com.ar to present the business’s services and make contact easier.',
        ],
      },
      {
        ...experiences[1], role: 'Development and process digitization', description: 'Web tools for the shop’s online presence and day-to-day operations.',
        items: [
          'I developed a vehicle history application with React, JavaScript and Tailwind CSS, including search and integration with Firestore and Firebase Authentication.',
          'I migrated over 3,000 records from the previous system and deployed the application to Vercel; it is in use and lets users view and update information from different devices.',
          'I developed and launched the shop’s website, working on content, responsive design, the domain, hosting and initial technical SEO.',
          'I worked on the frontend of an ERP/CRM MVP with React and TypeScript, including dashboards for inquiries and work orders and views tailored to the shop’s roles.',
        ],
      },
    ],
    skillGroups: [
      { title: 'FRONTEND', items: ['Semantic HTML and CSS', 'JavaScript and TypeScript', 'React and Next.js', 'Tailwind, Bootstrap, Sass, BEM', 'Responsive design'] },
      { title: 'Data and integration', items: ['Firebase, Firestore', 'Supabase, MySQL, PostgreSQL', 'REST APIs', 'Python', 'Node.js', 'Google Cloud', 'Docker'] },
      { title: 'Tools', items: ['Git and GitHub', 'Vite and Vercel', 'Domains and DNS', 'Performance and SEO', 'Analytics', 'Visual Studio Code', 'Code::Blocks'] },
      { title: 'Automation & AI', items: ['n8n', 'Claude AI and OpenAI', 'GitHub Copilot', 'Gentle AI, Gentle Shell and Engram', 'AI agents and LLMs', 'Webhooks', 'Telegram integrations'] },
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
    contactWhatsApp: 'Contactar por WhatsApp', present: 'Actualmente',
    rotationPaused: 'Rotación en pausa', rotationRunning: 'Rotación automática',
    rotateSphere: 'Girar la esfera de tecnologías', rotateSphereHint: 'Arrastra un logo delantero para girar o usa las flechas del teclado. Usa Espacio para pausar o reanudar.',
    downloadCv: 'Descargar CV', chooseCvLanguage: 'Elegir idioma del cv', viewProjects: 'Ver proyectos',
    featuredTitle: 'Proyectos destacados', featuredDescription: 'Una selección de sitios, aplicaciones y soluciones para problemas reales.',
    featuredGroupTitle: 'DESTACADOS', trainingTitle: 'DE FORMACIÓN', otherTitle: 'OTROS', experienceTitle: 'Experiencia profesional',
    experienceDescription: 'Desarrollo web, digitalización de procesos y soluciones a medida.',
    skillsTitle: 'Habilidades', skillsDescription: 'Tecnologías y herramientas para construir, integrar y mantener productos web.',
    educationTitle: 'Formación', educationDescription: 'Fundamentos de computación y aprendizaje continuo.',
    degree: 'Licenciatura en Sistemas', university: 'Universidad Nacional de Lanús',
    degreeDescription: 'En curso. Formación en algoritmos, estructuras de datos, bases de datos e ingeniería de software.',
    courses: 'Cursos y certificaciones', additionalInfo: 'Información complementaria', languages: 'Idiomas',
    nativeSpanish: 'Español: nativo', intermediateEnglish: 'Inglés: intermedio',
    contactTitle: 'Hablemos de tu próximo desarrollo', contactDescription: 'Para una propuesta, una oportunidad laboral o una consulta, podés contactarme por estos canales.',
    emailLabel: 'Correo electrónico', projectQuestion: '¿Tenés un proyecto en mente?',
    contactInvitation: 'Escribime para contarme qué necesitás y conversar sobre los próximos pasos.',
    writeEmail: 'Escribir un email',
    viewSite: 'Ver sitio', viewApplication: 'Ver aplicación', viewDemo: 'Ver demo', viewDemoVideo: 'Ver video demostración', viewRepository: 'Ver repositorio', technologies: 'Tecnologías',
    contribution: 'Aporte técnico', projectImage: 'Vista del proyecto',
    skip: 'Saltar al contenido', backToTop: 'Volver al inicio', titleSuffix: 'Desarrollo de software',
    metaDescription: "Portfolio de Emiliano D'Ambrosio. Desarrollo frontend, proyectos web y soluciones digitales.",
    downloadSpanishCv: 'Descargar CV en español', downloadEnglishCv: 'Descargar CV en inglés',
  },
  en: {
    navigation: 'Main navigation', projects: 'Projects', experience: 'Experience', talk: 'Let’s talk',
    darkMode: 'Dark mode', englishLanguage: 'Use English',
    contactWhatsApp: 'Contact via WhatsApp', present: 'Present',
    rotationPaused: 'Rotation paused', rotationRunning: 'Automatic rotation',
    rotateSphere: 'Rotate the technology sphere', rotateSphereHint: 'Drag a foreground logo to rotate or use the arrow keys. Press Space to pause or resume.',
    downloadCv: 'Download CV', chooseCvLanguage: 'Choose CV language', viewProjects: 'View projects',
    featuredTitle: 'Featured projects', featuredDescription: 'A selection of websites, applications and solutions to real-world problems.',
    featuredGroupTitle: 'FEATURED', trainingTitle: 'LEARNING', otherTitle: 'OTHER', experienceTitle: 'Professional experience',
    experienceDescription: 'Web development, process digitization and tailored solutions.',
    skillsTitle: 'Skills', skillsDescription: 'Technologies and tools to build, integrate and maintain web products.',
    educationTitle: 'Education', educationDescription: 'Computing fundamentals and continuous learning.',
    degree: 'Bachelor’s Degree in Information Systems', university: 'Universidad Nacional de Lanús',
    degreeDescription: 'In progress. Studies in algorithms, data structures, databases and software engineering.',
    courses: 'Courses and certifications', additionalInfo: 'Additional information', languages: 'Languages',
    nativeSpanish: 'Spanish: native', intermediateEnglish: 'English: intermediate',
    contactTitle: 'Let’s talk about your next project', contactDescription: 'For a proposal, a job opportunity or a question, you can reach me through these channels.',
    emailLabel: 'Email address', projectQuestion: 'Have a project in mind?',
    contactInvitation: 'Write to tell me what you need and discuss the next steps.',
    writeEmail: 'Write an email',
    viewSite: 'View site', viewApplication: 'View application', viewDemo: 'View demo', viewDemoVideo: 'View demo video', viewRepository: 'View repository', technologies: 'Technologies',
    contribution: 'Technical contribution', projectImage: 'Preview of',
    skip: 'Skip to content', backToTop: 'Back to top', titleSuffix: 'Software development',
    metaDescription: "Emiliano D'Ambrosio’s portfolio. Frontend development, web projects and digital solutions.",
    downloadSpanishCv: 'Download CV in Spanish', downloadEnglishCv: 'Download CV in English',
  },
};
