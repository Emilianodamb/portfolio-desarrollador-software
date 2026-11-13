export default function SectionMarquee({ title }: { title: string }) {
  return (
    <div className="section-marquee" aria-hidden="true">
      <div className="section-marquee__track">
        {[0, 1].map((group) => (
          <span className="section-marquee__group" key={group}>
            {[0, 1, 2, 3].map((word) => (
              <span className="section-marquee__word" key={word}>{title}</span>
            ))}
          </span>
        ))}
      </div>
    </div>
  );
}
