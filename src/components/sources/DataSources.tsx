import { useEffect } from 'react';
import { Logo } from '@/components/brand/Logo';
import { formatDate, lastScanned, records } from '@/lib/data';
import { sourceCatalog } from '@/lib/sources';

const HOME = import.meta.env.BASE_URL;

/**
 * Public sources behind the archive. The list is computed from
 * `source_evidence` on every record, so it tracks the bank without a
 * hand-maintained roster of journals, repositories, or websites.
 */
export function DataSources() {
  const catalog = sourceCatalog(records);

  useEffect(() => {
    const previous = document.title;
    document.title = 'Data sources — Signals';
    return () => {
      document.title = previous;
    };
  }, []);

  return (
    <>
      <header className="border-b border-ink-100 bg-white">
        <div className="mx-auto flex max-w-7xl items-center px-6 py-6 lg:px-10">
          <Logo size="md" tone="dark" href={HOME} />
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-12 lg:px-10 lg:py-16">
        <h1 className="font-brand text-3xl font-semibold tracking-tight text-ink-950">Data sources</h1>
        <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-ink-700">
          Each innovation cites the public sources it was identified from. This page is built from those
          citations, and it changes when the archive does.
        </p>
        <p className="data-label mt-6 text-ink-500">
          {catalog.recordCount} {catalog.recordCount === 1 ? 'innovation' : 'innovations'}
          <span className="px-2 text-ink-300" aria-hidden="true">
            ·
          </span>
          {catalog.sourceCount} public {catalog.sourceCount === 1 ? 'source' : 'sources'}
          <span className="px-2 text-ink-300" aria-hidden="true">
            ·
          </span>
          Last scanned {formatDate(lastScanned)}
        </p>

        {catalog.hosts.length === 0 ? (
          <p className="mt-12 text-sm text-ink-500">No public sources are cited yet.</p>
        ) : (
          <div className="mt-12 space-y-12">
            {catalog.hosts.map((group) => (
              <section key={group.host} aria-labelledby={`host-${group.host}`}>
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-ink-100 pb-3">
                  <h2 id={`host-${group.host}`} className="font-brand text-lg font-semibold text-ink-950">
                    {group.host}
                  </h2>
                  <p className="text-[11px] text-ink-500">
                    {group.sources.length} {group.sources.length === 1 ? 'source' : 'sources'}
                    <span className="px-1.5 text-ink-300" aria-hidden="true">
                      ·
                    </span>
                    {group.recordCount} {group.recordCount === 1 ? 'innovation' : 'innovations'}
                  </p>
                </div>
                <ul className="divide-y divide-ink-100">
                  {group.sources.map((source) => (
                    <li key={source.url} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8">
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="min-w-0 break-all text-sm font-medium text-ink-950 underline decoration-ink-300 underline-offset-2 hover:decoration-ink-950"
                      >
                        {source.label}
                      </a>
                      <p className="shrink-0 text-xs leading-relaxed text-ink-500 sm:max-w-[45%] sm:text-right">
                        {source.records.map((r) => r.name).join(' · ')}
                      </p>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}

        {catalog.uncited.length > 0 && (
          <section className="mt-12" aria-labelledby="uncited-title">
            <h2 id="uncited-title" className="font-brand text-lg font-semibold text-ink-950">
              No public source cited yet
            </h2>
            <ul className="mt-3 space-y-1 text-sm text-ink-700">
              {catalog.uncited.map((r) => (
                <li key={r.id}>{r.name}</li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </>
  );
}
