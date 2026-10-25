import { useEffect, useRef } from 'react';
import type { InnovationRecord } from '@/types/innovation';
import { formatDate } from '@/lib/data';
import { LEAD_LABELS, leadBucket, sourceLabel } from '@/lib/normalize';

interface NodePopoverProps {
  record: InnovationRecord;
  color: string;
  groupLabel: string;
  anchor: { x: number; top: number; bottom: number };
  container: HTMLElement;
  onClose: () => void;
}

const WIDTH = 320;

/**
 * Detail card for a selected node. Renders only public-safe fields
 * (see data/README.md): name, description, investigators, lab, category,
 * source links, discovery date.
 */
export function NodePopover({ record, color, groupLabel, anchor, container, onClose }: NodePopoverProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.focus({ preventScroll: true });
    const onDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    // Defer so the opening click doesn't immediately close it.
    const t = window.setTimeout(() => document.addEventListener('pointerdown', onDown), 0);
    return () => {
      window.clearTimeout(t);
      document.removeEventListener('pointerdown', onDown);
    };
  }, [onClose]);

  const cw = container.clientWidth;
  const ch = container.clientHeight;
  const left = Math.min(Math.max(8, anchor.x - WIDTH / 2), Math.max(8, cw - WIDTH - 8));
  // Estimated card height; the hero has some breathing room beyond the SVG box.
  const EST_H = 300;
  const SLACK = 60;
  const fitsBelow = anchor.bottom + 12 + EST_H <= ch + SLACK;
  const fitsAbove = anchor.top - 12 - EST_H >= -SLACK;
  const placeBelow = fitsBelow || (!fitsAbove && anchor.top < ch / 2);
  const style = placeBelow
    ? { left, top: anchor.bottom + 12 }
    : { left, bottom: ch - anchor.top + 12 };

  const lead = leadBucket(record.lead_don_status);

  return (
    <div
      ref={ref}
      tabIndex={-1}
      role="dialog"
      aria-label={record.name}
      className="absolute z-20 w-[320px] max-w-[calc(100%-16px)] rounded-xl border border-white/10 bg-navy-900/95 p-4 text-white shadow-2xl outline-none backdrop-blur-md"
      style={style}
    >
      <div className="mb-2 flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
            style={{ backgroundColor: `${color}22`, color }}
          >
            {groupLabel}
          </span>
          <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-medium text-white/70">
            {LEAD_LABELS[lead]}
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="-mr-1 -mt-1 rounded-md p-1 text-white/50 hover:bg-white/10 hover:text-white"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>
      </div>

      <h3 className="text-sm font-semibold leading-snug">{record.name}</h3>
      <p className="mt-1.5 text-xs leading-relaxed text-white/70">{record.description}</p>

      <dl className="mt-3 space-y-1 text-[11px]">
        <div className="flex gap-2">
          <dt className="w-20 shrink-0 text-white/45">Investigators</dt>
          <dd className="text-white/85">{record.investigators.map((p) => p.name).join(', ')}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="w-20 shrink-0 text-white/45">Lab</dt>
          <dd className="text-white/85">{record.originating_lab}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="w-20 shrink-0 text-white/45">Category</dt>
          <dd className="text-white/85">{record.category}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="w-20 shrink-0 text-white/45">Identified</dt>
          <dd className="text-white/85">{formatDate(record.discovery_date)} by the Scout</dd>
        </div>
      </dl>

      {record.source_evidence?.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {record.source_evidence.map((url) => (
            <a
              key={url}
              href={url}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1 rounded-md border border-white/15 px-2 py-1 text-[11px] text-white/80 hover:border-white/40 hover:text-white"
            >
              {sourceLabel(url)}
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M7 17 17 7M8 7h9v9" />
              </svg>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
