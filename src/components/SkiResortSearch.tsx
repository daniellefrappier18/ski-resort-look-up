import React, { useState } from 'react';
import type { SearchFilters } from '../types/ski-resort';
import { useSkiResortsGraphQL } from '../hooks/useSkiResortsGraphQL';
import SkiResortCard from './SkiResortCard';
import SearchForm from './SearchForm';

const SkiResortSearch: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({});
  
  // Convert SearchFilters to GraphQL ResortFilters format
  const graphqlFilters = {
    state: filters.state,
    minElevation: filters.minElevation,
    maxElevation: filters.maxElevation,
    minLifts: filters.minLifts,
    minSlopeKm: filters.minSlopeKm,
    fixedGripOnly: filters.fixedGripOnly
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

  return (
    <div className="ski-resort-search">
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
              <div className="grid gap-6 mb-8" style={{gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))'}} role="list">
                {filteredResorts.map(resort => (
                  <SkiResortCard key={resort.id} resort={resort} />
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