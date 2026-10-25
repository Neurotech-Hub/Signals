import { Logo } from '@/components/brand/Logo';
import { metrics, records } from '@/lib/data';
import { Constellation } from './Constellation';
import { HeroMetrics } from './HeroMetrics';

export function Hero() {
  return (
    <section
      id="top"
      className="relative isolate overflow-hidden bg-navy-950 text-white"
      aria-labelledby="hero-title"
    >
      <div
        aria-hidden="true"
        className="hero-atmosphere pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(900px 480px at 72% 40%, rgba(96,165,250,0.14), transparent 60%),' +
            'radial-gradient(700px 420px at 30% 110%, rgba(167,139,250,0.14), transparent 60%),' +
            'radial-gradient(600px 360px at 95% 10%, rgba(251,146,60,0.10), transparent 60%),' +
            'linear-gradient(180deg, #070e26 0%, #050a1c 100%)',
        }}
      />

      <div className="mx-auto max-w-7xl px-6 pt-8 lg:px-10 lg:pt-9">
        <Logo size="lg" tone="light" />
      </div>

      <div className="hero-layout mx-auto grid max-w-7xl grid-cols-1 items-start gap-10 px-6 pb-16 pt-10 lg:min-h-[520px] lg:grid-cols-12 lg:items-center lg:gap-6 lg:px-10 lg:pb-14 lg:pt-8">
        <div className="min-w-0 lg:col-span-5">
          <h1
            id="hero-title"
            className="font-brand text-[2.1rem] font-semibold leading-[1.1] tracking-[-0.025em] text-white sm:text-[2.5rem]"
          >
            Neuroscience innovation at Washington University in St. Louis
          </h1>
          <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-white/65">
            A curated, AI-driven exploration of publicly disclosed methods, technologies, and
            research ideas from the neuroscience community.
          </p>
          <div className="@container mt-10 border-t border-white/15 pt-8">
            <HeroMetrics metrics={metrics} />
          </div>
        </div>

        <div className="min-w-0 lg:col-span-7">
          <Constellation records={records} groupBy="domain" className="mx-auto w-full min-w-0 max-w-[820px]" />
          <p className="mt-2 text-center text-[11px] text-white/40 lg:text-right">
            One node per record, grouped by domain. Node size reflects the number of public sources; outlined nodes are externally led.
          </p>
        </div>
      </div>
    </section>
  );
}
