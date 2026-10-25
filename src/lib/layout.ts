/**
 * Deterministic cluster layout for the hero constellation.
 *
 * Every node is a real record. Clusters are real groups (domain by default).
 * Node radius encodes the number of public source-evidence links (1–4+).
 * No links/edges are drawn — the dataset does not contain relationships.
 */

import { forceSimulation, forceX, forceY, forceCollide, forceManyBody } from 'd3-force';
import type { InnovationRecord } from '@/types/innovation';
import { groupKeyFor, groupMetaFor, type GroupMeta } from './normalize';

export interface ClusterLayout extends GroupMeta {
  count: number;
  /** Target center used by the force. */
  cx: number;
  cy: number;
  /** Post-simulation centroid and extent, used for labels and ambient glow. */
  centroidX: number;
  centroidY: number;
  extent: number;
  label: string;
  labelX: number;
  labelY: number;
  labelAnchor: 'start' | 'middle' | 'end';
}

export interface NodeLayout {
  id: string;
  record: InnovationRecord;
  group: string;
  r: number;
  x: number;
  y: number;
  /** Drift parameters for the gentle CSS motion. */
  dx: number;
  dy: number;
  dur: number;
  delay: number;
}

export interface ConstellationLayout {
  width: number;
  height: number;
  clusters: ClusterLayout[];
  nodes: NodeLayout[];
  dust: Array<{ x: number; y: number; r: number; o: number }>;
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

export function nodeRadius(record: InnovationRecord): number {
  const evidence = Math.max(1, record.source_evidence?.length ?? 1);
  return Math.min(6 + (evidence - 1) * 2.5, 14);
}

const LABEL_LINE_H = 13;
const LABEL_COUNT_H = 15;

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
    const angle = startAngle + (i * 2 * Math.PI) / Math.max(n, 1);
    const cx = cxMid + rx * Math.cos(angle);
    const cy = cyMid + ry * Math.sin(angle);
    return {
      ...meta,
      count: list.length,
      cx,
      cy,
      centroidX: cx,
      centroidY: cy,
      extent: 0,
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
    .force('collide', forceCollide<SimNode>((d) => d.r + 9).iterations(2))
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

    // Label sits just outside the cluster on the side facing away from center.
    let dirX = sx - cxMid;
    let dirY = sy - cyMid;
    const len = Math.hypot(dirX, dirY) || 1;
    dirX /= len;
    dirY /= len;
    const gap = extent + 24;
    const textH = c.lines.length * LABEL_LINE_H + LABEL_COUNT_H;
    // Rough width estimate for the uppercase, letter-spaced label (≈7.4px/char).
    const textW = Math.max(...c.lines.map((l) => l.length), 14) * 7.4;

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
    dx: (rand() - 0.5) * 8,
    dy: (rand() - 0.5) * 8,
    dur: 7 + rand() * 6,
    delay: -rand() * 10,
  }));

  // Purely decorative background specks (not data). Kept tiny and neutral.
  const dust = Array.from({ length: 70 }, () => ({
    x: rand() * width,
    y: rand() * height,
    r: 0.5 + rand() * 0.9,
    o: 0.12 + rand() * 0.3,
  }));

  return { width, height, clusters, nodes, dust };
}
