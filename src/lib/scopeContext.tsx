/**
 * Shared scope for the whole page. One provider reads `?dept` and `?window`
 * from the URL, filters the archive once, and every section renders from the
 * same list. Changing a lens pushes a history entry; back/forward restores it.
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { InnovationRecord } from '@/types/innovation';
import { computeMetrics, lastScanned, records as allRecords, type ArchiveMetrics } from './data';
import { applyScope, filterRecords, parseScope, type Scope, type ScopedArchive, type WindowId } from './scope';

interface ScopeContextValue extends ScopedArchive {
  scope: Scope;
  setDepartment: (dept: string | null) => void;
  setWindow: (window: WindowId) => void;
  resetWindow: () => void;
  metrics: ArchiveMetrics;
  allRecords: InnovationRecord[];
  lastScanned: string;
}

const ScopeContext = createContext<ScopeContextValue | null>(null);

function readScope(): Scope {
  return typeof window === 'undefined' ? parseScope('') : parseScope(window.location.search);
}

export function ScopeProvider({ children }: { children: ReactNode }) {
  const [scope, setScope] = useState<Scope>(readScope);

  // Browser navigation (back/forward) re-reads the URL.
  useEffect(() => {
    const onPop = () => setScope(readScope());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const commit = useCallback((next: Scope) => {
    setScope((prev) => {
      if (prev.dept === next.dept && prev.window === next.window) return prev;
      const search = applyScope(window.location.search, next);
      const url = `${window.location.pathname}${search}${window.location.hash}`;
      window.history.pushState(null, '', url);
      return next;
    });
  }, []);

  // The setters need the latest scope without re-creating on every change.
  const scopeRef = useLatest(scope);
  const setDepartment = useCallback((dept: string | null) => commit({ ...scopeRef(), dept }), [commit, scopeRef]);
  const setWindow = useCallback((window: WindowId) => commit({ ...scopeRef(), window }), [commit, scopeRef]);
  const resetWindow = useCallback(() => commit({ ...scopeRef(), window: 'all' }), [commit, scopeRef]);

  const filtered = useMemo(() => filterRecords(allRecords, scope, lastScanned), [scope]);
  const metrics = useMemo(() => computeMetrics(filtered.records), [filtered.records]);

  const value = useMemo<ScopeContextValue>(
    () => ({ ...filtered, scope, setDepartment, setWindow, resetWindow, metrics, allRecords, lastScanned }),
    [filtered, scope, setDepartment, setWindow, resetWindow, metrics],
  );

  return <ScopeContext.Provider value={value}>{children}</ScopeContext.Provider>;
}

export function useScope(): ScopeContextValue {
  const ctx = useContext(ScopeContext);
  if (!ctx) throw new Error('useScope must be used inside <ScopeProvider>');
  return ctx;
}

/** Returns a getter for the most recent value without adding it to deps. */
function useLatest<T>(value: T): () => T {
  const [box] = useState(() => ({ current: value }));
  box.current = value;
  return useCallback(() => box.current, [box]);
}
