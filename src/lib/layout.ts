/**
 * Deterministic cluster layout for the hero constellation.
 *
 * Every node is a real record. Clusters are real groups (domain by default).
 * Node core radius encodes the number of public source-evidence links (1–4+).
 *
 * Lines and particles are texture, not data: lines join a node to its nearest
 * neighbours inside the same domain cluster (a grouping the dataset really
 * has) and never cross clusters, so they cannot read as collaborations. The
 * dataset contains no relationships and none are drawn.
 */

import { forceSimulation, forceX, forceY, forceCollide, forceManyBody } from 'd3-force';
import type { InnovationRecord } from '@/types/innovation';
import { groupKeyFor, groupMetaFor, type GroupMeta } from './normalize';

export interface ClusterLayout extends GroupMeta {
  count: number;
  /** Target center used by the force. */
  cx: number;
  cy: number;
  /** Post-simulation centroid and extent, used for labels and ambient haze. */
  centroidX: number;
  centroidY: number;
  extent: number;
  /** Haze ellipse radii — slightly irregular so clusters do not look stamped. */
  hazeRx: number;
  hazeRy: number;
  hazeRotate: number;
  label: string;
  labelX: number;
  labelY: number;
  labelAnchor: 'start' | 'middle' | 'end';
}

export interface NodeLayout {
  id: string;
  record: InnovationRecord;
  group: string;
  /** Core radius. Glow layers are multiples of this. */
  r: number;
  x: number;
  y: number;
  /** Drift parameters for the gentle CSS motion (1–3px). */
  dx: number;
  dy: number;
  dur: number;
  delay: number;
  /** Pulse timing so nodes breathe out of phase. */
  pulseDur: number;
  pulseDelay: number;
}

export interface LinkLayout {
  a: string;
  b: string;
  group: string;
  /** Quadratic bezier path in SVG coordinates. */
  d: string;
}

export interface Particle {
  x: number;
  y: number;
  r: number;
  o: number;
  color: string;
  /** Twinkle timing; null means static. */
  twinkle: { dur: number; delay: number } | null;
}

export interface ConstellationLayout {
  width: number;
  height: number;
  clusters: ClusterLayout[];
  nodes: NodeLayout[];
  links: LinkLayout[];
  /** Colored particles around clusters. Decorative. */
  particles: Particle[];
  /** Faint white background stars. Decorative. */
  dust: Particle[];
}

interface SimNode {
  id: string;
  group: string;
  r: number;
  x: number;
  y: number;
  vx?: number;
  vy?: number;
}

/** Small seeded PRNG so the layout is identical on every load. */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Core radius, 3–8px: a bright point, not a ball. */
export function nodeRadius(record: InnovationRecord): number {
  const evidence = Math.max(1, record.source_evidence?.length ?? 1);
  return Math.min(3 + (evidence - 1) * 1.75, 8);
}

const LABEL_LINE_H = 15;
const LABEL_COUNT_H = 17;

export function computeLayout(
  records: InnovationRecord[],
  groupBy: 'domain' | 'category' = 'domain',
  width = 900,
  height = 560,
): ConstellationLayout {
  const rand = mulberry32(1337);

  // Group records, largest group first.
  const groups = new Map<string, InnovationRecord[]>();
  for (const r of records) {
    const k = groupKeyFor(r, groupBy);
    groups.set(k, [...(groups.get(k) ?? []), r]);
  }
  const ordered = [...groups.entries()].sort((a, b) => b[1].length - a[1].length);

  // Place cluster centers on an ellipse; the largest cluster sits on the left
  // so it reads as the visual anchor next to the hero copy.
  const n = ordered.length;
  const cxMid = width / 2;
  const cyMid = height / 2;
  const rx = width * 0.3;
  const ry = height * 0.28;
  const startAngle = Math.PI;

  const clusters: ClusterLayout[] = ordered.map(([key, list], i) => {
    const meta = groupMetaFor(key, groupBy, i);
    const angle = n === 1 ? 0 : startAngle + (i * 2 * Math.PI) / Math.max(n, 1);
    const cx = n === 1 ? cxMid : cxMid + rx * Math.cos(angle);
    const cy = n === 1 ? cyMid : cyMid + ry * Math.sin(angle);
    return {
      ...meta,
      count: list.length,
      cx,
      cy,
      centroidX: cx,
      centroidY: cy,
      extent: 0,
      hazeRx: 0,
      hazeRy: 0,
      hazeRotate: 0,
      labelX: cx,
      labelY: cy,
      labelAnchor: 'middle',
    };
  });
  const clusterByKey = new Map(clusters.map((c) => [c.key, c]));

  // Initial positions: jittered around the cluster center (seeded).
  const simNodes: SimNode[] = records.map((r) => {
    const group = groupKeyFor(r, groupBy);
    const c = clusterByKey.get(group)!;
    const spread = 20 + 12 * Math.sqrt(c.count);
    const a = rand() * Math.PI * 2;
    const d = Math.sqrt(rand()) * spread;
    return {
      id: r.innovation_id,
      group,
      r: nodeRadius(r),
      x: c.cx + Math.cos(a) * d,
      y: c.cy + Math.sin(a) * d,
    };
  });

  const sim = forceSimulation<SimNode>(simNodes)
    .force('x', forceX<SimNode>((d) => clusterByKey.get(d.group)!.cx).strength(0.06))
    .force('y', forceY<SimNode>((d) => clusterByKey.get(d.group)!.cy).strength(0.06))
    // Keep room for the inner halo (~2.6× core) plus breathing space.
    .force('collide', forceCollide<SimNode>((d) => d.r * 2.6 + 7).iterations(2))
    .force('charge', forceManyBody<SimNode>().strength(-18).distanceMax(140))
    .stop();
  sim.tick(300);

  // Measure clusters after settling.
  for (const c of clusters) {
    const members = simNodes.filter((d) => d.group === c.key);
    const sx = members.reduce((s, d) => s + d.x, 0) / members.length;
    const sy = members.reduce((s, d) => s + d.y, 0) / members.length;
    const extent = members.reduce((m, d) => Math.max(m, Math.hypot(d.x - sx, d.y - sy) + d.r), 0);
    c.centroidX = sx;
    c.centroidY = sy;
    c.extent = extent;
    // Haze: 1.5–2× the cluster, mildly elliptical and tilted.
    const base = Math.max(extent, 18);
    c.hazeRx = base * (1.55 + rand() * 0.35) + 26;
    c.hazeRy = base * (1.35 + rand() * 0.35) + 22;
    c.hazeRotate = (rand() - 0.5) * 50;

    // Label sits just outside the cluster on the side facing away from center.
    let dirX = sx - cxMid;
    let dirY = sy - cyMid;
    const len = Math.hypot(dirX, dirY) || 1;
    dirX /= len;
    dirY /= len;
    const gap = extent + 34;
    const textH = c.lines.length * LABEL_LINE_H + LABEL_COUNT_H;
    // Rough width estimate for the uppercase, letter-spaced label.
    const textW = Math.max(...c.lines.map((l) => l.length), 14) * 8.6;

    let anchor: ClusterLayout['labelAnchor'] = Math.abs(dirX) < 0.35 ? 'middle' : dirX < 0 ? 'end' : 'start';
    let labelX = sx + dirX * gap;
    let labelY = sy + dirY * gap;

    // If a side label would run off the canvas, stack it above/below instead.
    const overflowsLeft = anchor === 'end' && labelX - textW < 8;
    const overflowsRight = anchor === 'start' && labelX + textW > width - 8;
    if (overflowsLeft || overflowsRight) {
      anchor = 'middle';
      labelX = sx;
      dirY = sy < cyMid ? -1 : 1;
      labelY = sy + dirY * gap;
    }

    // SVG text grows downward from its baseline: when the label sits above the
    // cluster, shift it up by its own height; when beside it, center vertically.
    if (dirY < -0.3) labelY -= textH - LABEL_LINE_H;
    else if (dirY <= 0.3) labelY -= textH / 2 - LABEL_LINE_H;

    c.labelAnchor = anchor;
    c.labelX = Math.min(width - 24, Math.max(24, labelX));
    c.labelY = Math.min(height - textH, Math.max(LABEL_LINE_H + 4, labelY));
  }

  const recordById = new Map(records.map((r) => [r.innovation_id, r]));
  const nodes: NodeLayout[] = simNodes.map((d) => ({
    id: d.id,
    record: recordById.get(d.id)!,
    group: d.group,
    r: d.r,
    x: d.x,
    y: d.y,
    dx: (rand() - 0.5) * 5,
    dy: (rand() - 0.5) * 5,
    dur: 8 + rand() * 6,
    delay: -rand() * 12,
    pulseDur: 3.5 + rand() * 3.5,
    pulseDelay: -rand() * 7,
  }));

  // Texture lines: each node to its nearest one or two neighbours in the same
  // cluster, capped by distance, de-duplicated. Sparse by construction.
  const links: LinkLayout[] = [];
  const seen = new Set<string>();
  for (const c of clusters) {
    const members = simNodes.filter((d) => d.group === c.key);
    const maxDist = Math.max(60, c.extent * 0.9);
    for (const a of members) {
      const near = members
        .filter((b) => b !== a)
        .map((b) => ({ b, dist: Math.hypot(a.x - b.x, a.y - b.y) }))
        .sort((p, q) => p.dist - q.dist)
        .slice(0, members.length > 6 ? 2 : 1)
        .filter((p) => p.dist <= maxDist);
      for (const { b } of near) {
        const key = a.id < b.id ? `${a.id}|${b.id}` : `${b.id}|${a.id}`;
        if (seen.has(key)) continue;
        seen.add(key);
        // Gentle curve: control point offset perpendicular to the chord.
        const mx = (a.x + b.x) / 2;
        const my = (a.y + b.y) / 2;
        const vx = b.x - a.x;
        const vy = b.y - a.y;
        const L = Math.hypot(vx, vy) || 1;
        const bend = (rand() - 0.5) * Math.min(18, L * 0.35);
        const qx = mx + (-vy / L) * bend;
        const qy = my + (vx / L) * bend;
        links.push({ a: a.id, b: b.id, group: c.key, d: `M${a.x.toFixed(1)} ${a.y.toFixed(1)} Q${qx.toFixed(1)} ${qy.toFixed(1)} ${b.x.toFixed(1)} ${b.y.toFixed(1)}` });
      }
    }
  }

  // Colored particles scattered around each cluster. Decorative only.
  const particles: Particle[] = [];
  for (const c of clusters) {
    const count = 8 + Math.round(Math.sqrt(c.count) * 4);
    const reach = c.extent * 1.5 + 36;
    for (let i = 0; i < count; i++) {
      const a = rand() * Math.PI * 2;
      // Bias outward so particles ring the cluster rather than crowd the nodes.
      const d = (0.45 + 0.55 * Math.sqrt(rand())) * reach;
      const white = rand() < 0.22;
      const twinkle = rand() < 0.35 ? { dur: 4 + rand() * 5, delay: -rand() * 9 } : null;
      particles.push({
        x: c.centroidX + Math.cos(a) * d,
        y: c.centroidY + Math.sin(a) * d * 0.85,
        r: 0.5 + rand() * 1.4,
        o: 0.25 + rand() * 0.5,
        color: white ? '#ffffff' : c.color,
        twinkle,
      });
    }
  }

  // Sparse white background stars.
  const dust: Particle[] = Array.from({ length: 60 }, () => ({
    x: rand() * width,
    y: rand() * height,
    r: 0.4 + rand() * 0.8,
    o: 0.1 + rand() * 0.28,
    color: '#ffffff',
    twinkle: rand() < 0.2 ? { dur: 5 + rand() * 6, delay: -rand() * 11 } : null,
  }));

  return { width, height, clusters, nodes, links, particles, dust };
}
