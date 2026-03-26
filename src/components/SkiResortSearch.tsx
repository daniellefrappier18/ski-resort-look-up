import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { SearchFilters } from '../types/ski-resort';
import { useSkiResortsGraphQL } from '../hooks/useSkiResortsGraphQL';
import { useResortLists } from '../hooks/useResortLists';
import SkiResortCard from './SkiResortCard';
import SearchForm from './SearchForm';
import ResortListPanel from './ResortListPanel';

const SkiResortSearch: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [listError, setListError] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { lists, readonly, hasItems, addToList, removeFromList, updateNote, getListForResort, getShareUrl } = useResortLists();

  // Auto-open drawer when the first resort is added
  useEffect(() => {
    if (hasItems && !drawerOpen) setDrawerOpen(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasItems]);

  const searchTerm = searchParams.get('q') ?? '';

  const filters: SearchFilters = {
    state: searchParams.get('state') ?? undefined,
    minElevation: searchParams.get('minElevation') ? Number(searchParams.get('minElevation')) : undefined,
    maxElevation: searchParams.get('maxElevation') ? Number(searchParams.get('maxElevation')) : undefined,
    minLifts: searchParams.get('minLifts') ? Number(searchParams.get('minLifts')) : undefined,
    minSlopeKm: searchParams.get('minSlopeKm') ? Number(searchParams.get('minSlopeKm')) : undefined,
    minSkiableAcres: searchParams.get('minSkiableAcres') ? Number(searchParams.get('minSkiableAcres')) : undefined,
    fixedGripOnly: searchParams.get('fixedGripOnly') === 'true' ? true : undefined,
  };

  const setSearchTerm = (value: string) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (value) next.set('q', value); else next.delete('q');
      return next;
    });
  };

  const setFilters = (value: SearchFilters | ((prev: SearchFilters) => SearchFilters)) => {
    const next = typeof value === 'function' ? value(filters) : value;
    setSearchParams(prev => {
      const params = new URLSearchParams(prev);
      const set = (key: string, val: string | undefined) => val ? params.set(key, val) : params.delete(key);
      set('state', next.state);
      set('minElevation', next.minElevation?.toString());
      set('maxElevation', next.maxElevation?.toString());
      set('minLifts', next.minLifts?.toString());
      set('minSlopeKm', next.minSlopeKm?.toString());
      set('minSkiableAcres', next.minSkiableAcres?.toString());
      set('fixedGripOnly', next.fixedGripOnly ? 'true' : undefined);
      return params;
    });
  };

  // Convert SearchFilters to GraphQL ResortFilters format
  const graphqlFilters = {
    state: filters.state,
    minElevation: filters.minElevation,
    maxElevation: filters.maxElevation,
    minLifts: filters.minLifts,
    minSlopeKm: filters.minSlopeKm,
    minSkiableAcres: filters.minSkiableAcres,
    fixedGripOnly: filters.fixedGripOnly,
  };

  // Fetch resorts from GraphQL
  const { 
    resorts: filteredResorts, 
    loading, 
    error, 
    states 
  } = useSkiResortsGraphQL(
    graphqlFilters, 
    searchTerm || undefined
  );

  const handleAddToList = (list: 'see' | 'avoid', resort: { id: string; name: string }) => {
    const result = addToList(list, resort);
    if (result.error) {
      setListError(result.error);
      setTimeout(() => setListError(null), 4000);
    }
  };

  return (
    <div className={`ski-resort-search overflow-x-hidden transition-all duration-300 ease-in-out${hasItems && drawerOpen ? ' mr-80' : ''}`}>
      <header className="text-center mb-8">
        <h1 className="text-white mb-2 text-4xl">USA Ski Resort Explorer 🏂</h1>
        <p className="text-white mb-2 text-xl" role="complementary">☠️ Find safe ski resorts nationwide & avoid fixed-grip death traps! ☠️</p>
      </header>

      <SearchForm
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        filters={filters}
        onFiltersChange={setFilters}
        states={states}
      />

      {hasItems && (
        <ResortListPanel
          lists={lists}
          readonly={readonly}
          open={drawerOpen}
          onToggle={() => setDrawerOpen(o => !o)}
          onRemove={removeFromList}
          onNoteChange={updateNote}
          getShareUrl={getShareUrl}
        />
      )}

      {listError && (
        <div role="alert" aria-live="assertive" className="mb-4 p-3 bg-amber-50 border border-amber-300 text-amber-800 rounded text-sm">
          ⚠️ {listError}
        </div>
      )}

      {error && (
        <div className="api-error" role="alert" aria-live="assertive">
          <p className="text-red-700 p-4 bg-red-100 rounded">
            ⚠️ {error}
          </p>
        </div>
      )}

      {loading ? (
        <div className="loading" role="status" aria-live="polite">
          <p className="text-center py-8 text-lg">
            🎿 Loading ski resort data...
          </p>
        </div>
      ) : (
        <>
          <div className="mb-4 font-semibold p-2 text-white" style={{backgroundColor: 'rgba(4, 59, 92, 0.4)'}} role="status" aria-live="polite">
            <p>Found {filteredResorts.length} ski resort{filteredResorts.length !== 1 ? 's' : ''}</p>
          </div>

          <main id="main-content">
            <section aria-label="Ski resort search results">
              <h2 className="sr-only">Search Results</h2>
              <div className="grid gap-6 mb-8 grid-cols-1 lg:grid-cols-2" role="list">
                {filteredResorts.map(resort => (
                  <SkiResortCard
                    key={resort.id}
                    resort={resort}
                    currentList={getListForResort(resort.id)}
                    onAddToList={list => handleAddToList(list, { id: resort.id, name: resort.name })}
                    onRemoveFromList={() => removeFromList(getListForResort(resort.id)!, resort.id)}
                    readonly={readonly}
                  />
                ))}
              </div>
            </section>
          </main>

          {filteredResorts.length === 0 && !loading && (
            <div className="text-center py-12 text-gray-600" role="status">
              <p className="text-lg">No ski resorts match your search criteria. Try adjusting your filters.</p>
            </div>
          )}
        </>
      )}
      
      {/* Credits Footer */}
      <footer className="mt-16 p-6 rounded-lg border border-gray-300 text-center" style={{background: 'rgba(255, 255, 255, 0.9)'}}>
        <div className="credits-content">
          <p className="my-2 text-sm text-gray-600">
            Data sourced from{' '}
            <a 
              href="https://www.skiresort.info/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 no-underline font-medium hover:text-blue-800 hover:underline"
            >
              skiresort.info
            </a>
          </p>
          <p className="my-2 text-sm text-gray-600">
            Photo by{' '}
            <a 
              href="https://unsplash.com/@biron?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 no-underline font-medium hover:text-blue-800 hover:underline"
            >
              Chris Biron
            </a>
            {' '}on{' '}
            <a 
              href="https://unsplash.com/photos/snowy-mountain-JVtcrWcbj1c?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 no-underline font-medium hover:text-blue-800 hover:underline"
            >
              Unsplash
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default SkiResortSearch;