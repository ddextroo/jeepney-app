import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

type SavedRoutesValue = {
  savedIds: string[];
  isSaved: (id: string) => boolean;
  toggle: (id: string) => void;
};

const SavedRoutesContext = createContext<SavedRoutesValue | null>(null);

/** In-memory store for bookmarked routes (MVP — no persistence). */
export function SavedRoutesProvider({ children }: { children: ReactNode }) {
  const [savedIds, setSavedIds] = useState<string[]>([]);

  const toggle = useCallback((id: string) => {
    setSavedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }, []);

  const isSaved = useCallback((id: string) => savedIds.includes(id), [savedIds]);

  const value = useMemo(() => ({ savedIds, isSaved, toggle }), [savedIds, isSaved, toggle]);
  return <SavedRoutesContext.Provider value={value}>{children}</SavedRoutesContext.Provider>;
}

export function useSavedRoutes(): SavedRoutesValue {
  const ctx = useContext(SavedRoutesContext);
  if (!ctx) throw new Error('useSavedRoutes must be used within SavedRoutesProvider');
  return ctx;
}
