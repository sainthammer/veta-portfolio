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
      const img = item.querySelector('img');
      const overlay = item.querySelector('[data-overlay]');
      if (!img) return;

      item.addEventListener('mouseenter', () => {
        gsap.to(img, { scale: 1.08, duration: 0.8, ease: 'power3.out' });
        if (overlay) gsap.to(overlay, { opacity: 1, duration: 0.4 });
      });
      item.addEventListener('mouseleave', () => {
        gsap.to(img, { scale: 1, duration: 0.8, ease: 'power3.out' });
        if (overlay) gsap.to(overlay, { opacity: 0, duration: 0.4 });
      });
    });

    return () => {
      triggers.forEach((t) => t.kill());
    };
  }, [works]);

  const openWork = (work: Work, e: React.MouseEvent) => {
    e.preventDefault();
    // Combine cover + gallery into single array
    const images = [work.coverSrc, ...(work.gallerySrc || [])];
    setActiveWork({ ...work, images } as any);
  };

  return (
    <>
      <div ref={containerRef} className="relative">
        {/* Desktop: scattered grid */}
        <div className="hidden md:grid grid-cols-12 gap-6 lg:gap-10" style={{ gridAutoRows: '60px' }}>
          {works.map((work, idx) => {
            const layout = layouts[idx % layouts.length];
            const galleryCount = (work.gallerySrc?.length || 0) + 1; // +1 for cover
            return (
              <button
                type="button"
                onClick={(e) => openWork(work, e)}
                key={work.slug}
                data-work-item
                data-speed={layout.offset}
                data-cursor-hover
                className="group relative block overflow-hidden rounded-md text-left"
                style={{
                  gridColumn: `${layout.col} / span ${layout.cs}`,
                  gridRow: `${layout.row} / span ${layout.rs}`,
                }}
              >
                <div className="absolute inset-0 bg-ink/5">
                  <img
                    src={work.coverSrc}
                    alt={work.title}
                    loading={idx < 2 ? 'eager' : 'lazy'}
                    className="w-full h-full object-cover will-change-transform"
                  />
                </div>
                <div
                  data-overlay
                  className="absolute inset-0 bg-ink/40 opacity-0 flex items-end p-6 md:p-8 pointer-events-none"
                >
                  <div className="text-bg">
                    <div className="text-xs font-mono uppercase tracking-widest mb-2 text-accent">
                      {work.category} / {work.year}
                    </div>
                    <div className="font-display text-3xl md:text-4xl leading-none">
                      {work.title}
                    </div>
                    <div className="mt-3 text-xs font-mono uppercase tracking-widest opacity-70 flex items-center gap-2">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <rect x="1" y="2" width="10" height="8" rx="1" stroke="currentColor" strokeWidth="1" />
                        <circle cx="6" cy="6" r="2" stroke="currentColor" strokeWidth="1" fill="none" />
                      </svg>
                      {galleryCount} фото — клик для просмотра
                    </div>
                  </div>
                </div>
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <span className="pill bg-bg/90 backdrop-blur-sm text-xs">
                    {work.category}
                  </span>
                </div>
                {galleryCount > 1 && (
                  <div className="absolute top-4 right-4 pill bg-ink/80 text-bg backdrop-blur-sm text-xs">
                    +{galleryCount - 1}
                  </div>
                )}
                <div className="absolute bottom-4 right-4 font-mono text-xs text-bg opacity-60">
                  {String(work.order).padStart(2, '0')}
                </div>
              </button>
            );
          })}
        </div>

        {/* Mobile: simple stack */}
        <div className="md:hidden flex flex-col gap-6">
          {works.map((work) => {
            const galleryCount = (work.gallerySrc?.length || 0) + 1;
            return (
              <button
                type="button"
                onClick={(e) => openWork(work, e)}
                key={work.slug}
                className="group relative block overflow-hidden rounded-md aspect-[4/5] text-left"
              >
                <img
                  src={work.coverSrc}
                  alt={work.title}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4">
                  <span className="pill bg-bg/90 text-xs">{work.category}</span>
                </div>
                {galleryCount > 1 && (
                  <div className="absolute top-4 right-4 pill bg-ink/80 text-bg text-xs">
                    +{galleryCount - 1}
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-ink/80 to-transparent text-bg">
                  <div className="font-display text-2xl leading-none">{work.title}</div>
                  <div className="text-xs mt-1 opacity-70">{work.client} — {work.year}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Lightbox */}
      <Lightbox work={activeWork} onClose={() => setActiveWork(null)} />
    </>
  );
}
