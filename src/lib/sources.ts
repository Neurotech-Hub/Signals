import type { InnovationRecord } from '@/types/innovation';
import { evidenceKey } from './data';

/** Public page that lists every source_evidence URL. Served as its own HTML entry. */
export const SOURCES_HREF = `${import.meta.env.BASE_URL}sources/`;

export function isSourcesPath(pathname: string): boolean {
  const path = pathname.replace(/\/+$/, '');
  return path.endsWith('/sources');
}

export interface CitedRecord {
  id: string;
  name: string;
}

export interface CitedSource {
  /** First URL seen for this citation. */
  url: string;
  /** Derived from the URL itself: the DOI, or host plus path. */
  label: string;
  records: CitedRecord[];
}

export interface SourceHost {
  host: string;
  sources: CitedSource[];
  /** Distinct innovations citing something on this website. */
  recordCount: number;
}

export interface SourceCatalog {
  hosts: SourceHost[];
  recordCount: number;
  sourceCount: number;
  /** Innovations with no source_evidence URL. */
  uncited: CitedRecord[];
}

/**
 * The Data sources page. Everything here is derived from the records, so a
 * Scout update that adds, removes, or retargets a citation changes the page
 * with no other edit.
 */
export function sourceCatalog(records: InnovationRecord[]): SourceCatalog {
  const byKey = new Map<string, CitedSource>();
  const uncited: CitedRecord[] = [];

  for (const record of records) {
    const urls = (record.source_evidence ?? []).map((u) => u.trim()).filter(Boolean);
    if (urls.length === 0) {
      uncited.push({ id: record.innovation_id, name: record.name });
      continue;
    }
    for (const url of urls) {
      const key = evidenceKey(url);
      if (!key) continue;
      let source = byKey.get(key);
      if (!source) {
        source = { url, label: citationLabel(url), records: [] };
        byKey.set(key, source);
      }
      if (!source.records.some((r) => r.id === record.innovation_id)) {
        source.records.push({ id: record.innovation_id, name: record.name });
      }
    }
  }

  const hosts = new Map<string, CitedSource[]>();
  for (const source of byKey.values()) {
    source.records.sort((a, b) => a.name.localeCompare(b.name));
    const host = hostOf(source.url);
    const list = hosts.get(host);
    if (list) list.push(source);
    else hosts.set(host, [source]);
  }

  const grouped: SourceHost[] = [...hosts.entries()].map(([host, sources]) => {
    sources.sort((a, b) => a.label.localeCompare(b.label));
    const ids = new Set(sources.flatMap((s) => s.records.map((r) => r.id)));
    return { host, sources, recordCount: ids.size };
  });
  grouped.sort((a, b) => b.sources.length - a.sources.length || a.host.localeCompare(b.host));
  uncited.sort((a, b) => a.name.localeCompare(b.name));

  return {
    hosts: grouped,
    recordCount: records.length,
    sourceCount: byKey.size,
    uncited,
  };
}

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return 'other';
  }
}

/** A readable citation drawn only from the URL. No publisher lookup. */
function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function citationLabel(url: string): string {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, '');
    const path = safeDecode(u.pathname).replace(/^\/+|\/+$/g, '');
    if (!path) return host;
    if (host === 'doi.org') return path;
    return `${host}/${path}`;
  } catch {
    return url;
  }
}
