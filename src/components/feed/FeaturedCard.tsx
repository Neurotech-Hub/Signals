import type { InnovationRecord } from '@/types/innovation';
import { domainChip, domainMeta, sourceLabel } from '@/lib/normalize';
import { insightPhrases, publicationDate } from '@/lib/publication';

interface FeaturedCardProps {
  record: InnovationRecord;
  selected: boolean;
  onSelect: (id: string) => void;
}

export function FeaturedCard({ record, selected, onSelect }: FeaturedCardProps) {
  const meta = domainMeta(record.domain);
  const pub = publicationDate(record);
  const phrases = insightPhrases(record.technical_advantage);
  const image = typeof record.image_url === 'string' && record.image_url ? record.image_url : null;
  const names = record.investigators.map((p) => p.name);
  const affiliation = record.investigators[0]?.affiliation;

  return (
    <article
      id={`discovery-${record.innovation_id}`}
      className={`overflow-hidden rounded-2xl border bg-white transition-shadow ${
        selected ? 'border-ink-950/25 shadow-md' : 'border-ink-100 hover:border-ink-300'
      }`}
    >
      <div className="flex flex-col sm:flex-row">
        <div className="relative h-44 shrink-0 sm:h-auto sm:w-[232px]">
          {image ? (
            <img src={image} alt="" className="h-full w-full object-cover" />
          ) : (
            <FeatureArt color={meta.color} />
          )}
          {image && (
            <span aria-hidden="true" className="absolute inset-y-0 left-0 w-[3px]" style={{ backgroundColor: meta.color }} />
          )}
          <span className="data-label absolute left-3 top-3 rounded-full bg-white/90 px-2 py-0.5 text-[10px] text-ink-950">
            Featured
          </span>
        </div>

        <div className="flex min-w-0 flex-1 flex-col p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5">
              <Chip color={meta.color}>{domainChip(record.domain)}</Chip>
            </div>
            {pub && <time className="data-label shrink-0 text-ink-500">{pub.label}</time>}
          </div>

          <h3 className="mt-3 font-brand text-lg font-semibold leading-snug tracking-tight text-ink-950">
            <button
              type="button"
              onClick={() => onSelect(record.innovation_id)}
              className="text-left hover:underline decoration-ink-300 underline-offset-4"
            >
              {record.name}
            </button>
          </h3>
          <p className="mt-1.5 text-sm leading-relaxed text-ink-700">{record.description}</p>

          <dl className="mt-4 grid gap-3 text-xs sm:grid-cols-2">
            <div className="flex gap-2">
              <PersonIcon />
              <div>
                <dt className="font-medium text-ink-950">{names.join(', ')}</dt>
                {affiliation && <dd className="text-ink-500">{affiliation}</dd>}
              </div>
            </div>
            <div className="flex gap-2">
              <LabIcon />
              <div>
                <dt className="font-medium text-ink-950">{record.originating_lab}</dt>
                <dd className="text-ink-500">{record.category}</dd>
              </div>
            </div>
          </dl>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {phrases.map((phrase) => (
              <span key={phrase} className="rounded-full border border-ink-100 px-2.5 py-1 text-[11px] text-ink-700">
                {phrase}
              </span>
            ))}
            <span className="ml-auto flex flex-wrap gap-1.5">
              {record.source_evidence.slice(0, 2).map((url) => (
                <a
                  key={url}
                  href={url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-1 rounded-full border border-ink-300 px-2.5 py-1 text-[11px] font-medium text-ink-950 hover:border-ink-950"
                >
                  {sourceLabel(url)}
                  <ExternalIcon />
                </a>
              ))}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}

function Chip({ color, children }: { color: string; children: string }) {
  return (
    <span
      className="rounded-full px-2 py-0.5 text-[11px] font-medium"
      style={{ backgroundColor: `${color}22`, color }}
    >
      {children}
    </span>
  );
}

/** Domain-colored stand-in used until a record carries an image_url. Not a photograph. */
function FeatureArt({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 232 280" preserveAspectRatio="xMidYMid slice" className="h-full w-full" aria-hidden="true">
      <rect width="232" height="280" fill="#0b1433" />
      <circle cx="116" cy="150" r="78" fill={color} opacity="0.18" />
      <circle cx="92" cy="138" r="34" fill={color} opacity="0.95" />
      <circle cx="142" cy="168" r="22" fill={color} opacity="0.55" />
      <circle cx="128" cy="108" r="12" fill="#ffffff" opacity="0.85" />
      <circle cx="64" cy="196" r="6" fill={color} opacity="0.7" />
      <circle cx="176" cy="96" r="4" fill="#ffffff" opacity="0.5" />
    </svg>
  );
}

function PersonIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="mt-0.5 shrink-0 text-ink-500" aria-hidden="true">
      <circle cx="12" cy="8" r="3.2" />
      <path d="M5.5 19.5c1.2-3 3.4-4.5 6.5-4.5s5.3 1.5 6.5 4.5" strokeLinecap="round" />
    </svg>
  );
}

function LabIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="mt-0.5 shrink-0 text-ink-500" aria-hidden="true">
      <path d="M9 3h6M10 3v6.5L5.5 18a3 3 0 0 0 2.6 4.5h8a3 3 0 0 0 2.6-4.5L14 9.5V3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ExternalIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M7 17 17 7M8 7h9v9" />
    </svg>
  );
}
