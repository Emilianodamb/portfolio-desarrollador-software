import type { TechnologyLogoAsset } from '../data/technologyLogos';

export default function TechnologyLogo({ logo, label = logo.name }: { logo: TechnologyLogoAsset; label?: string }) {
  return <img className={`technology-logo${logo.tone ? ` technology-logo--${logo.tone}` : ''}`}
    src={logo.src} alt={label} title={label} width="120" height="56" loading="lazy" decoding="async" />;
}
