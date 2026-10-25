import { Logo } from '@/components/brand/Logo';
import { Segmented } from '@/components/controls/Segmented';
import { formatDate } from '@/lib/data';
import { ALL_DEPARTMENTS, DEPARTMENTS } from '@/lib/scope';
import { useScope } from '@/lib/scopeContext';
import { Constellation } from './Constellation';
import { HeroMetrics } from './HeroMetrics';

const DEPT_OPTIONS = [
  { value: ALL_DEPARTMENTS.id, label: ALL_DEPARTMENTS.label, short: ALL_DEPARTMENTS.short },
  ...DEPARTMENTS.map((d) => ({ value: d.id as string | null, label: d.label, short: d.short })),
];

export function Hero() {
  const { scope, setDepartment, records, metrics, lastScanned } = useScope();

  return (
    <section
      id="top"
      className="hero relative z-30 bg-navy-950 text-white"
      aria-labelledby="hero-title"
    >
      <div aria-hidden="true" className="hero-atmosphere pointer-events-none absolute inset-0 -z-10" />

      {/* Header: wordmark left, department scope right. */}
      <header className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-6 pt-7 lg:px-10 lg:pt-8">
        <Logo size="lg" tone="light" />
        <Segmented<string | null>
          aria-label="Department scope"
          options={DEPT_OPTIONS}
          value={scope.dept}
          onChange={setDepartment}
          tone="light"
          size="sm"
        />
      </header>

      <div className="hero-layout mx-auto grid max-w-7xl grid-cols-1 items-start gap-10 px-6 pb-16 pt-10 lg:min-h-[560px] lg:grid-cols-12 lg:items-center lg:gap-6 lg:px-10 lg:pb-14 lg:pt-8">
        <div className="hero-copy min-w-0 lg:col-span-5">
          <h1
            id="hero-title"
            className="hero-title text-white"
          >
            <span className="hero-title__line">Exploring <strong>neuroscience</strong></span>
            <span className="hero-title__line">innovation in St.&nbsp;Louis</span>
          </h1>
          <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-white/65">
            AI-driven research scouting, featuring publicly disclosed work involving Washington
            University scientists.
          </p>

          <div className="@container mt-9 border-t border-white/15 pt-7">
            <HeroMetrics metrics={metrics} />
            <p className="data-label mt-4 text-white/40">
              Last scanned {formatDate(lastScanned)}
            </p>
          </div>
        </div>

        <div className="min-w-0 lg:col-span-7">
          {records.length > 0 ? (
            <>
              <Constellation records={records} groupBy="domain" className="mx-auto w-full min-w-0 max-w-[820px]" />
              <p className="mt-2 text-center text-[11px] text-white/40 lg:text-right">
                One point per innovation, grouped by research domain. Larger points cite more public sources.
              </p>
            </>
          ) : (
            <div className="mx-auto flex min-h-[320px] max-w-[820px] items-center justify-center rounded-2xl border border-white/10 text-center">
              <p className="max-w-xs text-sm leading-relaxed text-white/55">
                No indexed innovations match this scope and period. Widen the window to see more of the archive.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
