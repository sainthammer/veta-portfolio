import { useRef, useEffect } from 'react';
import type { ReactNode } from 'react';
import { gsap } from 'gsap';

interface Props {
  children: ReactNode;
  href?: string;
  className?: string;
  strength?: number;
}

export default function MagneticButton({
  children,
  href,
  className = '',
  strength = 0.3,
}: Props) {
  const ref = useRef<HTMLAnchorElement | HTMLButtonElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(hover: none)').matches) return;

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      gsap.to(el, {
        x: x * strength,
        y: y * strength,
        duration: 0.5,
        ease: 'power3.out',
      });
    };

    const onLeave = () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)' });
    };

    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);

    return () => {
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
    };
  }, [strength]);

  if (href) {
    return (
      <a ref={ref as any} href={href} className={className} data-cursor-hover>
        {children}
      </a>
    );
  }

  return (
    <button ref={ref as any} className={className} data-cursor-hover>
      {children}
    </button>
  );
}
