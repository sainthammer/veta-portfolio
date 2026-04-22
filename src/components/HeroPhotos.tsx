import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface Photo {
  src: string;
  alt: string;
  caption?: string;
}

interface Props {
  photos: Photo[];
}

// Layout preset for 3 cards — different aspect ratios, offsets, parallax speeds
// Positions are designed for a right-side column
const layouts = [
  // Card 1: top, slightly left, tallest
  {
    className: 'col-span-7 row-start-1 aspect-[3/4]',
    rotate: '-3deg',
    parallaxY: -80,
    delay: 0,
  },
  // Card 2: right, middle, offset down
  {
    className: 'col-span-5 col-start-8 row-start-1 mt-16 aspect-[4/5]',
    rotate: '4deg',
    parallaxY: -160,
    delay: 0.1,
  },
  // Card 3: bottom left, medium
  {
    className: 'col-span-6 col-start-2 row-start-2 -mt-8 aspect-[4/5]',
    rotate: '-2deg',
    parallaxY: -40,
    delay: 0.2,
  },
];

export default function HeroPhotos({ photos }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    if (window.matchMedia('(max-width: 768px)').matches) return;

    const cards = containerRef.current.querySelectorAll<HTMLElement>('[data-hero-card]');
    const triggers: ScrollTrigger[] = [];

    cards.forEach((card) => {
      const parallaxY = parseFloat(card.dataset.parallaxY || '0');
      if (parallaxY === 0) return;

      const t = gsap.to(card, {
        y: parallaxY,
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 1.2,
        },
      });
      if (t.scrollTrigger) triggers.push(t.scrollTrigger);
    });

    return () => {
      triggers.forEach((t) => t.kill());
    };
  }, []);

  return (
    <div ref={containerRef} className="relative w-full h-full">
      {/* Desktop: floating grid */}
      <div className="hidden md:grid grid-cols-12 gap-4 relative">
        {photos.slice(0, 3).map((photo, idx) => {
          const layout = layouts[idx];
          return (
            <div
              key={idx}
              data-hero-card
              data-parallax-y={layout.parallaxY}
              className={`${layout.className} group relative`}
              style={{
                transform: `rotate(${layout.rotate})`,
                animationDelay: `${layout.delay}s`,
              }}
            >
              {/* Accent shadow card (sits behind) */}
              <div
                className="absolute inset-0 bg-accent/90 rounded-sm translate-x-2 translate-y-2 group-hover:translate-x-3 group-hover:translate-y-3 transition-transform duration-700 ease-out"
                aria-hidden="true"
              />

              {/* Photo */}
              <div className="relative w-full h-full overflow-hidden rounded-sm bg-bg-secondary shadow-xl">
                <img
                  src={photo.src}
                  alt={photo.alt}
                  loading={idx === 0 ? 'eager' : 'lazy'}
                  className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
                />
                {/* subtle warm overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-ink/15 to-transparent pointer-events-none" />

                {/* Caption — appears on hover */}
                {photo.caption && (
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-ink/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <p className="text-bg text-xs font-mono uppercase tracking-widest">
                      {photo.caption}
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile: horizontal scroll */}
      <div className="md:hidden -mx-6 overflow-x-auto no-scrollbar">
        <div className="flex gap-4 px-6 pb-4">
          {photos.slice(0, 3).map((photo, idx) => (
            <div
              key={idx}
              className="shrink-0 w-[70vw] max-w-[320px] aspect-[4/5] rounded-sm overflow-hidden relative shadow-md"
            >
              <img
                src={photo.src}
                alt={photo.alt}
                loading={idx === 0 ? 'eager' : 'lazy'}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/15 to-transparent pointer-events-none" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
