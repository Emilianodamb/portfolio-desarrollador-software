import type { ImageMetadata } from 'astro';
import { usePreferences } from '../context/PreferencesContext';

interface Props {
  title: string;
  category?: string;
  description?: string;
  items?: string[];
  technologies?: string[];
  url?: string;
  image?: ImageMetadata;
}

export default function InfoCard({ title, category, description, items, technologies, url, image }: Props) {
  const { ui } = usePreferences();
  return (
    <article className="info-card">
      {image && (
        <img
          className="info-card__image"
          src={image.src}
          width={image.width}
          height={image.height}
          alt={`${ui.projectImage} ${title}`}
          loading="lazy"
          decoding="async"
        />
      )}
      {category && <p className="info-card__category">{category}</p>}
      <h3 className="info-card__title">{title}</h3>
      {description && <p className="info-card__description">{description}</p>}
      {items && <ul className="info-card__list">{items.map((item) => <li key={item}>{item}</li>)}</ul>}
      {technologies && <p className="info-card__technologies">{technologies.join(' · ')}</p>}
      {url && <a className="info-card__link" href={url} target="_blank" rel="noopener noreferrer">{ui.viewRepository} <span aria-hidden="true">↗</span><span className="visually-hidden">: {title}</span></a>}
    </article>
  );
}
