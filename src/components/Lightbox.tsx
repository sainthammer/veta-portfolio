import { useEffect, useCallback, useRef, useState } from 'react';

interface Work {
  slug: string;
  title: string;
  client: string;
  category: string;
  year: number;
  description?: string;
  images: string[];
}

interface Props {
  work: Work | null;
  onClose: () => void;
}

export default function Lightbox({ work, onClose }: Props) {
  const [index, setIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  useEffect(() => {
    setIndex(0);
  }, [work?.slug]);

  const next = useCallback(() => {
    if (!work) return;
    setIndex((i) => (i + 1) % work.images.length);
  }, [work]);

  const prev = useCallback(() => {
    if (!work) return;
    setIndex((i) => (i - 1 + work.images.length) % work.images.length);
  }, [work]);

  useEffect(() => {
    if (!work) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    };
    document.addEventListener('keydown', onKey);

    const lenis = (window as any).lenis;
    if (lenis) lenis.stop();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Lower header z-index instead of hiding it (hiding breaks cursor)
    const header = document.querySelector<HTMLElement>('header');
    const prevZ = header?.style.zIndex || '';
    if (header) header.style.zIndex = '-1';

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      if (lenis) lenis.start();
      if (header) header.style.zIndex = prevZ;
    };
  }, [work, next, prev, onClose]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchEndX.current = null;
    touchStartX.current = e.targetTouches[0].clientX;
  };
  const onTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };
  const onTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const dx = touchStartX.current - touchEndX.current;
    if (Math.abs(dx) < 50) return;
    if (dx > 0) next();
    else prev();
  };

  if (!work) return null;
  const total = work.images.length;

  return (
    // Outer overlay — клик по фону закрывает
    <div
      className="fixed inset-0 z-[10000] bg-ink/70 backdrop-blur-sm flex items-center justify-center p-4 md:p-10"
      onClick={onClose}
    >
      {/* Modal card — ограниченный размер, клики не пробрасываются */}
      <div
        className="relative w-full max-w-6xl max-h-full flex flex-col bg-bg rounded-lg shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* ========== TOP BAR ========== */}
        <div className="shrink-0 border-b border-ink/10 bg-bg">
          <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <span className="pill bg-ink text-bg border-ink text-xs shrink-0">
                {work.category}
              </span>
              <span className="hidden sm:inline text-xs font-mono text-ink-muted uppercase tracking-widest truncate">
                {work.client && `${work.client} · `}{work.year}
              </span>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <span className="hidden md:inline text-[11px] font-mono text-ink-muted uppercase tracking-widest">
                ESC / ← →
              </span>
              <button
                type="button"
                onClick={onClose}
                aria-label="Закрыть"
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-ink text-bg hover:bg-accent transition-colors duration-300 text-xs font-mono uppercase tracking-widest"
                data-cursor-hover
              >
                <span className="hidden sm:inline">Закрыть</span>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M3 3L13 13M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* ========== IMAGE AREA (side navigation zones) ========== */}
        <div className="flex-1 flex min-h-0 bg-bg-secondary/30">
          {/* Prev click-zone (left margin) */}
          {total > 1 && (
            <button
              type="button"
              onClick={prev}
              aria-label="Предыдущее"
              className="group shrink-0 w-12 md:w-20 flex items-center justify-center hover:bg-ink/5 transition-colors duration-300"
              data-cursor-hover
            >
              <span className="w-9 h-9 md:w-11 md:h-11 rounded-full bg-ink/10 group-hover:bg-ink group-hover:text-bg text-ink flex items-center justify-center transition-colors duration-300">
                <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
                  <path d="M12 3L6 9L12 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            </button>
          )}

          {/* Image wrapper */}
          <div className="flex-1 flex items-center justify-center p-2 md:p-4 min-w-0">
            <img
              key={index}
              src={work.images[index]}
              alt={`${work.title} — ${index + 1} из ${total}`}
              className="max-w-full max-h-full w-auto h-auto object-contain animate-fade-in"
            />
          </div>

          {/* Next click-zone (right margin) */}
          {total > 1 && (
            <button
              type="button"
              onClick={next}
              aria-label="Следующее"
              className="group shrink-0 w-12 md:w-20 flex items-center justify-center hover:bg-ink/5 transition-colors duration-300"
              data-cursor-hover
            >
              <span className="w-9 h-9 md:w-11 md:h-11 rounded-full bg-ink/10 group-hover:bg-ink group-hover:text-bg text-ink flex items-center justify-center transition-colors duration-300">
                <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
                  <path d="M6 3L12 9L6 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            </button>
          )}
        </div>

        {/* ========== BOTTOM BAR ========== */}
        <div className="shrink-0 border-t border-ink/10 bg-bg">
          <div className="px-4 md:px-6 py-3 md:py-4">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <h3 className="font-display text-lg md:text-2xl leading-tight font-light truncate">
                  {work.title}<span className="text-accent">.</span>
                </h3>
                {work.description && (
                  <p className="hidden md:block mt-0.5 text-xs text-ink-soft truncate">
                    {work.description}
                  </p>
                )}
              </div>

              {total > 1 && (
                <div className="flex items-center gap-3 shrink-0">
                  <div className="hidden sm:flex items-center gap-1.5">
                    {work.images.map((_, i) => (
                      <button
                        type="button"
                        key={i}
                        onClick={() => setIndex(i)}
                        aria-label={`Фото ${i + 1}`}
                        className={`h-1 rounded-full transition-all duration-300 ${
                          i === index ? 'w-6 bg-accent' : 'w-2.5 bg-ink/20 hover:bg-ink/40'
                        }`}
                        data-cursor-hover
                      />
                    ))}
                  </div>
                  <span className="text-xs font-mono text-ink-muted uppercase tracking-widest tabular-nums shrink-0">
                    {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
