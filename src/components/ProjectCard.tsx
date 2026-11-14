import type { DisplayProject } from '../data/portfolio';
import { usePreferences } from '../context/PreferencesContext';
import TechnologyList from './TechnologyList';
import { useOptimizedImage } from '../context/ImageAssetsContext';

export default function ProjectCard({ project }: { project: DisplayProject }) {
  const { ui } = usePreferences();
  const image = useOptimizedImage(project.image);
  const actionLabels = { site: ui.viewSite, application: ui.viewApplication, demo: ui.viewDemo, video: ui.viewDemoVideo };
  return (
    <article className="project-card">
      <img
        className="project-card__image"
        {...image}
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
          <TechnologyList technologies={project.technologies} />
        </div>
        <div className="project-card__footer">
          {project.status && <p className="project-card__status">{project.status}</p>}
          {(project.url || project.repositoryUrl) && (
            <div className="project-card__links">
              {project.url && <a href={project.url} target="_blank" rel="noopener noreferrer">{actionLabels[project.action ?? 'site']} {project.showUrl && <><span className="project-card__destination">({project.url})</span>{' '}</>}<span aria-hidden="true">↗</span><span className="visually-hidden">: {project.title}</span></a>}
              {project.repositoryUrl && <a className="project-card__repository" href={project.repositoryUrl} target="_blank" rel="noopener noreferrer">{ui.viewRepository} <span aria-hidden="true">↗</span><span className="visually-hidden">: {project.title}</span></a>}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
