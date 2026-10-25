/**
 * Single entry point for the Scout-maintained dataset.
 * The JSON is imported at build time, so every push to /data that triggers the
 * Pages workflow produces a site that reflects the new records automatically.
 */

import bankJson from '@data/innovation_bank.json';
import type { InnovationBank, InnovationRecord } from '@/types/innovation';

export const bank = bankJson as unknown as InnovationBank;

/** Every record in the bank, before any scope or date filtering. */
export const records: InnovationRecord[] = bank.records;

/** The Scout's most recent run (bank.generated, YYYY-MM-DD). Anchors the observation window. */
export const lastScanned: string = bank.generated;

/**
 * Headline metrics. All three are scope-independent counts over whichever
 * record list is passed in, so they describe what the Scout surfaced within
 * the current lens — not institutional output.
 */
export interface ArchiveMetrics {
  /** Distinct innovations in the list. */
  surfaced: number;
  /** Unique investigators across the list (name, case- and space-insensitive). */
  researchers: number;
  /** Unique evidence URLs across the list. */
  sources: number;
}

export function computeMetrics(list: InnovationRecord[]): ArchiveMetrics {
  const people = new Set<string>();
  const urls = new Set<string>();
  for (const r of list) {
    for (const p of r.investigators ?? []) {
      const key = normalizeName(p.name);
      if (key) people.add(key);
    }
    for (const u of r.source_evidence ?? []) {
      const key = normalizeUrl(u);
      if (key) urls.add(key);
    }
  }
  return { surfaced: list.length, researchers: people.size, sources: urls.size };
}

function normalizeName(name: string): string {
  return (name ?? '').trim().replace(/\s+/g, ' ').toLowerCase();
}

function normalizeUrl(url: string): string {
  try {
    const u = new URL(url.trim());
    u.hash = '';
    const host = u.hostname.replace(/^www\./, '').toLowerCase();
    const path = u.pathname.replace(/\/+$/, '');
    return `${host}${path}${u.search}`;
  } catch {
    return url.trim().toLowerCase();
  }
}

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
