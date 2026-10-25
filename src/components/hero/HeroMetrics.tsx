import type { ArchiveMetrics } from '@/lib/data';

interface HeroMetricsProps {
  metrics: ArchiveMetrics;
}

/**
 * Headline counts for the current lens. All three are computed from the
 * filtered records (see lib/data.ts) — nothing here is hardcoded, and the
 * wording stays with what the Scout surfaced rather than institutional totals.
 */
export function HeroMetrics({ metrics }: HeroMetricsProps) {
  const items = [
    { value: metrics.surfaced, label: 'signals\nsurfaced' },
    { value: metrics.researchers, label: 'researchers\nrepresented' },
    { value: metrics.sources, label: 'public\nsources' },
  ];

  return (
    <dl className="grid grid-cols-3 gap-x-3 @min-[22rem]:gap-x-4">
      {items.map((m) => (
        <div key={m.label} className="border-l border-white/15 pl-3 first:border-l-0 first:pl-0 @min-[22rem]:pl-4">
          <dd className="metric-value text-[2rem] leading-none text-white @min-[22rem]:text-4xl @min-[28rem]:text-5xl">
            {m.value}
          </dd>
          <dt className="mt-2 whitespace-pre-line text-[12px] leading-tight text-white/60 @min-[22rem]:text-[13px]">{m.label}</dt>
        </div>
      ))}
    </dl>
  );
}
