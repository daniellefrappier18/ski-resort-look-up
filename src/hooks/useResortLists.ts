import { useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

export interface ListEntry {
  id: string;
  name: string;
  note: string;
}

export interface ResortLists {
  see: ListEntry[];
  avoid: ListEntry[];
}

function encodeLists(lists: ResortLists): string {
  return btoa(encodeURIComponent(JSON.stringify(lists)));
}

function decodeLists(encoded: string): ResortLists {
  try {
    return JSON.parse(decodeURIComponent(atob(encoded)));
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
