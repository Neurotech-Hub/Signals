import { Footer } from '@/components/layout/Footer';
import { Hero } from '@/components/hero/Hero';
import { Archive } from '@/components/discover/Archive';
import { PeriodRail } from '@/components/discover/PeriodRail';
import { ScopeProvider } from '@/lib/scopeContext';

export default function App() {
  return (
    <ScopeProvider>
      <div className="min-h-dvh bg-white">
        <main>
          <Hero />
          <PeriodRail />
          <Archive />
        </main>
        <Footer />
      </div>
    </ScopeProvider>
  );
}
