import type { Project } from '../data/portfolio';
import { usePreferences } from '../context/PreferencesContext';

export default function ProjectCard({ project }: { project: Project }) {
  const { ui } = usePreferences();
  return (
    <article className="project-card">
      <img
        className="project-card__image"
        src={project.image.src}
        width={project.image.width}
        height={project.image.height}
        alt={`${ui.projectImage} ${project.title}`}
        loading="lazy"
        decoding="async"
      />
      <div className="project-card__content">
        <header className="project-card__header">
          <div>
            <p className="project-card__category">{project.category}</p>
            <h3 className="project-card__title">{project.title}</h3>
          </div>
          <div className="project-card__links">
            <a href={project.url} target="_blank" rel="noopener noreferrer">{ui.viewProject} <span aria-hidden="true">↗</span><span className="visually-hidden">: {project.title}</span></a>
            {project.repository && <a href={project.repository} target="_blank" rel="noopener noreferrer">{ui.repository}<span className="visually-hidden">: {project.title}</span></a>}
          </div>
        </header>
        {project.technologies.length > 0 && (
          <ul className="tag-list" aria-label={ui.technologies}>
            {project.technologies.map((technology) => <li className="tag-list__item" key={technology}>{technology}</li>)}
          </ul>
        )}
        <div className="project-card__details">
          <div><h4 className="project-card__label">{ui.context}</h4><p>{project.context}</p></div>
          {project.challenge && <div><h4 className="project-card__label">{ui.challenge}</h4><p>{project.challenge}</p></div>}
        </div>
      </div>
    </article>
  );
}
