import type { Project } from '../data/portfolio';
import { usePreferences } from '../context/PreferencesContext';

export default function ProjectCard({ project }: { project: Project }) {
  const { ui } = usePreferences();
  const actionLabels = { site: ui.viewSite, application: ui.viewApplication, demo: ui.viewDemo };
  return (
    <article className="project-card">
      <img
        className={`project-card__image${project.imageOrientation === 'portrait' ? ' project-card__image--portrait' : ''}`}
        src={project.image.src}
        width={project.image.width}
        height={project.image.height}
        alt={`${ui.projectImage} ${project.title}`}
        loading="lazy"
        decoding="async"
      />
      <div className="project-card__content">
        <div className="project-card__summary">
          <header className="project-card__header">
            <div>
              <p className="project-card__category">{project.category}</p>
              <h3 className="project-card__title">{project.title}</h3>
            </div>
          </header>
          <p className="project-card__description">{project.description}</p>
          {project.contribution && (
            <div className="project-card__details">
              <p>{project.contribution}</p>
            </div>
          )}
          {project.metric && <p className="project-card__metric">{project.metric}</p>}
          {project.technologies.length > 0 && (
            <ul className="tag-list" aria-label={ui.technologies}>
              {project.technologies.map((technology) => <li className="tag-list__item" key={technology}>{technology}</li>)}
            </ul>
          )}
        </div>
        <div className="project-card__footer">
          {project.status && <p className="project-card__status">{project.status}</p>}
          {project.url && (
            <div className="project-card__links">
              <a href={project.url} target="_blank" rel="noopener noreferrer">{actionLabels[project.action]} <span aria-hidden="true">↗</span><span className="visually-hidden">: {project.title}</span></a>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
