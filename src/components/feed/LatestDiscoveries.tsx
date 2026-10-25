import { useEffect } from 'react';
import type { InnovationRecord } from '@/types/innovation';
import { domainChip, domainMeta, LEAD_LABELS, leadBucket, sourceLabel } from '@/lib/normalize';
import { byPublicationDesc, publicationDate } from '@/lib/publication';
import { FeaturedCard } from './FeaturedCard';

interface LatestDiscoveriesProps {
  records: InnovationRecord[];
  featured?: InnovationRecord;
  domain: string | null;
  domainLabel?: string;
  selectedId: string | null;
  hoveredId: string | null;
  /** Scroll the selected row into view only when the selection came from the chart. */
  selectionFrom: 'list' | 'chart';
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
  onClearDomain: () => void;
}

export function LatestDiscoveries({
  records,
  featured,
  domain,
  domainLabel,
  selectedId,
  hoveredId,
  selectionFrom,
  onSelect,
  onHover,
  onClearDomain,
}: LatestDiscoveriesProps) {
  const featuredVisible = featured && (!domain || featured.domain === domain) ? featured : undefined;
  const list = records
    .filter((r) => r.innovation_id !== featuredVisible?.innovation_id)
    .filter((r) => !domain || r.domain === domain)
    .sort(byPublicationDesc);

  useEffect(() => {
    if (!selectedId || selectionFrom !== 'chart') return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.getElementById(`discovery-${selectedId}`)?.scrollIntoView({
      behavior: reduce ? 'auto' : 'smooth',
      block: 'center',
    });
  }, [selectedId, selectionFrom]);

  return (
    <section id="discoveries" aria-labelledby="discoveries-title">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 id="discoveries-title" className="font-brand text-xl font-semibold tracking-tight text-ink-950">
          Latest discoveries
        </h2>
        {domain && (
          <p className="flex items-center gap-2 text-xs text-ink-700">
            Showing {domainLabel ?? domain}
            <button
              type="button"
              onClick={onClearDomain}
              className="rounded-full border border-ink-300 px-2 py-0.5 font-medium text-ink-950 hover:border-ink-950"
            >
              Clear
            </button>
          </p>
        )}
      </div>

      {featuredVisible && (
        <FeaturedCard
          record={featuredVisible}
          selected={selectedId === featuredVisible.innovation_id}
          onSelect={onSelect}
        />
      )}

      {list.length === 0 ? (
        <p className="mt-6 text-sm text-ink-500">No discoveries in this domain.</p>
      ) : (
        <ol className={`${featuredVisible ? 'mt-4' : ''} divide-y divide-ink-100 overflow-hidden rounded-xl border border-ink-100`}>
          {list.map((record) => (
            <DiscoveryRow
              key={record.innovation_id}
              record={record}
              open={selectedId === record.innovation_id}
              hot={hoveredId === record.innovation_id}
              onSelect={onSelect}
              onHover={onHover}
            />
          ))}
        </ol>
      )}
    </section>
  );
}

function DiscoveryRow({
  record,
  open,
  hot,
  onSelect,
  onHover,
}: {
  record: InnovationRecord;
  open: boolean;
  hot: boolean;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
}) {
  const meta = domainMeta(record.domain);
  const pub = publicationDate(record);
  const image = typeof record.image_url === 'string' && record.image_url ? record.image_url : null;

  return (
    <li
      id={`discovery-${record.innovation_id}`}
      className={hot && !open ? 'bg-ink-100/60' : undefined}
      style={open ? { boxShadow: `inset 3px 0 0 ${meta.color}` } : undefined}
      onMouseEnter={() => onHover(record.innovation_id)}
      onMouseLeave={() => onHover(null)}
    >
      <button
        type="button"
        aria-expanded={open}
        onClick={() => onSelect(record.innovation_id)}
        className="flex w-full items-center gap-3 px-3 py-3 text-left hover:bg-ink-100/40"
      >
        {image ? (
          <img src={image} alt="" className="h-12 w-12 shrink-0 rounded-lg object-cover" />
        ) : (
          <span
            aria-hidden="true"
            className="grid h-12 w-12 shrink-0 place-items-center rounded-lg"
            style={{ backgroundColor: `${meta.color}22` }}
          >
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: meta.color }} />
          </span>
        )}
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-ink-950">{record.name}</span>
          <span className={`mt-0.5 block text-xs text-ink-500 ${open ? '' : 'line-clamp-1'}`}>{record.description}</span>
        </span>
        <span className="hidden shrink-0 text-right text-xs text-ink-500 sm:block">
          <span className="block text-ink-700">{record.originating_lab}</span>
          {pub && <span className="block">{pub.label}</span>}
        </span>
        <span
          aria-hidden="true"
          className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border border-ink-100 text-ink-500 ${open ? 'rotate-90' : ''}`}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m9 6 6 6-6 6" />
          </svg>
        </span>
      </button>

      {open && (
        <div className="px-4 pb-4 pl-[4.25rem] pr-12 text-sm">
          <dl className="grid gap-1.5 text-xs sm:grid-cols-2">
            <div>
              <dt className="text-ink-500">Investigators</dt>
              <dd className="text-ink-950">{record.investigators.map((p) => p.name).join(', ')}</dd>
            </div>
            <div>
              <dt className="text-ink-500">Lab</dt>
              <dd className="text-ink-950">{record.originating_lab}</dd>
            </div>
            <div>
              <dt className="text-ink-500">Category</dt>
              <dd className="text-ink-950">
                {domainChip(record.domain)} · {record.category}
              </dd>
            </div>
            <div>
              <dt className="text-ink-500">Lead</dt>
              <dd className="text-ink-950">{LEAD_LABELS[leadBucket(record.lead_don_status)]}</dd>
            </div>
          </dl>
          {record.technical_advantage && (
            <p className="mt-3 text-xs leading-relaxed text-ink-700">
              <span className="font-medium text-ink-950">Scout note. </span>
              {record.technical_advantage}
            </p>
          )}
          {record.source_evidence.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {record.source_evidence.map((url) => (
                <a
                  key={url}
                  href={url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-1 rounded-full border border-ink-300 px-2.5 py-1 text-[11px] font-medium text-ink-950 hover:border-ink-950"
                >
                  {sourceLabel(url)}
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </li>
  );
}
