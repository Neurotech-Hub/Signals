import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type MouseEvent } from 'react';
import type { InnovationRecord } from '@/types/innovation';
import { computeLayout, type NodeLayout } from '@/lib/layout';
import { NodePopover } from './NodePopover';

interface ConstellationProps {
  records: InnovationRecord[];
  groupBy?: 'domain' | 'category';
  /** Decorative particles and texture lines. Never data. */
  decor?: boolean;
  className?: string;
}

interface Anchor {
  id: string;
  /** Pixel coordinates relative to the container. */
  x: number;
  top: number;
  bottom: number;
}

/**
 * Interactive cluster map of the archive. One node per record, grouped by
 * domain (default). Hover → title; click/Enter → detail popover.
 *
 * Rendering follows "render light, not objects": each node is a small bright
 * core with soft gradient glow layers; clusters sit in a feathered haze; faint
 * curved lines and particles add texture. Glows are radial gradients, not
 * blur filters, so the scene stays cheap on mobile.
 */
export function Constellation({ records, groupBy = 'domain', decor = true, className = '' }: ConstellationProps) {
  const layout = useMemo(() => computeLayout(records, groupBy), [records, groupBy]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<Anchor | null>(null);
  const [selected, setSelected] = useState<Anchor | null>(null);

  const nodeById = useMemo(() => new Map(layout.nodes.map((n) => [n.id, n])), [layout]);
  const clusterByKey = useMemo(() => new Map(layout.clusters.map((c) => [c.key, c])), [layout]);

  // Drop a selection whose node left the layout (scope change).
  useEffect(() => {
    if (selected && !nodeById.has(selected.id)) setSelected(null);
    if (hover && !nodeById.has(hover.id)) setHover(null);
  }, [nodeById, selected, hover]);

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

  const { width, height, clusters, nodes, links, particles, dust } = layout;
  const hoverNode = hover ? nodeById.get(hover.id) : undefined;
  const selectedNode = selected ? nodeById.get(selected.id) : undefined;
  const hotId = hover?.id ?? selected?.id ?? null;

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
          {clusters.map((c) => {
            const tint = mix(c.color, '#ffffff', 0.55);
            return (
              <g key={c.key}>
                {/* Cluster haze: a large feathered region of colored light. */}
                <radialGradient id={`c-haze-${c.key}`}>
                  <stop offset="0%" stopColor={c.color} stopOpacity="0.2" />
                  <stop offset="45%" stopColor={c.color} stopOpacity="0.085" />
                  <stop offset="100%" stopColor={c.color} stopOpacity="0" />
                </radialGradient>
                {/* Outer bloom: diffuse, fades fully to transparent. */}
                <radialGradient id={`c-bloom-${c.key}`}>
                  <stop offset="0%" stopColor={c.color} stopOpacity="0.52" />
                  <stop offset="38%" stopColor={c.color} stopOpacity="0.17" />
                  <stop offset="100%" stopColor={c.color} stopOpacity="0" />
                </radialGradient>
                {/* Inner halo: saturated glow hugging the core. */}
                <radialGradient id={`c-halo-${c.key}`}>
                  <stop offset="0%" stopColor={tint} stopOpacity="0.75" />
                  <stop offset="35%" stopColor={c.color} stopOpacity="0.55" />
                  <stop offset="100%" stopColor={c.color} stopOpacity="0" />
                </radialGradient>
                {/* Core: nearly white center, tinted toward the edge. */}
                <radialGradient id={`c-core-${c.key}`}>
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="55%" stopColor={tint} />
                  <stop offset="100%" stopColor={c.color} />
                </radialGradient>
              </g>
            );
          })}
        </defs>

        {/* Atmospheric haze behind each cluster (additive). */}
        <g className="constellation-decor" pointerEvents="none" aria-hidden="true" style={{ mixBlendMode: 'screen' }}>
          {clusters.map((c, i) => (
            <ellipse
              key={c.key}
              className="constellation-haze"
              cx={c.centroidX}
              cy={c.centroidY}
              rx={c.hazeRx}
              ry={c.hazeRy}
              transform={`rotate(${c.hazeRotate.toFixed(1)} ${c.centroidX.toFixed(1)} ${c.centroidY.toFixed(1)})`}
              fill={`url(#c-haze-${c.key})`}
              style={{ '--delay': `${-i * 4.3}s` } as CSSProperties}
            />
          ))}
        </g>

        {/* Background stars and cluster particles (decorative, not data). */}
        {decor && (
          <g className="constellation-dust constellation-decor" pointerEvents="none" aria-hidden="true">
            {dust.map((p, i) => (
              <circle
                key={`d${i}`}
                className={p.twinkle ? 'constellation-twinkle' : undefined}
                cx={p.x}
                cy={p.y}
                r={p.r}
                fill={p.color}
                opacity={p.o}
                style={p.twinkle ? ({ '--dur': `${p.twinkle.dur}s`, '--delay': `${p.twinkle.delay}s`, '--o': p.o } as CSSProperties) : undefined}
              />
            ))}
            {particles.map((p, i) => (
              <circle
                key={`p${i}`}
                className={p.twinkle ? 'constellation-twinkle' : undefined}
                cx={p.x}
                cy={p.y}
                r={p.r}
                fill={p.color}
                opacity={p.o}
                style={p.twinkle ? ({ '--dur': `${p.twinkle.dur}s`, '--delay': `${p.twinkle.delay}s`, '--o': p.o } as CSSProperties) : undefined}
              />
            ))}
          </g>
        )}

        {/* Texture lines inside each cluster. Not relationships. */}
        {decor && (
          <g className="constellation-decor" pointerEvents="none" aria-hidden="true" fill="none" strokeLinecap="round">
            {links.map((l) => {
              const hot = hotId !== null && (l.a === hotId || l.b === hotId);
              return (
                <path
                  key={`${l.a}|${l.b}`}
                  className="constellation-link"
                  data-hot={hot ? 'true' : undefined}
                  d={l.d}
                  stroke={clusterByKey.get(l.group)!.color}
                />
              );
            })}
          </g>
        )}

        {/* Nodes */}
        <g>
          {nodes.map((n) => {
            const cluster = clusterByKey.get(n.group)!;
            const driftStyle = {
              '--dx': `${n.dx}px`,
              '--dy': `${n.dy}px`,
              '--dur': `${n.dur}s`,
              '--delay': `${n.delay}s`,
            } as CSSProperties;
            const pulseStyle = { '--pdur': `${n.pulseDur}s`, '--pdelay': `${n.pulseDelay}s` } as CSSProperties;
            const active = selected?.id === n.id;
            const major = n.r >= 5.5;
            return (
              <g key={n.id} transform={`translate(${n.x} ${n.y})`}>
                <g className="constellation-node__drift" style={driftStyle}>
                  <g
                    className="signal-node"
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
                    <circle r={Math.max(n.r * 3.2, 14)} fill="transparent" />
                    {/* Emitted light, outside in. */}
                    <g style={{ mixBlendMode: 'screen' }}>
                      <circle className="signal-bloom" r={n.r * 6.5} fill={`url(#c-bloom-${n.group})`} style={pulseStyle} />
                      <circle className="signal-halo" r={n.r * 2.7} fill={`url(#c-halo-${n.group})`} />
                      {major && (
                        <g className="signal-burst" stroke="#ffffff" strokeWidth={0.6} strokeLinecap="round">
                          <line x1={-n.r * 4.2} x2={n.r * 4.2} y1={0} y2={0} />
                          <line x1={0} x2={0} y1={-n.r * 4.2} y2={n.r * 4.2} />
                        </g>
                      )}
                    </g>
                    <circle className="signal-core" r={n.r} fill={`url(#c-core-${n.group})`} />
                    <circle className="signal-focus" r={n.r + 5} fill="none" stroke="#fff" strokeWidth={1.2} opacity={0} />
                  </g>
                </g>
              </g>
            );
          })}
        </g>

        {/* Cluster labels */}
        <g pointerEvents="none" aria-hidden="true" className="font-mono">
          {clusters.map((c) => (
            <text key={c.key} x={c.labelX} y={c.labelY} textAnchor={c.labelAnchor} fill={c.color}>
              {c.lines.map((line, i) => (
                <tspan
                  key={i}
                  x={c.labelX}
                  dy={i === 0 ? 0 : 13}
                  fontSize={10.5}
                  fontWeight={500}
                  letterSpacing="0.08em"
                  style={{ textTransform: 'uppercase' }}
                >
                  {line.toUpperCase()}
                </tspan>
              ))}
              <tspan className="constellation-count" x={c.labelX} dy={15} fontSize={10} fontWeight={500} letterSpacing="0.04em" fill="rgba(255,255,255,0.62)">
                {c.count} {c.count === 1 ? 'innovation' : 'innovations'}
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
          color={clusterByKey.get(selectedNode.group)!.color}
          groupLabel={clusterByKey.get(selectedNode.group)!.label}
          anchor={selected}
          container={containerRef.current!}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}

/** Linear mix of two hex colors; `t` = 0 keeps `a`, 1 gives `b`. */
function mix(a: string, b: string, t: number): string {
  const pa = hex(a);
  const pb = hex(b);
  const ch = (i: number) => Math.round(pa[i] + (pb[i] - pa[i]) * t);
  return `rgb(${ch(0)} ${ch(1)} ${ch(2)})`;
}

function hex(c: string): [number, number, number] {
  const s = c.replace('#', '');
  const full = s.length === 3 ? s.split('').map((x) => x + x).join('') : s;
  const n = parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
