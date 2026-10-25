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
      className={`inline-flex items-center font-brand font-semibold tracking-[-0.03em] leading-none ${SIZE_CLASS[size]} ${color} ${className}`}
      style={style}
    >
      <span>signals</span>
      <span className="signals-mark translate-y-[0.06em]" aria-hidden="true">
        <span className="signals-mark__dot" />
        <span className="signals-mark__ring signals-mark__ring--static" />
        <span className="signals-mark__ring signals-mark__ring--static signals-mark__ring--static-outer" />
        <span className="signals-mark__ring signals-mark__ring--pulse" />
        <span className="signals-mark__ring signals-mark__ring--pulse" />
      </span>
    </a>
  );
}
