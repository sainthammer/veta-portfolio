import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lightbox from './Lightbox';

gsap.registerPlugin(ScrollTrigger);

interface Work {
  slug: string;
  title: string;
  client: string;
  category: string;
  year: number;
  coverSrc: string;
  gallerySrc: string[];
  description?: string;
  body?: string;
  tags: string[];
  order: number;
}

interface Props {
  works: Work[];
}

const layouts = [
  { col: 1,  row: 1,  cs: 5, rs: 6, offset: 0 },
  { col: 7,  row: 2,  cs: 4, rs: 5, offset: 0.3 },
  { col: 2,  row: 8,  cs: 4, rs: 5, offset: 0.5 },
  { col: 8,  row: 9,  cs: 5, rs: 6, offset: 0.15 },
  { col: 1,  row: 15, cs: 5, rs: 5, offset: 0.4 },
  { col: 7,  row: 16, cs: 5, rs: 6, offset: 0.2 },
];

export default function ScatteredPortfolio({ works }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeWork, setActiveWork] = useState<Work | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    if (window.matchMedia('(max-width: 768px)').matches) return;

    const items = containerRef.current.querySelectorAll<HTMLElement>('[data-work-item]');
    const triggers: ScrollTrigger[] = [];

    items.forEach((item) => {
      const speed = parseFloat(item.dataset.speed || '0');
      if (speed === 0) return;
      const t = gsap.to(item, {
        y: () => -speed * 200,
        ease: 'none',
        scrollTrigger: {
          trigger: item,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
        },
      });
      if (t.scrollTrigger) triggers.push(t.scrollTrigger);
    });

    items.forEach((item) => {
      const img = item.querySelector<HTMLImageElement>('[data-cover-img]');
      if (!img) return;
      item.addEventListener('mouseenter', () => {
        gsap.to(img, { scale: 1.06, duration: 0.8, ease: 'power3.out' });
      });
      item.addEventListener('mouseleave', () => {
        gsap.to(img, { scale: 1, duration: 0.8, ease: 'power3.out' });
      });
    });

    return () => {
      triggers.forEach((t) => t.kill());
    };
  }, [works]);

  const openWork = (work: Work, e: React.MouseEvent) => {
    e.preventDefault();
    const images = [work.coverSrc, ...(work.gallerySrc || [])];
    setActiveWork({ ...work, images } as any);
  };

  return (
    <>
      <div ref={containerRef} className="relative">
        {/* Desktop scattered grid */}
        <div className="hidden md:grid grid-cols-12 gap-6 lg:gap-10" style={{ gridAutoRows: '60px' }}>
          {works.map((work, idx) => {
            const layout = layouts[idx % layouts.length];
            const galleryCount = (work.gallerySrc?.length || 0) + 1;
            return (
              <button
                type="button"
                onClick={(e) => openWork(work, e)}
                key={work.slug}
                data-work-item
                data-speed={layout.offset}
                data-cursor-hover
                className="group relative flex flex-col text-left"
                style={{
                  gridColumn: `${layout.col} / span ${layout.cs}`,
                  gridRow: `${layout.row} / span ${layout.rs}`,
                }}
              >
                {/* Image */}
                <div className="relative flex-1 overflow-hidden rounded-md bg-ink/5 min-h-0">
                  <img
                    src={work.coverSrc}
                    alt={work.title}
                    loading={idx < 2 ? 'eager' : 'lazy'}
                    data-cover-img
                    className="absolute inset-0 w-full h-full object-cover will-change-transform"
                  />
                  <div className="absolute top-4 left-4 flex items-center gap-2">
                    <span className="pill bg-bg/90 backdrop-blur-sm text-[10px]">{work.category}</span>
                  </div>
                  {galleryCount > 1 && (
                    <div className="absolute top-4 right-4 pill bg-ink/80 text-bg backdrop-blur-sm text-[10px]">
                      +{galleryCount - 1}
                    </div>
                  )}
                  <div className="absolute bottom-4 right-4 font-mono text-[10px] text-bg opacity-70">
                    {String(work.order).padStart(2, '0')}
                  </div>
                </div>

                {/* Always-visible caption below */}
                <div className="mt-4 pr-2">
                  <h3 className="font-sans font-black uppercase leading-tight tracking-tight group-hover:opacity-70 transition-opacity duration-300"
                      style={{ fontSize: 'clamp(1rem, 1.6vw, 1.5rem)' }}>
                    {work.title}
                  </h3>
                  {work.description && (
                    <p className="mt-2 text-xs text-ink-muted leading-relaxed line-clamp-2">
                      {work.description}
                    </p>
                  )}
                  <div className="mt-2 flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-ink-faint">
                    <span>{work.client}</span>
                    {work.client && <span>·</span>}
                    <span>{work.year}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Mobile stack */}
        <div className="md:hidden flex flex-col gap-10">
          {works.map((work) => {
            const galleryCount = (work.gallerySrc?.length || 0) + 1;
            return (
              <button
                type="button"
                onClick={(e) => openWork(work, e)}
                key={work.slug}
                className="group flex flex-col text-left"
              >
                <div className="relative overflow-hidden rounded-md aspect-[4/5]">
                  <img
                    src={work.coverSrc}
                    alt={work.title}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="pill bg-bg/90 text-[10px]">{work.category}</span>
                  </div>
                  {galleryCount > 1 && (
                    <div className="absolute top-4 right-4 pill bg-ink/80 text-bg text-[10px]">
                      +{galleryCount - 1}
                    </div>
                  )}
                </div>
                <div className="mt-4">
                  <h3 className="font-sans font-black uppercase text-xl leading-tight tracking-tight">
                    {work.title}
                  </h3>
                  {work.description && (
                    <p className="mt-2 text-xs text-ink-muted leading-relaxed line-clamp-2">
                      {work.description}
                    </p>
                  )}
                  <div className="mt-2 flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-ink-faint">
                    <span>{work.client}</span>
                    {work.client && <span>·</span>}
                    <span>{work.year}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <Lightbox work={activeWork} onClose={() => setActiveWork(null)} />
    </>
  );
}
