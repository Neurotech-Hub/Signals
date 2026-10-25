import { useMemo, useState } from 'react';
import type { InnovationRecord } from '@/types/innovation';
import { domainMeta } from '@/lib/normalize';

interface LandscapeProps {
  records: InnovationRecord[];
  domain: string | null;
  selectedId: string | null;
  hoveredId: string | null;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
  onToggleDomain: (domain: string) => void;
}

const W = 360;
const H = 248;
const PAD = { l: 40, r: 12, t: 14, b: 32 };

interface Point {
  id: string;
  name: string;
  domain: string;
  color: string;
  x: number;
  y: number;
}

/**
 * Scientific utility × commercial potential. Both axes are Scout estimates
 * (0–100), not verified assessments. Clicking a point selects that discovery.
 */
export function Landscape({
  records,
  domain,
  selectedId,
  hoveredId,
  onSelect,
  onHover,
  onToggleDomain,
}: LandscapeProps) {
  const [tip, setTip] = useState<string | null>(null);

  const { points, domains } = useMemo(() => {
    const innerW = W - PAD.l - PAD.r;
    const innerH = H - PAD.t - PAD.b;
    const xOf = (v: number) => PAD.l + (v / 100) * innerW;
    const yOf = (v: number) => PAD.t + (1 - v / 100) * innerH;
    const pts: Point[] = [];
    const seen = new Map<string, { color: string; label: string; count: number }>();
    for (const r of records) {
      const su = r.scientific_utility?.score;
      const cp = r.commercial_potential?.score;
      const meta = domainMeta(r.domain);
      const entry = seen.get(r.domain) ?? { color: meta.color, label: meta.label, count: 0 };
      entry.count += 1;
      seen.set(r.domain, entry);
      if (typeof su !== 'number' || typeof cp !== 'number') continue;
      pts.push({ id: r.innovation_id, name: r.name, domain: r.domain, color: meta.color, x: xOf(su), y: yOf(cp) });
    }
    return { points: pts, domains: [...seen.entries()] };
  }, [records]);

  const active = points.find((p) => p.id === (tip ?? hoveredId ?? selectedId));
  const ticks = [0, 25, 50, 75, 100];
  const innerW = W - PAD.l - PAD.r;
  const innerH = H - PAD.t - PAD.b;

  return (
    <div className="rounded-xl border border-ink-100 p-5">
      <h2 className="text-sm font-semibold text-ink-950">The innovation landscape</h2>
      <p className="mt-0.5 text-[11px] leading-snug text-ink-500">
        Scout estimates. Selecting a point opens that discovery.
      </p>

      <div className="relative mt-3">
        <svg viewBox={`0 0 ${W} ${H}`} className="block w-full" role="img" aria-label="Scientific utility versus commercial potential">
          {ticks.map((t) => {
            const x = PAD.l + (t / 100) * innerW;
            const y = PAD.t + (1 - t / 100) * innerH;
            return (
              <g key={t} className="text-ink-300">
                <line x1={x} y1={PAD.t} x2={x} y2={H - PAD.b} stroke="currentColor" strokeWidth="1" />
                <line x1={PAD.l} y1={y} x2={W - PAD.r} y2={y} stroke="currentColor" strokeWidth="1" />
                <text x={x} y={H - PAD.b + 14} textAnchor="middle" fontSize="9" fill="#6b7286">
                  {t}
                </text>
                <text x={PAD.l - 6} y={y + 3} textAnchor="end" fontSize="9" fill="#6b7286">
                  {t}
                </text>
              </g>
            );
          })}
          <text x={PAD.l + innerW / 2} y={H - 2} textAnchor="middle" fontSize="9" fill="#3b4257">
            Scientific utility
          </text>
          <text
            x={12}
            y={PAD.t + innerH / 2}
            textAnchor="middle"
            fontSize="9"
            fill="#3b4257"
            transform={`rotate(-90 12 ${PAD.t + innerH / 2})`}
          >
            Commercial potential
          </text>

          {points.map((p) => {
            const dim = domain !== null && p.domain !== domain;
            const on = p.id === selectedId || p.id === hoveredId;
            return (
              <g key={p.id}>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={on ? 7 : 4.5}
                  fill={p.color}
                  opacity={dim ? 0.2 : 0.9}
                  stroke={on ? '#0a0f1f' : 'none'}
                  strokeWidth={1.5}
                  pointerEvents="none"
                />
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={11}
                  fill="transparent"
                  className="cursor-pointer"
                  role="button"
                  tabIndex={0}
                  aria-label={p.name}
                  aria-pressed={p.id === selectedId}
                  onMouseEnter={() => {
                    setTip(p.id);
                    onHover(p.id);
                  }}
                  onMouseLeave={() => {
                    setTip(null);
                    onHover(null);
                  }}
                  onClick={() => onSelect(p.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelect(p.id);
                    }
                  }}
                />
              </g>
            );
          })}
        </svg>
      </div>

      <p className="mt-1 min-h-8 text-xs leading-snug text-ink-700">{active ? active.name : 'Hover or select a point.'}</p>

      <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1.5">
        {domains.map(([key, meta]) => {
          const pressed = domain === key;
          return (
            <li key={key}>
              <button
                type="button"
                aria-pressed={pressed}
                onClick={() => onToggleDomain(key)}
                className={`inline-flex items-center gap-1.5 text-[11px] ${pressed ? 'font-semibold text-ink-950' : 'text-ink-500 hover:text-ink-950'}`}
              >
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: meta.color, opacity: pressed || domain === null ? 1 : 0.35 }} />
                {meta.label}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
