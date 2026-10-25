import { useState } from 'react';
import { records } from '@/lib/data';
import { domainMeta } from '@/lib/normalize';
import { pickFeatured } from '@/lib/publication';
import { LatestDiscoveries } from '@/components/feed/LatestDiscoveries';
import { Sidebar } from '@/components/sidebar/Sidebar';

/**
 * Shared selection between the discoveries list and the two sidebar views.
 * A domain filter narrows the list. A point or row selects one record in both.
 */
export function Archive() {
  const featured = pickFeatured(records);
  const [domain, setDomain] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectionFrom, setSelectionFrom] = useState<'list' | 'chart'>('list');

  const toggleDomain = (next: string) => {
    const value = domain === next ? null : next;
    setDomain(value);
    if (value && selectedId) {
      const rec = records.find((r) => r.innovation_id === selectedId);
      if (rec && rec.domain !== value) setSelectedId(null);
    }
  };

  const selectFromList = (id: string) => {
    setSelectionFrom('list');
    setSelectedId((prev) => (prev === id ? null : id));
  };

  const selectFromChart = (id: string) => {
    const rec = records.find((r) => r.innovation_id === id);
    if (rec && domain && rec.domain !== domain) setDomain(null);
    setSelectionFrom('chart');
    setSelectedId(id);
  };

  return (
    <div className="archive mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 py-12 lg:grid-cols-12 lg:px-10">
      <div className="min-w-0 lg:col-span-8">
        <LatestDiscoveries
          records={records}
          featured={featured}
          domain={domain}
          domainLabel={domain ? domainMeta(domain).label : undefined}
          selectedId={selectedId}
          hoveredId={hoveredId}
          selectionFrom={selectionFrom}
          onSelect={selectFromList}
          onHover={setHoveredId}
          onClearDomain={() => setDomain(null)}
        />
      </div>
      <div className="min-w-0 lg:col-span-4">
        <Sidebar
          records={records}
          domain={domain}
          selectedId={selectedId}
          hoveredId={hoveredId}
          onSelect={selectFromChart}
          onHover={setHoveredId}
          onToggleDomain={toggleDomain}
        />
      </div>
    </div>
  );
}
