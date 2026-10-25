import { useMemo } from 'react';
import { Segmented } from '@/components/controls/Segmented';
import { useScope } from '@/lib/scopeContext';
import { domainMeta } from '@/lib/normalize';
import { monthLabel, publicationDate } from '@/lib/publication';
import { periodLabel, positionInRange, WINDOWS, type WindowId } from '@/lib/scope';

/**
 * The observation window, made visible.
 *
 * A full-width band between the hero and the archive. A thin rail spans the
 * dated extent of the current department scope; the selected window is the
 * dark segment, and every record is a tick at its public date (colored when it
 * is in the window, muted when it is outside). Partial dates sit at the middle
 * of their month or year. Undated records have no tick.
 */
export function PeriodRail() {
  const { scope, setWindow, range, extent, byDepartment, records, undated } = useScope();

  const inWindowIds = useMemo(() => new Set(records.map((r) => r.innovation_id)), [records]);

  const ticks = useMemo(() => {
    const out: Array<{ id: string; x: number; color: string; on: boolean }> = [];
    for (const r of byDepartment) {
      const d = publicationDate(r);
      if (!d) continue;
      const mid = midpoint(d.start, d.end, extent);
      out.push({ id: r.innovation_id, x: mid, color: domainMeta(r.domain).color, on: inWindowIds.has(r.innovation_id) });
    }
    return out;
  }, [byDepartment, extent, inWindowIds]);

  const selStart = positionInRange(range.start, extent) * 100;
  const selEnd = positionInRange(range.end, extent) * 100;
  const hiddenUndated = scope.window !== 'all' ? undated.length : 0;

  const options = WINDOWS.map((w) => ({ value: w.id, label: w.label, short: w.short, title: w.label }));

  return (
    <section aria-label="Observation window" className="period-rail border-b border-ink-100 bg-white">
      <div className="mx-auto max-w-7xl px-6 py-6 lg:px-10">
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
          <p className="data-label text-ink-500">
            Public research · <span className="text-ink-950">{periodLabel(range)}</span>
          </p>
          <Segmented<WindowId>
            aria-label="Observation window"
            options={options}
            value={scope.window}
            onChange={setWindow}
            tone="dark"
            size="sm"
          />
        </div>

        <div className="relative mt-4 h-8" aria-hidden="true">
          {/* Full indexed extent */}
          <div className="absolute inset-x-0 top-[13px] h-px bg-ink-300/70" />
          {/* Selected window */}
          <div
            className="absolute top-[12px] h-[3px] rounded-full bg-ink-950/80"
            style={{ left: `${selStart}%`, width: `${Math.max(0.6, selEnd - selStart)}%` }}
          />
          {/* One tick per dated record */}
          {ticks.map((t) => (
            <span
              key={t.id}
              className="absolute top-[6px] w-px -translate-x-1/2"
              style={{
                left: `${t.x * 100}%`,
                height: 15,
                backgroundColor: t.on ? t.color : 'var(--color-ink-300)',
              }}
            />
          ))}
          {/* Extent labels */}
          <span className="data-label absolute left-0 top-[24px] text-[10px] leading-none text-ink-500">{monthLabel(extent.start)}</span>
          <span className="data-label absolute right-0 top-[24px] text-[10px] leading-none text-ink-500">{monthLabel(extent.end)}</span>
        </div>

        {hiddenUndated > 0 && (
          <p className="mt-2 text-[11px] leading-snug text-ink-500">
            {hiddenUndated} undated {hiddenUndated === 1 ? 'record appears' : 'records appear'} only under All indexed dates.
          </p>
        )}
      </div>
    </section>
  );
}

function midpoint(start: string, end: string, extent: { start: string; end: string }): number {
  const a = positionInRange(start, extent);
  const b = positionInRange(end, extent);
  return (a + b) / 2;
}
