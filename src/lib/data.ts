/**
 * Single entry point for the Scout-maintained dataset.
 * The JSON is imported at build time, so every push to /data that triggers the
 * Pages workflow produces a site that reflects the new records automatically.
 */

import bankJson from '@data/innovation_bank.json';
import type { InnovationBank, InnovationRecord } from '@/types/innovation';
import { leadBucket, type LeadBucket } from './normalize';

export const bank = bankJson as unknown as InnovationBank;

export const records: InnovationRecord[] = bank.records;

export interface ArchiveMetrics {
  total: number;
  byLead: Record<LeadBucket, number>;
}

export function computeMetrics(list: InnovationRecord[]): ArchiveMetrics {
  const byLead: Record<LeadBucket, number> = { core: 0, affiliate: 0, external: 0 };
  for (const r of list) byLead[leadBucket(r.lead_don_status)] += 1;
  return { total: list.length, byLead };
}

export const metrics = computeMetrics(records);

export function countBy<K extends string>(list: InnovationRecord[], keyFn: (r: InnovationRecord) => K) {
  const out = new Map<K, number>();
  for (const r of list) out.set(keyFn(r), (out.get(keyFn(r)) ?? 0) + 1);
  return out;
}

export function formatDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
