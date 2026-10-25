import { Footer } from '@/components/layout/Footer';
import { Hero } from '@/components/hero/Hero';
import { Archive } from '@/components/discover/Archive';

export default function App() {
  return (
    <div className="min-h-dvh bg-white">
      <main>
        <Hero />
        <Archive />
      </main>
      <Footer />
    </div>
  );
}
