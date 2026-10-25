import { Logo } from '@/components/brand/Logo';
import { bank, formatDate } from '@/lib/data';
import { isSourcesPath, SOURCES_HREF } from '@/lib/sources';

const LINKS = [
  { label: 'Data sources', href: SOURCES_HREF },
  { label: 'Contact', href: 'mailto:gaidica@wustl.edu' },
];

export function Footer() {
  return (
    <footer className="border-t border-ink-100 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 px-6 py-8 lg:px-10">
        <p className="max-w-3xl text-xs leading-relaxed text-ink-500">
          Signals is a project driven by the Innovation directorate of the Washington University Department of
          Neuroscience.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Logo size="sm" tone="dark" href={isSourcesPath(window.location.pathname) ? import.meta.env.BASE_URL : '#top'} />
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-ink-500">
            {LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                aria-current={link.href === SOURCES_HREF && isSourcesPath(window.location.pathname) ? 'page' : undefined}
                className="hover:text-ink-950 aria-[current=page]:text-ink-950"
              >
                {link.label}
              </a>
            ))}
            <span className="text-ink-300" aria-hidden="true">|</span>
            <span className="data-label text-ink-500">Last scanned {formatDate(bank.generated)}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
