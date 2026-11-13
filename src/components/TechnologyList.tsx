import { usePreferences } from '../context/PreferencesContext';
import { findTechnologyLogo } from '../data/technologyLogos';
import TechnologyLogo from './TechnologyLogo';

export default function TechnologyList({ technologies }: { technologies: string[] }) {
  const { ui } = usePreferences();
  if (!technologies.length) return null;

  return (
    <ul className="technology-list" aria-label={ui.technologies}>
      {technologies.map((technology) => {
        const logo = findTechnologyLogo(technology);
        return <li key={technology} data-technology={technology}>
          {logo ? <TechnologyLogo logo={logo} label={technology} /> : <span className="technology-list__text">{technology}</span>}
        </li>;
      })}
    </ul>
  );
}
