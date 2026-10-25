import { Footer } from '@/components/layout/Footer';
import { Hero } from '@/components/hero/Hero';
import { Archive } from '@/components/discover/Archive';
import { PeriodRail } from '@/components/discover/PeriodRail';
import { DataSources } from '@/components/sources/DataSources';
import { ScopeProvider } from '@/lib/scopeContext';
import { isSourcesPath } from '@/lib/sources';

export default function App() {
  const sources = isSourcesPath(window.location.pathname);

  return (
    <ScopeProvider>
      <div className="min-h-dvh bg-white">
        {sources ? (
          <DataSources />
        ) : (
          <main>
            <Hero />
            <PeriodRail />
            <Archive />
          </main>
        )}
        <Footer />
      </div>
    </ScopeProvider>
  );
}
