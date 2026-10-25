/**
 * Public dates for display, sorting, and the observation window.
 *
 * Order of preference per record:
 *   1. `first_public_date` (earliest documented public disclosure)
 *   2. `publication_date`
 *   3. a year/month parsed from `maturity` — a display aid that never invents a day
 *
 * `discovery_date` / `first_seen_at` are intentionally not used here: they say
 * when the Scout found the record, not when the work became public.
 *
 * Partial dates stay partial. A `2025` record is a range (Jan 1 – Dec 31), not a
 * guessed day, and the window filter tests that range for overlap.
 */

import type { DatePrecision, InnovationRecord } from '@/types/innovation';
import { formatDate } from './data';

const MONTHS: Record<string, string> = {
  jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
  jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12',
};

export const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export interface PubDate {
  /** Zero-padded YYYY-MM-DD, comparable as a string. Day/month are 01 when unknown. */
  sort: string;
  label: string;
  precision: Exclude<DatePrecision, 'unknown'>;
  /** Earliest day the disclosure could fall on (YYYY-MM-DD). */
  start: string;
  /** Latest day the disclosure could fall on (YYYY-MM-DD). */
  end: string;
}

export function publicationDate(record: InnovationRecord): PubDate | null {
  const first = typeof record.first_public_date === 'string' ? parseExplicit(record.first_public_date, record.date_precision) : null;
  if (first) return first;
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
 * publication date. Falls back to the whole list if nothing is flagged.
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

/** "Oct 2026" for a YYYY-MM or YYYY-MM-DD string. */
export function monthLabel(iso: string): string {
  const m = iso.match(/^(\d{4})-(\d{2})/);
  if (!m) return iso;
  return `${MONTH_NAMES[Number(m[2]) - 1]} ${m[1]}`;
}

/** Days since the Unix epoch for a YYYY-MM-DD string (UTC, so no DST drift). */
export function dayIndex(iso: string): number {
  const [y, m, d] = iso.split('-').map(Number);
  return Math.floor(Date.UTC(y, (m || 1) - 1, d || 1) / 86_400_000);
}

/** First day of the month `months` before the month containing `iso`. */
export function shiftMonths(iso: string, months: number): string {
  const [y, m] = iso.split('-').map(Number);
  const total = y * 12 + (m - 1) - months;
  const year = Math.floor(total / 12);
  const month = (total % 12) + 1;
  return `${year}-${String(month).padStart(2, '0')}-01`;
}

function parseExplicit(raw: string, declared?: DatePrecision): PubDate | null {
  const m = raw.trim().match(/^(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?$/);
  if (!m) return null;
  const year = m[1];
  let month: string | undefined = m[2];
  let day: string | undefined = m[3];
  if (month && (Number(month) < 1 || Number(month) > 12)) return null;
  if (day && (Number(day) < 1 || Number(day) > 31)) return null;
  // A declared precision can only make the date coarser, never finer.
  if (declared === 'unknown') return null;
  if (declared === 'year') {
    month = undefined;
    day = undefined;
  }
  if (declared === 'month') day = undefined;
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

function daysInMonth(year: string, month: string): number {
  return new Date(Date.UTC(Number(year), Number(month), 0)).getUTCDate();
}

function build(year: string, month?: string, day?: string): PubDate {
  const mm = month ?? '01';
  const dd = day ?? '01';
  let label = year;
  if (month && day) label = formatDate(`${year}-${mm}-${dd}`);
  else if (month) label = `${MONTH_NAMES[Number(month) - 1]} ${year}`;
  const precision: PubDate['precision'] = day ? 'day' : month ? 'month' : 'year';
  const end = day
    ? `${year}-${mm}-${dd}`
    : month
      ? `${year}-${mm}-${String(daysInMonth(year, mm)).padStart(2, '0')}`
      : `${year}-12-31`;
  return { sort: `${year}-${mm}-${dd}`, label, precision, start: `${year}-${mm}-${dd}`, end };
}
