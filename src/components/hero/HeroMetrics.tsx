import type { ArchiveMetrics } from '@/lib/data';

interface HeroMetricsProps {
  metrics: ArchiveMetrics;
}

/** Archive counts derived from lead_don_status; all values come from the dataset. */
export function HeroMetrics({ metrics }: HeroMetricsProps) {
  const items = [
    { value: metrics.total, label: 'innovations\nin archive' },
    { value: metrics.byLead.core, label: 'core-led' },
    { value: metrics.byLead.affiliate, label: 'affiliate-led' },
    { value: metrics.byLead.external, label: 'external / joint' },
  ];

  return (
    <dl className="grid grid-cols-2 gap-x-4 gap-y-6 @md:grid-cols-4">
      {items.map((m) => (
        <div key={m.label} className="first:pl-0 @md:border-l @md:border-white/15 @md:pl-3.5 @md:first:border-l-0 @md:first:pl-0">
          <dd className="font-brand text-4xl font-semibold leading-none tabular-nums tracking-tight text-white @md:text-5xl">
            {m.value}
          </dd>
          <dt className="mt-2 whitespace-pre-line text-[13px] leading-tight text-white/60">{m.label}</dt>
        </div>
      ))}
    </dl>
  );
}
