/**
 * Presentation-layer normalization. Never mutates the underlying records.
 *
 * - `domain` is a small controlled vocabulary maintained by the Scout; we map it
 *   to display labels + brand colors. Unknown domains get a neutral fallback so a
 *   new value in the JSON never breaks the page.
 * - `category` is free text; `normalizeCategory` buckets it with ordered keyword
 *   rules for filters and chips.
 * - `lead_don_status` is bucketed into three public-facing groups.
 */

import type { InnovationRecord } from '@/types/innovation';

export interface GroupMeta {
  key: string;
  /** Full label, used in popovers/legends. */
  label: string;
  /** Label broken into lines for the hero visualization. */
  lines: string[];
  color: string;
}

/** Approved domain palette (see docs/dashboard-revision.md, "Atmospheric Cluster Glows"). */
const DOMAIN_META: Record<string, Omit<GroupMeta, 'key'>> = {
  'research-tool': {
    label: 'Research tools & reagents',
    lines: ['Research tools', '& reagents'],
    color: '#9565ff',
  },
  software: {
    label: 'Software & algorithms',
    lines: ['Software', '& algorithms'],
    color: '#3b91ff',
  },
  device: {
    label: 'Devices & instruments',
    lines: ['Devices', '& instruments'],
    color: '#ff9d32',
  },
  diagnostic: {
    label: 'Diagnostics & clinical methods',
    lines: ['Diagnostics', '& clinical methods'],
    color: '#ff5f9c',
  },
  'digital-health': {
    label: 'Digital health',
    lines: ['Digital', 'health'],
    color: '#25d9c5',
  },
};

const FALLBACK_COLORS = ['#f5c34d', '#34d399', '#c084fc', '#f87171', '#38bdf8'];

const DOMAIN_CHIP: Record<string, string> = {
  'research-tool': 'Research tool',
  software: 'Software',
  device: 'Device',
  diagnostic: 'Diagnostic',
  'digital-health': 'Digital health',
};

/** Short chip label for a domain. Unknown domains fall back to the full label. */
export function domainChip(domain: string): string {
  return DOMAIN_CHIP[domain] ?? domainMeta(domain).label;
}

export function domainMeta(domain: string, fallbackIndex = 0): GroupMeta {
  const meta = DOMAIN_META[domain];
  if (meta) return { key: domain, ...meta };
  const label = titleCase(domain.replace(/[-_]/g, ' '));
  return {
    key: domain,
    label,
    lines: [label],
    color: FALLBACK_COLORS[fallbackIndex % FALLBACK_COLORS.length],
  };
}

/** Ordered rules: first match wins. */
const CATEGORY_RULES: Array<[RegExp, string]> = [
  [/imaging/i, 'Imaging methods'],
  [/biosensor|biological tool|reagent/i, 'Biological tools & reagents'],
  [/data resource|platform|atlas/i, 'Data resources'],
  [/instrument|device|hardware|apparatus/i, 'Instruments & devices'],
  [/protocol|assay/i, 'Protocols & assays'],
  [/diagnostic|clinical|digital health|assessment|metric/i, 'Clinical & diagnostic methods'],
  [/software|algorithm|analysis|design tool|model/i, 'Software & algorithms'],
];

export function normalizeCategory(raw: string): string {
  for (const [re, label] of CATEGORY_RULES) {
    if (re.test(raw)) return label;
  }
  return 'Other';
}

export type LeadBucket = 'core' | 'affiliate' | 'external';

/**
 * Pilot-era leadership bucket. Used internally to identify DoN-led records
 * (see lib/scope.ts). Not shown in the general interface.
 */
export function leadBucket(status: string): LeadBucket {
  const s = status.toLowerCase();
  if (s.startsWith('core')) return 'core';
  if (s.startsWith('affiliate')) return 'affiliate';
  return 'external';
}

export function groupKeyFor(record: InnovationRecord, groupBy: 'domain' | 'category'): string {
  return groupBy === 'domain' ? record.domain : normalizeCategory(record.category);
}

export function groupMetaFor(key: string, groupBy: 'domain' | 'category', index: number): GroupMeta {
  if (groupBy === 'domain') return domainMeta(key, index);
  return {
    key,
    label: key,
    lines: splitLabel(key),
    color: FALLBACK_COLORS[index % FALLBACK_COLORS.length],
  };
}

function splitLabel(label: string): string[] {
  const idx = label.indexOf(' & ');
  return idx > 0 ? [label.slice(0, idx), label.slice(idx + 1)] : [label];
}

function titleCase(s: string): string {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Human-friendly label for an evidence URL (e.g. "doi.org", "github.com"). */
export function sourceLabel(url: string): string {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, '');
    if (host === 'doi.org') {
      return u.pathname.includes('10.1101') || u.pathname.includes('10.64898')
        ? 'Preprint (DOI)'
        : 'DOI';
    }
    return host;
  } catch {
    return 'Source';
  }
}
