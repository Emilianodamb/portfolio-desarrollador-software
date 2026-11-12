import type { ReactNode } from 'react';

interface Props {
  id: string;
  title: string;
  description?: string;
  alternate?: boolean;
  children: ReactNode;
}

export default function Section({ id, title, description, alternate = false, children }: Props) {
  return (
    <section id={id} className={`section${alternate ? ' section--alternate' : ''}`} aria-labelledby={`${id}-title`}>
      <div className="section__inner">
        <header className="section__heading">
          <h2 id={`${id}-title`} className="section__title">{title}</h2>
          {description && <p className="section__description">{description}</p>}
        </header>
        {children}
      </div>
    </section>
  );
}
