import { useMemo, useState } from 'react';
import type { InnovationRecord } from '@/types/innovation';
import { domainMeta } from '@/lib/normalize';
import { leadDepartmentId } from '@/lib/scope';

interface LandscapeProps {
  records: InnovationRecord[];
  domain: string | null;
  department: string | null;
  selectedId: string | null;
  hoveredId: string | null;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
}

const W = 360;
const H = 248;
const PAD = { l: 40, r: 12, t: 14, b: 32 };

interface Point {
  id: string;
  name: string;
  domain: string;
  department: string | null;
  color: string;
  x: number;
  y: number;
}

interface Axis {
  min: number;
  max: number;
  ticks: number[];
}

/**
 * Fit an axis to the data rather than the full 0–100 scale, so the points are
 * not bunched in one corner. The axis still uses round steps and stays inside
 * 0–100 (the scores' real range). Falls back to 0–100 when there is no data.
 */
function fitAxis(values: number[]): Axis {
  if (values.length === 0) return { min: 0, max: 100, ticks: [0, 25, 50, 75, 100] };
  let lo = Math.min(...values);
  let hi = Math.max(...values);
  const span = Math.max(hi - lo, 10);
  const padding = span * 0.15;
  lo = Math.max(0, lo - padding);
  hi = Math.min(100, hi + padding);
  const step = niceStep((hi - lo) / 4);
  const min = Math.max(0, Math.floor(lo / step) * step);
  const max = Math.min(100, Math.ceil(hi / step) * step);
  const ticks: number[] = [];
  for (let t = min; t <= max + 1e-9; t += step) ticks.push(Math.round(t));
  return { min, max: max > min ? max : min + step, ticks };
}

function niceStep(raw: number): number {
  const candidates = [1, 2, 5, 10, 20, 25, 50];
  for (const c of candidates) if (c >= raw) return c;
  return 50;
}

/**
 * Scientific utility × commercial potential. Both axes are Scout estimates
 * (0–100), not verified assessments. The axes refit to whatever is on the page,
 * so changing scope or window re-centres the cloud. Clicking a point selects it.
 */
export function Landscape({
  records,
  domain,
  department,
  selectedId,
  hoveredId,
  onSelect,
  onHover,
}: LandscapeProps) {
  const [tip, setTip] = useState<string | null>(null);

  const { points, xAxis, yAxis } = useMemo(() => {
    const innerW = W - PAD.l - PAD.r;
    const innerH = H - PAD.t - PAD.b;
    const scored: Array<{ r: InnovationRecord; su: number; cp: number }> = [];
    for (const r of records) {
      const su = r.scientific_utility?.score;
      const cp = r.commercial_potential?.score;
      if (typeof su === 'number' && typeof cp === 'number') scored.push({ r, su, cp });
    }
    const xAxis = fitAxis(scored.map((s) => s.su));
    const yAxis = fitAxis(scored.map((s) => s.cp));
    const xOf = (v: number) => PAD.l + ((v - xAxis.min) / (xAxis.max - xAxis.min)) * innerW;
    const yOf = (v: number) => PAD.t + (1 - (v - yAxis.min) / (yAxis.max - yAxis.min)) * innerH;
    const pts: Point[] = scored.map(({ r, su, cp }) => ({
      id: r.innovation_id,
      name: r.name,
      domain: r.domain,
      department: leadDepartmentId(r),
      color: domainMeta(r.domain).color,
      x: xOf(su),
      y: yOf(cp),
    }));
    return { points: pts, xAxis, yAxis };
  }, [records]);

  const active = points.find((p) => p.id === (tip ?? hoveredId ?? selectedId));
  const innerW = W - PAD.l - PAD.r;
  const innerH = H - PAD.t - PAD.b;
  const xPos = (v: number) => PAD.l + ((v - xAxis.min) / (xAxis.max - xAxis.min)) * innerW;
  const yPos = (v: number) => PAD.t + (1 - (v - yAxis.min) / (yAxis.max - yAxis.min)) * innerH;

  return (
    <div className="min-w-0 rounded-xl border border-ink-100 p-5">
      <h3 className="text-sm font-semibold text-ink-950">The innovation landscape</h3>
      <p className="mt-0.5 text-[11px] leading-snug text-ink-500">Scout estimates on a 0–100 scale.</p>

      {points.length === 0 ? (
        <p className="mt-4 rounded-lg border border-dashed border-ink-300 px-4 py-8 text-center text-xs text-ink-500">
          No scored innovations in this scope and period.
        </p>
      ) : (
        <div className="relative mt-3">
          <svg viewBox={`0 0 ${W} ${H}`} className="chart-label block h-auto w-full min-w-0 max-w-full" role="img" aria-label="Scientific utility versus commercial potential">
            {xAxis.ticks.map((t) => {
              const x = xPos(t);
              return (
                <g key={`x${t}`} className="text-ink-300">
                  <line x1={x} y1={PAD.t} x2={x} y2={H - PAD.b} stroke="currentColor" strokeWidth="1" />
                  <text x={x} y={H - PAD.b + 14} textAnchor="middle" fontSize="9" fill="#6b7286">
                    {t}
                  </text>
                </g>
              );
            })}
            {yAxis.ticks.map((t) => {
              const y = yPos(t);
              return (
                <g key={`y${t}`} className="text-ink-300">
                  <line x1={PAD.l} y1={y} x2={W - PAD.r} y2={y} stroke="currentColor" strokeWidth="1" />
                  <text x={PAD.l - 6} y={y + 3} textAnchor="end" fontSize="9" fill="#6b7286">
                    {t}
                  </text>
                </g>
              );
            })}
            <text x={PAD.l + innerW / 2} y={H - 2} textAnchor="middle" fontSize="8" fill="#3b4257" style={{ textTransform: 'uppercase' }}>
              Scientific utility
            </text>
            <text
              x={12}
              y={PAD.t + innerH / 2}
              textAnchor="middle"
              fontSize="8"
              fill="#3b4257"
              style={{ textTransform: 'uppercase' }}
              transform={`rotate(-90 12 ${PAD.t + innerH / 2})`}
            >
              Commercial potential
            </text>

            {points.map((p) => {
              const dim =
                (domain !== null && p.domain !== domain) ||
                (department !== null && p.department !== department);
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
      )}

      <p className={`mt-1 flex min-h-8 items-start gap-1.5 text-xs leading-snug text-ink-700 ${active ? '' : 'screen-only'}`}>
        {active ? (
          <>
            <span aria-hidden="true" className="mt-[3px] h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: active.color }} />
            <span>{active.name}</span>
          </>
        ) : points.length ? (
          'Hover or select a point.'
        ) : null}
      </p>
    </div>
  );
}
