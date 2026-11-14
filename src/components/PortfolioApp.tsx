import { useEffect, useRef } from 'react';
import portrait from '../assets/profile-hd.webp';
import unlaLogo from '../../UNLA.svg?url&no-inline';
import coderhouseLogo from '../../CODERHOUSE.svg?url&no-inline';
import educacionItLogo from '../../EDUCACIONIT.svg?url&no-inline';
import platziLogo from '../../PLATZI.svg?url&no-inline';
import { PreferencesProvider, usePreferences } from '../context/PreferencesContext';
import CvDownload from './CvDownload';
import ContentSection from './ContentSection';
import PreferencesToggles from './PreferencesToggles';
import ProjectCard from './ProjectCard';
import Section from './Section';
import WhatsAppTab from './WhatsAppTab';
import TechnologySphere from './TechnologySphere';
import DifferenceCursor from './DifferenceCursor';
import { ImageAssetsContext, useOptimizedImage, type ImageAssets } from '../context/ImageAssetsContext';

function SiteHeader() {
  const { content: { profile }, ui } = usePreferences();
  const header = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = header.current;
    if (!element) return;
    const updateHeight = () => {
      document.documentElement.style.setProperty('--header-height', `${element.getBoundingClientRect().height}px`);
    };
    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(element);
    return () => {
      observer.disconnect();
      document.documentElement.style.removeProperty('--header-height');
    };
  }, []);

  return (
    <header ref={header} className="site-header">
      <div className="site-header__inner">
        <a className="site-header__brand" href="#inicio" aria-label={`${profile.name} · ${profile.role}`}>
          <svg viewBox="0 0 240 52" aria-hidden="true" focusable="false">
            <text className="site-header__name" x="1" y="21" textLength="238" lengthAdjust="spacing">{profile.name}</text>
            <text className="site-header__role" x="1" y="45" textLength="238" lengthAdjust="spacing">{profile.role}</text>
          </svg>
        </a>
        <nav className="site-header__nav" aria-label={ui.navigation}>
          <a className="site-header__link" href="#proyectos">{ui.projects}</a>
          <a className="site-header__link" href="#experiencia">{ui.experience}</a>
          <PreferencesToggles />
        </nav>
      </div>
    </header>
  );
}

function Hero() {
  const { content: { profile }, ui } = usePreferences();
  const image = useOptimizedImage(portrait);
  return (
    <section className="hero" id="inicio" aria-labelledby="hero-title">
      <div className="hero__content">
        <h1 className="hero__title" id="hero-title">{profile.name}</h1>
        <p className="hero__role">{profile.role} <span className="hero__stack">React · JavaScript · TypeScript</span></p>
        <p className="hero__description">{profile.introduction}</p>
        <div className="hero__actions">
          <CvDownload />
          <a className="button button--secondary" href="#proyectos">{ui.viewProjects}</a>
        </div>
        <div className="hero__socials">
          <a href={profile.github} target="_blank" rel="noopener noreferrer">GitHub ↗</a>
          <a href={profile.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn ↗</a>
          <a href={`mailto:${profile.email}`}>Email ↗</a>
        </div>
      </div>
      <div className="hero__portrait">
        <img className="hero__image" {...image} alt={profile.name} loading="eager" fetchPriority="high" decoding="async" />
      </div>
    </section>
  );
}

function Projects() {
  const { content: { projects, otherProjects }, ui } = usePreferences();
  return (
    <Section id="proyectos" title={ui.featuredTitle} marqueeTitle={ui.projects} alternate>
      <h3 className="projects__subtitle">{ui.featuredGroupTitle}</h3>
      <div className="projects__featured" data-project-group="featured">
        {projects.filter((project) => project.group === 'featured').map((project) => <ProjectCard key={project.url} project={project} />)}
      </div>
      <section className="projects__other" aria-labelledby="training-projects-title">
        <h2 className="projects__subtitle" id="training-projects-title">{ui.trainingTitle}</h2>
        <div className="projects__featured" data-project-group="training">
          {projects.filter((project) => project.group === 'training').map((project) => <ProjectCard key={project.url} project={project} />)}
        </div>
      </section>
      <section className="projects__other" aria-labelledby="other-projects-title">
        <h2 className="projects__subtitle" id="other-projects-title">{ui.otherTitle}</h2>
        <div className="projects__featured" data-project-group="other">{otherProjects.map((project) => <ProjectCard key={project.image.src} project={project} />)}</div>
      </section>
    </Section>
  );
}

function Experience() {
  const { content: { experiences }, ui } = usePreferences();
  return (
    <Section id="experiencia" title={ui.experienceTitle} marqueeTitle={ui.experience}>
      <div className="experience">
        {experiences.map((experience) => (
          <article className="experience__entry" key={experience.company}>
            <header>
              <h3 className="experience__company">{experience.company}</h3>
              <p className="experience__role">{experience.role}</p>
              <p className="experience__period">
                <time dateTime={String(experience.startYear)}>{experience.startYear}</time>
                {' - '}
                {experience.endYear ? <time dateTime={String(experience.endYear)}>{experience.endYear}</time> : ui.present}
              </p>
            </header>
            <div className="experience__details"><p>{experience.description}</p><ul>{experience.items.map((item) => <li key={item}>{item}</li>)}</ul></div>
          </article>
        ))}
      </div>
    </Section>
  );
}

function Skills() {
  const { content: { skillGroups }, ui } = usePreferences();
  return (
    <Section id="habilidades" title={ui.skillsTitle} marqueeTitle={ui.skillsTitle} alternate>
      <div className="skills__groups">{skillGroups.map((group) => <ContentSection key={group.title} {...group} />)}</div>
      <TechnologySphere />
    </Section>
  );
}

const institutionLogos: Record<string, string> = { Coderhouse: coderhouseLogo, 'EducaciónIT': educacionItLogo, Platzi: platziLogo };

function Education() {
  const { content: { certifications }, ui } = usePreferences();
  return (
    <Section id="sobre-mi" title={ui.educationTitle} marqueeTitle={ui.educationTitle}>
      <div className="education">
        <div className="education__main">
          <ContentSection title={ui.degree} category={ui.university} description={ui.degreeDescription} logo={{ src: unlaLogo, alt: ui.university }} />
          <section className="education__certifications" aria-labelledby="education-courses-title">
            <h3 className="education__subtitle" id="education-courses-title">{ui.courses}</h3>
            <div className="education__courses">{certifications.map((course) => <ContentSection key={course.title} {...course} logo={{ src: institutionLogos[course.title], alt: course.title }} />)}</div>
          </section>
        </div>
        <aside className="education__aside" aria-label={ui.additionalInfo}>
          <ContentSection title={ui.languages} items={[ui.nativeSpanish, ui.intermediateEnglish]} />
        </aside>
      </div>
    </Section>
  );
}

function Contact() {
  const { content: { profile }, ui } = usePreferences();
  return (
    <Section id="contacto" title={ui.contactTitle} alternate>
      <div className="contact">
        <div className="contact__details">
          <p className="contact__label">{ui.emailLabel}</p>
          <a className="contact__email" href={`mailto:${profile.email}`}>{profile.email}</a>
          <div className="contact__links">
            <a href={profile.whatsapp} target="_blank" rel="noopener noreferrer">WhatsApp ↗</a>
            <a href={profile.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn ↗</a>
            <a href={profile.github} target="_blank" rel="noopener noreferrer">GitHub ↗</a>
          </div>
        </div>
        <div className="contact__invitation">
          <h3 className="contact__title">{ui.projectQuestion}</h3>
          <p>{ui.contactInvitation}</p>
          <a className="button button--primary" href={`mailto:${profile.email}`}>{ui.writeEmail} <span aria-hidden="true">↗</span></a>
        </div>
      </div>
    </Section>
  );
}

function Portfolio() {
  const { content: { profile }, ui } = usePreferences();
  return (
    <>
      <a className="skip-link" href="#contenido">{ui.skip}</a>
      <SiteHeader />
      <main id="contenido">
        <Hero />
        <Projects />
        <Experience />
        <Skills />
        <Education />
        <Contact />
      </main>
      <footer className="site-footer"><p>© {new Date().getFullYear()} {profile.name}</p><a href="#inicio">{ui.backToTop} ↑</a></footer>
      <WhatsAppTab />
      <DifferenceCursor />
    </>
  );
}

export default function PortfolioApp({ images }: { images: ImageAssets }) {
  return <ImageAssetsContext.Provider value={images}><PreferencesProvider><Portfolio /></PreferencesProvider></ImageAssetsContext.Provider>;
}
