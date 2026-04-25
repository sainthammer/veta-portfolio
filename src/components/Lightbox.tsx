import { useEffect, useCallback, useRef, useState } from 'react';

interface Work {
  slug: string;
  title: string;
  client: string;
  category: string;
  year: number;
  description?: string;
  body?: string;
  images: string[];
  tags?: string[];
}

interface Props {
  work: Work | null;
  onClose: () => void;
}

function renderMarkdown(md: string): string {
  return md
    .replace(/:::\s*(\w+)\n([\s\S]*?):::/g, (_, type, content) => {
      const labels: Record<string, string> = {
        result:  'Результат',
        insight: 'Инсайт',
        quote:   'Цитата',
        note:    'Заметка',
        stat:    'Цифры',
      };
      const label = labels[type] || type;
      return `<div class="cms-block cms-block--${type}"><div class="cms-block__label">${label}</div><div class="cms-block__body">${content.trim()}</div></div>`;
    })
    .replace(/^### (.+)$/gm, '<h3 class="cms-h3">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="cms-h2">$1</h2>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^---$/gm, '<hr class="cms-hr" />')
    .replace(/^[-*] (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>[\s\S]*?<\/li>)(\n(?!<li>)|$)/g, '<ul class="cms-ul">$1</ul>')
    .replace(/^(?!<[a-z])(.+)$/gm, '<p class="cms-p">$1</p>');
}

export default function Lightbox({ work, onClose }: Props) {
  const [index, setIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  useEffect(() => {
    setIndex(0);
    // Скроллим наверх при открытии новой работы
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [work?.slug]);

  useEffect(() => {
    setLoaded(false);
  }, [index]);

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
  const hasDesc = !!(work.body && work.body.trim());

  return (
    <div
      className="fixed inset-0 z-[10000] bg-ink/70 backdrop-blur-sm flex items-center justify-center p-4 md:p-10"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-full flex flex-col bg-bg rounded-lg shadow-2xl overflow-hidden"
        style={{ height: 'min(92vh, 900px)' }}
        onClick={(e) => e.stopPropagation()}
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

        {/* ========== SCROLLABLE BODY ========== */}
        <div
          ref={scrollRef}
          className="flex-1 min-h-0 overflow-y-auto overscroll-contain"
          data-lenis-prevent
        >
          {/* Фото с навигацией */}
          <div
            className="relative bg-bg-secondary/30"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <div className="flex items-stretch" style={{ minHeight: '50vh', maxHeight: '70vh' }}>
              {/* Prev */}
              {total > 1 && (
                <button
                  type="button"
                  onClick={prev}
                  aria-label="Предыдущее"
                  className="group shrink-0 w-10 md:w-16 flex items-center justify-center transition-colors duration-300"
                  data-cursor-hover
                >
                  <span className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-ink/10 group-hover:bg-ink group-hover:text-bg text-ink flex items-center justify-center transition-colors duration-300">
                    <svg width="12" height="12" viewBox="0 0 18 18" fill="none">
                      <path d="M12 3L6 9L12 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </button>
              )}

              {/* Изображение */}
              <div className="flex-1 flex items-center justify-center relative overflow-hidden p-2 md:p-4">
                {!loaded && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full border-2 border-ink/20 border-t-accent animate-spin" />
                  </div>
                )}
                <img
                  key={index}
                  src={work.images[index]}
                  alt={`${work.title} — ${index + 1} из ${total}`}
                  onLoad={() => setLoaded(true)}
                  className={`max-w-full max-h-full object-contain transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
                  style={{ maxHeight: '65vh' }}
                />
              </div>

              {/* Next */}
              {total > 1 && (
                <button
                  type="button"
                  onClick={next}
                  aria-label="Следующее"
                  className="group shrink-0 w-10 md:w-16 flex items-center justify-center transition-colors duration-300"
                  data-cursor-hover
                >
                  <span className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-ink/10 group-hover:bg-ink group-hover:text-bg text-ink flex items-center justify-center transition-colors duration-300">
                    <svg width="12" height="12" viewBox="0 0 18 18" fill="none">
                      <path d="M6 3L12 9L6 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </button>
              )}
            </div>

            {/* Точки-индикаторы */}
            {total > 1 && (
              <div className="flex items-center justify-center gap-2 pb-4">
                {work.images.map((_, i) => (
                  <button
                    type="button"
                    key={i}
                    onClick={() => setIndex(i)}
                    aria-label={`Фото ${i + 1}`}
                    className={`h-1 rounded-full transition-all duration-300 ${
                      i === index ? 'w-6 bg-accent' : 'w-2 bg-ink/20 hover:bg-ink/40'
                    }`}
                    data-cursor-hover
                  />
                ))}
              </div>
            )}
          </div>

          {/* Заголовок + описание */}
          <div className="px-6 md:px-10 py-8 border-t border-ink/10">
            <h3 className="font-display text-2xl md:text-4xl font-light">
              {work.title}<span className="text-accent">.</span>
            </h3>
            <div className="mt-3 flex flex-wrap gap-3 items-center">
              {work.client && (
                <span className="text-xs font-mono uppercase tracking-widest text-ink-muted">
                  {work.client}
                </span>
              )}
              {work.client && <span className="text-ink/20">·</span>}
              <span className="text-xs font-mono uppercase tracking-widest text-ink-muted">
                {work.year}
              </span>
              {work.tags && work.tags.map((tag) => (
                <span key={tag} className="pill text-[10px]">{tag}</span>
              ))}
            </div>
            {work.description && (
              <p className="mt-4 text-sm text-ink-muted leading-relaxed">
                {work.description}
              </p>
            )}

            {/* Markdown-контент */}
            {hasDesc && (
              <div
                className="cms-content mt-8 pt-8 border-t border-ink/10"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(work.body!) }}
              />
            )}
          </div>
        </div>

      </div>

      <style>{`
        .cms-content { color: #1A1A1A; line-height: 1.7; }
        .cms-h2 { font-family: 'Inter Tight', sans-serif; font-weight: 800; font-size: clamp(1.4rem, 3vw, 2rem); text-transform: uppercase; letter-spacing: -0.02em; margin: 2.5rem 0 1rem; }
        .cms-h3 { font-family: 'Inter Tight', sans-serif; font-weight: 700; font-size: 1rem; text-transform: uppercase; letter-spacing: 0.05em; margin: 2rem 0 0.75rem; color: #707070; }
        .cms-p { font-size: 0.9375rem; margin: 0 0 1rem; color: #1A1A1A; }
        .cms-ul { margin: 0 0 1.25rem 0; padding: 0; list-style: none; }
        .cms-ul li { padding-left: 1.25rem; position: relative; font-size: 0.9375rem; margin-bottom: 0.4rem; color: #1A1A1A; }
        .cms-ul li::before { content: '—'; position: absolute; left: 0; color: #B0B0B0; }
        .cms-hr { border: none; border-top: 1px solid rgba(10,10,10,0.1); margin: 2rem 0; }
        .cms-block { border-radius: 8px; padding: 1.25rem 1.5rem; margin: 1.5rem 0; }
        .cms-block__label { font-family: 'Inter Tight', sans-serif; font-size: 0.65rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 0.5rem; opacity: 0.5; }
        .cms-block__body { font-size: 0.9375rem; line-height: 1.6; }
        .cms-block--result  { background: #0A0A0A; color: #fff; }
        .cms-block--result .cms-block__label { opacity: 0.4; }
        .cms-block--insight { background: #F5F5F5; border-left: 3px solid #0A0A0A; }
        .cms-block--quote   { background: #F5F5F5; font-style: italic; }
        .cms-block--note    { background: #FFFBEB; border: 1px solid rgba(10,10,10,0.08); }
        .cms-block--stat    { background: #F5F5F5; }
        .cms-block--stat .cms-block__body { font-family: 'Inter Tight', sans-serif; font-size: 2rem; font-weight: 800; letter-spacing: -0.03em; }
      `}</style>
    </div>
  );
}
