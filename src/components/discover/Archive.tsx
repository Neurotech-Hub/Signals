import { useEffect, useState } from 'react';
import { domainMeta } from '@/lib/normalize';
import { pickFeatured } from '@/lib/publication';
import { departmentLabel, leadDepartmentId } from '@/lib/scope';
import { useScope } from '@/lib/scopeContext';
import { LatestInnovations } from '@/components/feed/LatestInnovations';
import { Sidebar } from '@/components/sidebar/Sidebar';

/**
 * Shared selection between the innovations list and the sidebar views.
 * The record list comes from the page-wide scope (department + window). Domain
 * and leading-department filters narrow it further here. A point or row selects
 * one record in both the list and the chart.
 */
export function Archive() {
  const { records, scope, resetWindow } = useScope();
  const featured = pickFeatured(records);
  const [domain, setDomain] = useState<string | null>(null);
  const [department, setDepartment] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectionFrom, setSelectionFrom] = useState<'list' | 'chart'>('list');

  // When the scope changes, drop a selection that is no longer on the page.
  useEffect(() => {
    if (selectedId && !records.some((r) => r.innovation_id === selectedId)) setSelectedId(null);
  }, [records, selectedId]);

  const toggleDomain = (next: string) => {
    const value = domain === next ? null : next;
    setDomain(value);
    if (value && selectedId) {
      const rec = records.find((r) => r.innovation_id === selectedId);
      if (rec && rec.domain !== value) setSelectedId(null);
    }
  };

  const applyDepartment = (next: string | null) => {
    setDepartment(next);
    if (next && selectedId) {
      const rec = records.find((r) => r.innovation_id === selectedId);
      if (rec && leadDepartmentId(rec) !== next) setSelectedId(null);
    }
  };

  const selectFromList = (id: string) => {
    setSelectionFrom('list');
    setSelectedId((prev) => (prev === id ? null : id));
  };

  const selectFromChart = (id: string) => {
    const rec = records.find((r) => r.innovation_id === id);
    if (rec && domain && rec.domain !== domain) setDomain(null);
    if (rec && department && leadDepartmentId(rec) !== department) applyDepartment(null);
    setSelectionFrom('chart');
    setSelectedId(id);
  };

  return (
    <div className="archive mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 py-12 lg:grid-cols-12 lg:px-10">
      <div className="min-w-0 lg:col-span-8">
        <LatestInnovations
          records={records}
          featured={featured}
          domain={domain}
          domainLabel={domain ? domainMeta(domain).label : undefined}
          department={department}
          departmentLabel={department ? departmentLabel(department) : undefined}
          selectedId={selectedId}
          hoveredId={hoveredId}
          selectionFrom={selectionFrom}
          onSelect={selectFromList}
          onHover={setHoveredId}
          onClearDomain={() => setDomain(null)}
          onClearDepartment={() => setDepartment(null)}
          onWidenWindow={scope.window !== 'all' ? resetWindow : undefined}
        />
      </div>
      <div className="min-w-0 lg:col-span-4">
        <h2 id="lens-title" className="mb-5 font-brand text-xl font-semibold tracking-tight text-ink-950">
          Signals Lens
        </h2>
        <Sidebar
          records={records}
          domain={domain}
          department={department}
          selectedId={selectedId}
          hoveredId={hoveredId}
          onSelect={selectFromChart}
          onHover={setHoveredId}
          onToggleDomain={toggleDomain}
          onDepartment={applyDepartment}
        />
      </div>
    </div>
  );
}
