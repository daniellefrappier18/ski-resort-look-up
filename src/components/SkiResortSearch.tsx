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
      <div className="search-header">
        <h1>USA Ski Resort Explorer 🏂</h1>
        <h2>☠️ Find safe ski resorts nationwide & avoid fixed-grip death traps! ☠️</h2>
      </div>

      <SearchForm
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        filters={filters}
        onFiltersChange={setFilters}
        states={states}
      />

      {error && (
        <div className="api-error">
          <p style={{ color: '#d9534f', padding: '1rem', background: '#f9f2f4', borderRadius: '4px' }}>
            ⚠️ {error}
          </p>
        </div>
      )}

      {loading ? (
        <div className="loading">
          <p style={{ textAlign: 'center', padding: '2rem', fontSize: '1.1rem' }}>
            🎿 Loading ski resort data...
          </p>
        </div>
      ) : (
        <>
          <div className="results-summary">
            <p>Found {filteredResorts.length} ski resort{filteredResorts.length !== 1 ? 's' : ''}</p>
          </div>

          <div className="resort-grid">
            {filteredResorts.map(resort => (
              <SkiResortCard key={resort.id} resort={resort} />
            ))}
          </div>

          {filteredResorts.length === 0 && !loading && (
            <div className="no-results">
              <p>No ski resorts match your search criteria. Try adjusting your filters.</p>
            </div>
          )}
        </>
      )}
      
      {/* Credits Footer */}
      <footer className="credits-footer">
        <div className="credits-content">
          <p>
            Data sourced from{' '}
            <a 
              href="https://www.skiresort.info/" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              skiresort.info
            </a>
          </p>
          <p>
            Photo by{' '}
            <a 
              href="https://unsplash.com/@biron?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText"
              target="_blank"
              rel="noopener noreferrer"
            >
              Chris Biron
            </a>
            {' '}on{' '}
            <a 
              href="https://unsplash.com/photos/snowy-mountain-JVtcrWcbj1c?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText"
              target="_blank"
              rel="noopener noreferrer"
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