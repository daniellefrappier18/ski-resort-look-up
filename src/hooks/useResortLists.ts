import { useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { usaSkiResorts } from '../data/load-ski-resorts';

export interface ListEntry {
  id: string;
  name: string;
  note: string;
}

export interface ResortLists {
  see: ListEntry[];
  avoid: ListEntry[];
}

// Compact URL format — short keys, no name stored
interface StoredEntry { i: string; n: string; }
interface StoredLists { s: StoredEntry[]; a: StoredEntry[]; }

const nameById: Record<string, string> = Object.fromEntries(
  usaSkiResorts.map(r => [r.id, r.name])
);

function encodeLists(lists: ResortLists): string {
  const stored: StoredLists = {
    s: lists.see.map(e => ({ i: e.id, n: e.note })),
    a: lists.avoid.map(e => ({ i: e.id, n: e.note })),
  };
  return btoa(encodeURIComponent(JSON.stringify(stored)));
}

function decodeLists(encoded: string): ResortLists {
  try {
    const stored: StoredLists = JSON.parse(decodeURIComponent(atob(encoded)));
    const toEntry = (e: StoredEntry): ListEntry => ({
      id: e.i,
      name: nameById[e.i] ?? e.i,
      note: e.n ?? '',
    });
    return { see: stored.s.map(toEntry), avoid: stored.a.map(toEntry) };
  } catch {
    return { see: [], avoid: [] };
  }
}

export function useResortLists() {
  const [searchParams, setSearchParams] = useSearchParams();

  const lists: ResortLists = useMemo(() => {
    const encoded = searchParams.get('lists');
    if (!encoded) return { see: [], avoid: [] };
    return decodeLists(encoded);
  }, [searchParams]);

  const readonly = searchParams.get('readonly') === 'true';

  const updateLists = useCallback((next: ResortLists) => {
    setSearchParams(prev => {
      const params = new URLSearchParams(prev);
      if (next.see.length === 0 && next.avoid.length === 0) {
        params.delete('lists');
      } else {
        params.set('lists', encodeLists(next));
      }
      return params;
    });
  }, [setSearchParams]);

  const getListForResort = useCallback((id: string): 'see' | 'avoid' | null => {
    if (lists.see.some(e => e.id === id)) return 'see';
    if (lists.avoid.some(e => e.id === id)) return 'avoid';
    return null;
  }, [lists]);

  const addToList = useCallback((list: 'see' | 'avoid', entry: Omit<ListEntry, 'note'>): { error?: string } => {
    const currentList = getListForResort(entry.id);
    if (currentList !== null) {
      if (currentList === list) return {};
      return { error: `"${entry.name}" is already on your Places to ${currentList === 'see' ? 'See' : 'Avoid'} list. Remove it first.` };
    }
    updateLists({ ...lists, [list]: [...lists[list], { ...entry, note: '' }] });
    return {};
  }, [lists, getListForResort, updateLists]);

  const removeFromList = useCallback((list: 'see' | 'avoid', id: string) => {
    updateLists({ ...lists, [list]: lists[list].filter(e => e.id !== id) });
  }, [lists, updateLists]);

  const updateNote = useCallback((list: 'see' | 'avoid', id: string, note: string) => {
    updateLists({
      ...lists,
      [list]: lists[list].map(e => e.id === id ? { ...e, note: note.slice(0, 280) } : e),
    });
  }, [lists, updateLists]);

  const getShareUrl = useCallback((readonlyMode: boolean) => {
    const params = new URLSearchParams(searchParams);
    if (readonlyMode) {
      params.set('readonly', 'true');
    } else {
      params.delete('readonly');
    }
    return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
  }, [searchParams]);

  return {
    lists,
    readonly,
    hasItems: lists.see.length > 0 || lists.avoid.length > 0,
    addToList,
    removeFromList,
    updateNote,
    getListForResort,
    getShareUrl,
  };
}
