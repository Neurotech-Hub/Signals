export interface SegmentedOption<T extends string | null> {
  value: T;
  label: string;
  /** Shown below the `sm` breakpoint when provided. */
  short?: string;
  title?: string;
}

interface SegmentedProps<T extends string | null> {
  options: ReadonlyArray<SegmentedOption<T>>;
  value: T;
  onChange: (value: T) => void;
  'aria-label': string;
  /** `light` sits on the navy hero; `dark` on white. */
  tone?: 'light' | 'dark';
  size?: 'sm' | 'md';
  className?: string;
}

/**
 * Minimal segmented control. Rendered as a radiogroup of buttons so arrow keys
 * are not required; each option is a plain focusable button with aria-pressed.
 */
export function Segmented<T extends string | null>({
  options,
  value,
  onChange,
  'aria-label': ariaLabel,
  tone = 'light',
  size = 'md',
  className = '',
}: SegmentedProps<T>) {
  const shell =
    tone === 'light'
      ? 'border-white/15 bg-white/[0.06] text-white/60'
      : 'border-ink-100 bg-white text-ink-500';
  const active = tone === 'light' ? 'bg-white/[0.14] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)]' : 'bg-ink-100 text-ink-950';
  const idle = tone === 'light' ? 'hover:text-white/90' : 'hover:text-ink-950';
  const pad = size === 'sm' ? 'px-2.5 py-1 text-[11px]' : 'px-3 py-1.5 text-xs';

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={`inline-flex max-w-full items-center gap-0.5 rounded-full border p-0.5 ${shell} ${className}`}
    >
      {options.map((opt) => {
        const pressed = opt.value === value;
        return (
          <button
            key={String(opt.value)}
            type="button"
            aria-pressed={pressed}
            title={opt.title}
            onClick={() => onChange(opt.value)}
            className={`rounded-full font-medium leading-none whitespace-nowrap transition-colors ${pad} ${pressed ? active : idle}`}
          >
            {opt.short ? (
              <>
                <span className="sm:hidden">{opt.short}</span>
                <span className="hidden sm:inline">{opt.label}</span>
              </>
            ) : (
              opt.label
            )}
          </button>
        );
      })}
    </div>
  );
}
