import type { InnovationRecord } from '@/types/innovation';
import { countBy } from '@/lib/data';
import { domainMeta } from '@/lib/normalize';
import { Landscape } from './Landscape';

interface SidebarProps {
  records: InnovationRecord[];
  domain: string | null;
  selectedId: string | null;
  hoveredId: string | null;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
  onToggleDomain: (domain: string) => void;
}

export function Sidebar(props: SidebarProps) {
  const { records, domain, onToggleDomain } = props;
  const byDomain = [...countBy(records, (r) => r.domain).entries()].sort((a, b) => b[1] - a[1]);
  const max = Math.max(...byDomain.map(([, n]) => n), 1);

  return (
    <aside className="min-w-0 space-y-6 lg:sticky lg:top-6">
      <Landscape {...props} />

      <div className="rounded-xl border border-ink-100 p-5">
        <h2 className="text-sm font-semibold text-ink-950">Archive by domain</h2>
        <p className="screen-only mt-0.5 text-[11px] text-ink-500">Filter the innovations.</p>
        {byDomain.length === 0 && <p className="mt-3 text-xs text-ink-500">Nothing indexed in this scope and period.</p>}
        <ul className="mt-3 space-y-1">
          {byDomain.map(([key, count], i) => {
            const meta = domainMeta(key, i);
            const pressed = domain === key;
            return (
              <li key={key}>
                <button
                  type="button"
                  aria-pressed={pressed}
                  onClick={() => onToggleDomain(key)}
                  className={`w-full rounded-lg px-2 py-1.5 text-left text-xs ${pressed ? 'bg-ink-100' : 'hover:bg-ink-100/60'}`}
                >
                  <span className="flex items-center justify-between text-ink-700">
                    <span className={pressed ? 'font-semibold text-ink-950' : undefined}>{meta.label}</span>
                    <span className="font-mono text-[11px] font-medium tabular-nums tracking-normal text-ink-500">{count}</span>
                  </span>
                  <span className="mt-1 block h-1.5 overflow-hidden rounded-full bg-ink-100">
                    <span
                      className="block h-full rounded-full"
                      style={{ width: `${(count / max) * 100}%`, backgroundColor: meta.color, opacity: pressed || domain === null ? 1 : 0.35 }}
                    />
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}
