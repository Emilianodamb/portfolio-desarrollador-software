interface Props {
  title: string;
  category?: string;
  description?: string;
  items?: string[];
  logo?: { src: string; alt: string };
}

export default function ContentSection({ title, category, description, items, logo }: Props) {
  const content = (
    <>
      {category && <p className="content-section__category">{category}</p>}
      <h3 className="content-section__title">{title}</h3>
      {description && <p className="content-section__description">{description}</p>}
      {items && <ul className="content-section__list">{items.map(item => <li key={item}>{item}</li>)}</ul>}
    </>
  );

  return (
    <section className={`content-section${logo ? ' content-section--institution' : ''}`}>
      {logo ? (
        <>
          <div className="content-section__body">{content}</div>
          <img className="education__logo" src={logo.src} alt={logo.alt} width="200" height="72" loading="lazy" decoding="async" />
        </>
      ) : content}
    </section>
  );
}
