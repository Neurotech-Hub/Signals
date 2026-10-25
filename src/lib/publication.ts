/**
 * Publication dates for display and sorting.
 *
 * Prefers an explicit `publication_date` (YYYY, YYYY-MM, or YYYY-MM-DD).
 * Until the Scout backfills that field, falls back to a year/month parsed from
 * `maturity`. That fallback is a display aid — it never invents a day.
 * `discovery_date` is intentionally not used here.
 */

import type { InnovationRecord } from '@/types/innovation';
import { formatDate } from './data';

const MONTHS: Record<string, string> = {
  jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
  jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12',
};

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export interface PubDate {
  /** Zero-padded YYYY-MM-DD, comparable as a string. Day is 01 when unknown. */
  sort: string;
  label: string;
}

export function publicationDate(record: InnovationRecord): PubDate | null {
  const explicit = typeof record.publication_date === 'string' ? parseExplicit(record.publication_date) : null;
  if (explicit) return explicit;
  return parseMaturity(record.maturity ?? '');
}

/** Latest publication first; higher scientific utility breaks ties. */
export function byPublicationDesc(a: InnovationRecord, b: InnovationRecord): number {
  const cmp = (publicationDate(b)?.sort ?? '').localeCompare(publicationDate(a)?.sort ?? '');
  if (cmp !== 0) return cmp;
  return (b.scientific_utility?.score ?? 0) - (a.scientific_utility?.score ?? 0);
}

/**
 * The spotlight record: among `top10` entries, the one with the latest
 * publication date. Falls back to the whole archive if nothing is flagged.
 */
export function pickFeatured(records: InnovationRecord[]): InnovationRecord | undefined {
  if (records.length === 0) return undefined;
  const pool = records.filter((r) => r.top10 === true);
  return [...(pool.length ? pool : records)].sort(byPublicationDesc)[0];
}

/** Split a prose advantage into short chip phrases. */
export function insightPhrases(text?: string): string[] {
  if (!text) return [];
  return text
    .split(/[;•]/)
    .map((s) => s.trim().replace(/\.$/, ''))
    .filter((s) => s.length > 0)
    .slice(0, 3);
}

function parseExplicit(raw: string): PubDate | null {
  const m = raw.trim().match(/^(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?$/);
  if (!m) return null;
  const [, year, month, day] = m;
  if (month && (Number(month) < 1 || Number(month) > 12)) return null;
  if (day && (Number(day) < 1 || Number(day) > 31)) return null;
  return build(year, month, day);
}

function parseMaturity(text: string): PubDate | null {
  const monthHits = [...text.matchAll(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+(20\d{2})\b/gi)];
  if (monthHits.length) {
    const hit = monthHits[monthHits.length - 1];
    return build(hit[2], MONTHS[hit[1].slice(0, 3).toLowerCase()]);
  }
  const range = text.match(/\b(20\d{2})\s*[–\-/]\s*(\d{2}|\d{4})\b/);
  if (range) {
    const y1 = Number(range[1]);
    const y2 = range[2].length === 2 ? Math.floor(y1 / 100) * 100 + Number(range[2]) : Number(range[2]);
    return build(String(Math.max(y1, y2)));
  }
  const years = [...text.matchAll(/\b(20\d{2})\b/g)].map((m) => Number(m[1]));
  if (years.length) return build(String(Math.max(...years)));
  return null;
}

function build(year: string, month?: string, day?: string): PubDate {
  const mm = month ?? '01';
  const dd = day ?? '01';
  let label = year;
  if (month && day) label = formatDate(`${year}-${mm}-${dd}`);
  else if (month) label = `${MONTH_NAMES[Number(month) - 1]} ${year}`;
  return { sort: `${year}-${mm}-${dd}`, label };
}
