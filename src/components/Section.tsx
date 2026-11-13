import type { ReactNode } from 'react';
import SectionMarquee from './SectionMarquee';

interface Props {
  id: string;
  title: string;
  alternate?: boolean;
  marqueeTitle?: string;
  children: ReactNode;
}

export default function Section({ id, title, alternate = false, marqueeTitle, children }: Props) {
  return (
    <section id={id} className={`section${alternate ? ' section--alternate' : ''}${marqueeTitle ? ' section--marquee' : ''}`} aria-labelledby={`${id}-title`}>
      {marqueeTitle && <SectionMarquee title={marqueeTitle} />}
      <div className="section__inner">
        <header className="section__heading">
          <h2 id={`${id}-title`} className={marqueeTitle ? 'visually-hidden' : 'section__title'}>{title}</h2>
        </header>
        {children}
      </div>
    </section>
  );
}
