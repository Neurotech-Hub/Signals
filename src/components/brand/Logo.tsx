import type { CSSProperties } from 'react';

interface LogoProps {
  /** Font size of the wordmark; the mark scales with it. */
  size?: 'sm' | 'md' | 'lg';
  /** Light text for dark backgrounds, dark text for light backgrounds. */
  tone?: 'light' | 'dark';
  className?: string;
  href?: string;
}

const SIZE_CLASS: Record<NonNullable<LogoProps['size']>, string> = {
  sm: 'text-[1.25rem]',
  md: 'text-[1.6rem]',
  lg: 'text-[1.95rem]',
};

/**
 * Lowercase "signals" wordmark with a dot in place of a period, wrapped in
 * concentric rings that radiate outward (CSS-only; see index.css).
 */
export function Logo({ size = 'md', tone = 'light', className = '', href = '#top' }: LogoProps) {
  const color = tone === 'light' ? 'text-white' : 'text-ink-950';
  const style = { '--mark-ring-color': '#60a5fa' } as CSSProperties;

  return (
    <a
      href={href}
      aria-label="Signals — home"
      className={`inline-flex items-center font-logo font-semibold tracking-[-0.03em] leading-none ${SIZE_CLASS[size]} ${color} ${className}`}
      style={style}
    >
      <span>signals</span>
      <span className="signals-mark translate-y-[0.06em]" aria-hidden="true">
        <svg className="signals-mark__svg" viewBox="0 0 24 24">
          <circle className="signals-mark__ring signals-mark__ring--outer" cx="12" cy="12" r="9.6" />
          <circle className="signals-mark__ring" cx="12" cy="12" r="6" />
          <circle className="signals-mark__wave" cx="12" cy="12" r="3.5" />
          <circle className="signals-mark__wave signals-mark__wave--late" cx="12" cy="12" r="3.5" />
          <circle className="signals-mark__dot" cx="12" cy="12" r="3.5" />
        </svg>
      </span>
    </a>
  );
}
