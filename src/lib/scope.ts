/**
 * The two lenses on the archive: department scope and observation window.
 *
 * Both live in the URL (`?dept=don&window=12m`) so a view survives refresh and
 * can be shared. Everything on the page — hero nodes, metrics, feed, charts —
 * derives from the single list that `filterRecords` returns.
 */

import type { InnovationRecord } from '@/types/innovation';
import { leadBucket } from './normalize';
import { dayIndex, monthLabel, publicationDate, shiftMonths } from './publication';

// ---------------------------------------------------------------------------
// Departments
// ---------------------------------------------------------------------------

export interface Department {
  id: string;
  label: string;
  /** Short form for narrow screens. */
  short: string;
}

/**
 * Departments the site can isolate. Add an entry when a new departmental Scout
 * starts contributing records with that `lead_department_id`.
 */
export const DEPARTMENTS: Department[] = [
  { id: 'don', label: 'Department of Neuroscience', short: 'Neuroscience' },
];

/**
 * Display names for every id the Scout may write. The header toggle stays the
 * short DEPARTMENTS list; the archive card uses this so a newly classified
 * lead still has a label before it is offered as a page-wide scope.
 */
const DEPARTMENT_LABELS: Record<string, string> = {
  don: 'Neuroscience',
  radiology: 'Radiology',
  neurology: 'Neurology',
  neurosurgery: 'Neurosurgery',
  psychiatry: 'Psychiatry',
  anesthesiology: 'Anesthesiology',
  otolaryngology: 'Otolaryngology',
  ophthalmology: 'Ophthalmology',
  bme: 'Biomedical Engineering',
  medicine: 'Medicine',
  pathology: 'Pathology & Immunology',
};

export function departmentLabel(id: string): string {
  return DEPARTMENT_LABELS[id] ?? id.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

/** The department that leads this record, or null when the lead is external or unset. */
export function leadDepartmentId(record: InnovationRecord): string | null {
  if (typeof record.lead_department_id === 'string' && record.lead_department_id.trim()) {
    return record.lead_department_id.trim().toLowerCase();
  }
  if (leadBucket(record.lead_don_status ?? '') === 'core') return 'don';
  return null;
}

export const ALL_DEPARTMENTS = { id: null, label: 'All indexed', short: 'All indexed' } as const;

export function departmentById(id: string | null): Department | undefined {
  return id ? DEPARTMENTS.find((d) => d.id === id) : undefined;
}

/**
 * Does this department lead the record?
 *
 * Leadership, not participation. Prefers `lead_department_id`; until the Scout
 * migrates that field, DoN-led work is identified by the pilot's
 * `lead_don_status === "core"`. Affiliate and co-author roles are participation
 * and do not count.
 */
export function ledByDepartment(record: InnovationRecord, deptId: string): boolean {
  return leadDepartmentId(record) === deptId.toLowerCase();
}

// ---------------------------------------------------------------------------
// Observation window
// ---------------------------------------------------------------------------

export type WindowId = '12m' | '24m' | '36m' | 'all';

export interface WindowOption {
  id: WindowId;
  label: string;
  short: string;
  months: number | null;
}

export const WINDOWS: WindowOption[] = [
  { id: '12m', label: 'Past 12 months', short: '12 mo', months: 12 },
  { id: '24m', label: 'Past 24 months', short: '24 mo', months: 24 },
  { id: '36m', label: 'Past 36 months', short: '36 mo', months: 36 },
  { id: 'all', label: 'All indexed dates', short: 'All', months: null },
];

export const DEFAULT_WINDOW: WindowId = 'all';

export function isWindowId(v: string | null): v is WindowId {
  return WINDOWS.some((w) => w.id === v);
}

export interface DateRange {
  /** YYYY-MM-DD inclusive. */
  start: string;
  /** YYYY-MM-DD inclusive. */
  end: string;
}

/**
 * The earliest documented public date across a list, as YYYY-MM-DD.
 * Undated records are ignored. Returns null when nothing is dated.
 */
export function earliestPublicDate(list: InnovationRecord[]): string | null {
  let min: string | null = null;
  for (const r of list) {
    const d = publicationDate(r);
    if (d && (min === null || d.start < min)) min = d.start;
  }
  return min;
}

/**
 * The calendar span a window covers. The anchor is the Scout's last run, not
 * the visitor's clock, so a static build reads the same way for everyone.
 * `extentStart` is the earliest dated record and bounds the "all" window.
 */
export function windowRange(windowId: WindowId, anchor: string, extentStart: string | null): DateRange {
  const w = WINDOWS.find((x) => x.id === windowId) ?? WINDOWS[1];
  if (w.months === null) {
    return { start: extentStart ?? anchor.slice(0, 8) + '01', end: anchor };
  }
  return { start: shiftMonths(anchor, w.months), end: anchor };
}

/**
 * Is the record's public date inside the range? Partial dates are ranges of
 * their own, so a `2025` record overlaps any window touching 2025. Undated
 * records never match a bounded window; `inWindow` returns null for them so the
 * caller can decide (the "all" window admits them).
 */
export function inWindow(record: InnovationRecord, range: DateRange): boolean | null {
  const d = publicationDate(record);
  if (!d) return null;
  return d.start <= range.end && d.end >= range.start;
}

/** "OCT 2024 – OCT 2026" */
export function periodLabel(range: DateRange): string {
  return `${monthLabel(range.start)} – ${monthLabel(range.end)}`.toUpperCase();
}

/** Position of a date inside a range, 0..1, clamped. */
export function positionInRange(iso: string, range: DateRange): number {
  const a = dayIndex(range.start);
  const b = dayIndex(range.end);
  if (b <= a) return 1;
  return Math.min(1, Math.max(0, (dayIndex(iso) - a) / (b - a)));
}

// ---------------------------------------------------------------------------
// Combined scope
// ---------------------------------------------------------------------------

export interface Scope {
  /** Department id, or null for all indexed records. */
  dept: string | null;
  window: WindowId;
}

export const DEFAULT_SCOPE: Scope = { dept: null, window: DEFAULT_WINDOW };

export function parseScope(search: string): Scope {
  const params = new URLSearchParams(search);
  const deptRaw = params.get('dept');
  const dept = deptRaw && departmentById(deptRaw.toLowerCase()) ? deptRaw.toLowerCase() : null;
  const windowRaw = params.get('window');
  const window = isWindowId(windowRaw) ? windowRaw : DEFAULT_WINDOW;
  return { dept, window };
}

/**
 * Write the scope into an existing query string, keeping unrelated params.
 * Defaults are removed rather than written, so the clean URL stays clean.
 */
export function applyScope(search: string, scope: Scope): string {
  const params = new URLSearchParams(search);
  if (scope.dept) params.set('dept', scope.dept);
  else params.delete('dept');
  if (scope.window !== DEFAULT_WINDOW) params.set('window', scope.window);
  else params.delete('window');
  const s = params.toString();
  return s ? `?${s}` : '';
}

export interface ScopedArchive {
  /** Records led by the selected department (all records when no department). */
  byDepartment: InnovationRecord[];
  /** `byDepartment` further restricted to the observation window. */
  records: InnovationRecord[];
  /** Dated records in the department scope that fall outside the window. */
  outsideWindow: InnovationRecord[];
  /** Undated records in the department scope. Shown only under "all". */
  undated: InnovationRecord[];
  range: DateRange;
  /** Full dated extent of the department scope, for the date rail. */
  extent: DateRange;
}

export function filterRecords(all: InnovationRecord[], scope: Scope, anchor: string): ScopedArchive {
  const byDepartment = scope.dept ? all.filter((r) => ledByDepartment(r, scope.dept!)) : all;
  const extentStart = earliestPublicDate(byDepartment);
  const range = windowRange(scope.window, anchor, extentStart);
  const extent: DateRange = { start: extentStart ?? range.start, end: anchor };

  const records: InnovationRecord[] = [];
  const outsideWindow: InnovationRecord[] = [];
  const undated: InnovationRecord[] = [];
  for (const r of byDepartment) {
    const hit = inWindow(r, range);
    if (hit === null) {
      undated.push(r);
      if (scope.window === 'all') records.push(r);
    } else if (hit) {
      records.push(r);
    } else {
      outsideWindow.push(r);
    }
  }
  return { byDepartment, records, outsideWindow, undated, range, extent };
}
