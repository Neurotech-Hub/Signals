import { Logo } from '@/components/brand/Logo';
import { bank, formatDate } from '@/lib/data';

const LINKS = [
  { label: 'About', href: '#about' },
  { label: 'Data sources', href: '#data-sources' },
  { label: 'Contact', href: '#contact' },
];

export function Footer() {
  return (
    <footer className="border-t border-ink-100 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 px-6 py-8 lg:px-10">
        <p className="max-w-3xl text-xs leading-relaxed text-ink-500">
          Signals is an independent project exploring publicly disclosed innovations involving the St. Louis
          neuroscience community. It is not an official Washington University website or a comprehensive record of
          institutional activity.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Logo size="sm" tone="dark" />
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-ink-500">
            {LINKS.map((link) => (
              <a key={link.label} href={link.href} className="hover:text-ink-950">
                {link.label}
              </a>
            ))}
            <span className="text-ink-300" aria-hidden="true">|</span>
            <span>Last scanned {formatDate(bank.generated)}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
