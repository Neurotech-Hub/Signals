import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type MouseEvent } from 'react';
import type { InnovationRecord } from '@/types/innovation';
import { computeLayout, type NodeLayout } from '@/lib/layout';
import { leadBucket } from '@/lib/normalize';
import { NodePopover } from './NodePopover';

interface ConstellationProps {
  records: InnovationRecord[];
  groupBy?: 'domain' | 'category';
  /** Decorative background specks. Not data. */
  dust?: boolean;
  className?: string;
}

interface Anchor {
  id: string;
  /** Pixel coordinates relative to the container. */
  x: number;
  top: number;
  bottom: number;
}

const LEAD_OPACITY = { core: 1, affiliate: 0.9, external: 0.62 } as const;

/**
 * Interactive cluster map of the archive. One node per record, grouped by
 * domain (default). Hover → title; click/Enter → detail popover.
 */
export function Constellation({ records, groupBy = 'domain', dust = true, className = '' }: ConstellationProps) {
  const layout = useMemo(() => computeLayout(records, groupBy), [records, groupBy]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<Anchor | null>(null);
  const [selected, setSelected] = useState<Anchor | null>(null);

  const nodeById = useMemo(() => new Map(layout.nodes.map((n) => [n.id, n])), [layout]);

  const anchorFor = useCallback((el: Element, id: string): Anchor => {
    const c = containerRef.current!.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    return { id, x: r.left + r.width / 2 - c.left, top: r.top - c.top, bottom: r.bottom - c.top };
  }, []);

  const onEnter = (e: MouseEvent<SVGGElement>, n: NodeLayout) => setHover(anchorFor(e.currentTarget, n.id));
  const onLeave = () => setHover(null);
  const onSelect = (el: Element, n: NodeLayout) => {
    setSelected((prev) => (prev?.id === n.id ? null : anchorFor(el, n.id)));
    setHover(null);
  };
  const onKey = (e: KeyboardEvent<SVGGElement>, n: NodeLayout) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(e.currentTarget, n);
    }
  };

  useEffect(() => {
    if (!selected) return;
    const onKeyDown = (e: globalThis.KeyboardEvent) => e.key === 'Escape' && setSelected(null);
    const onResize = () => setSelected(null);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('resize', onResize);
    };
  }, [selected]);

  const { width, height, clusters, nodes } = layout;
  const hoverNode = hover ? nodeById.get(hover.id) : undefined;
  const selectedNode = selected ? nodeById.get(selected.id) : undefined;

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="block h-auto w-full min-w-0 max-w-full select-none"
        role="img"
        aria-label={`Innovation archive: ${records.length} records across ${clusters.length} domains`}
        onClick={(e) => {
          if (e.target === e.currentTarget) setSelected(null);
        }}
      >
        <defs>
          <filter id="c-glow" x="-120%" y="-120%" width="340%" height="340%">
            <feGaussianBlur stdDeviation="4.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="c-soft" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="18" />
          </filter>
          {clusters.map((c) => (
            <g key={c.key}>
              <radialGradient id={`c-ambient-${c.key}`}>
                <stop offset="0%" stopColor={c.color} stopOpacity="0.42" />
                <stop offset="45%" stopColor={c.color} stopOpacity="0.14" />
                <stop offset="100%" stopColor={c.color} stopOpacity="0" />
              </radialGradient>
              <radialGradient id={`c-node-${c.key}`} cx="38%" cy="35%" r="70%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
                <stop offset="38%" stopColor={c.color} />
                <stop offset="100%" stopColor={c.color} stopOpacity="0.85" />
              </radialGradient>
            </g>
          ))}
        </defs>

        {/* Decorative specks (not data) */}
        {dust && (
          <g className="constellation-dust" pointerEvents="none" aria-hidden="true">
            {layout.dust.map((d, i) => (
              <circle key={i} cx={d.x} cy={d.y} r={d.r} fill="#fff" opacity={d.o} />
            ))}
          </g>
        )}

        {/* Ambient glow per cluster */}
        <g pointerEvents="none" aria-hidden="true">
          {clusters.map((c) => (
            <circle
              key={c.key}
              cx={c.centroidX}
              cy={c.centroidY}
              r={c.extent * 1.6 + 40}
              fill={`url(#c-ambient-${c.key})`}
              filter="url(#c-soft)"
            />
          ))}
        </g>

        {/* Nodes */}
        <g>
          {nodes.map((n) => {
            const cluster = clusters.find((c) => c.key === n.group)!;
            const lead = leadBucket(n.record.lead_don_status);
            const driftStyle = {
              '--dx': `${n.dx}px`,
              '--dy': `${n.dy}px`,
              '--dur': `${n.dur}s`,
              '--delay': `${n.delay}s`,
            } as CSSProperties;
            const active = selected?.id === n.id;
            return (
              <g key={n.id} transform={`translate(${n.x} ${n.y})`}>
                <g className="constellation-node__drift" style={driftStyle}>
                  <g
                    className="constellation-node"
                    data-active={active ? 'true' : undefined}
                    role="button"
                    tabIndex={0}
                    aria-label={`${n.record.name} — ${cluster.label}`}
                    aria-expanded={active}
                    onMouseEnter={(e) => onEnter(e, n)}
                    onMouseLeave={onLeave}
                    onFocus={(e) => setHover(anchorFor(e.currentTarget, n.id))}
                    onBlur={onLeave}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelect(e.currentTarget, n);
                    }}
                    onKeyDown={(e) => onKey(e, n)}
                  >
                    {/* Generous hit area */}
                    <circle r={Math.max(n.r * 2.2, 14)} fill="transparent" />
                    <circle className="constellation-node__halo" r={n.r * 2.6} fill={cluster.color} opacity={0.2} />
                    <g className="constellation-node__body">
                      <circle
                        r={n.r}
                        fill={`url(#c-node-${n.group})`}
                        opacity={LEAD_OPACITY[lead]}
                        filter="url(#c-glow)"
                        stroke={lead === 'external' ? cluster.color : 'none'}
                        strokeOpacity={0.9}
                        strokeWidth={1}
                      />
                    </g>
                    <circle className="constellation-node__focus" r={n.r + 5} fill="none" stroke="#fff" strokeWidth={1.5} opacity={0} />
                  </g>
                </g>
              </g>
            );
          })}
        </g>

        {/* Cluster labels */}
        <g pointerEvents="none" aria-hidden="true" className="font-sans">
          {clusters.map((c) => (
            <text key={c.key} x={c.labelX} y={c.labelY} textAnchor={c.labelAnchor} fill={c.color}>
              {c.lines.map((line, i) => (
                <tspan
                  key={i}
                  x={c.labelX}
                  dy={i === 0 ? 0 : 13}
                  fontSize={10.5}
                  fontWeight={600}
                  letterSpacing="0.14em"
                  style={{ textTransform: 'uppercase' }}
                >
                  {line.toUpperCase()}
                </tspan>
              ))}
              <tspan className="constellation-count" x={c.labelX} dy={15} fontSize={11} fontWeight={400} fill="rgba(255,255,255,0.62)">
                {c.count} {c.count === 1 ? 'discovery' : 'discoveries'}
              </tspan>
            </text>
          ))}
        </g>
      </svg>

      {/* Hover title */}
      {hoverNode && hover && !selected && (
        <div
          role="tooltip"
          className="pointer-events-none absolute z-10 max-w-[260px] -translate-x-1/2 -translate-y-full rounded-lg border border-white/10 bg-navy-900/95 px-3 py-2 text-xs leading-snug text-white shadow-xl backdrop-blur"
          style={{ left: hover.x, top: hover.top - 10 }}
        >
          {hoverNode.record.name}
        </div>
      )}

      {/* Detail popover */}
      {selectedNode && selected && (
        <NodePopover
          record={selectedNode.record}
          color={clusters.find((c) => c.key === selectedNode.group)!.color}
          groupLabel={clusters.find((c) => c.key === selectedNode.group)!.label}
          anchor={selected}
          container={containerRef.current!}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
