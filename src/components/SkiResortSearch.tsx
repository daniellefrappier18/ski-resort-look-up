import React, { useState, useMemo } from 'react';
import type { SearchFilters } from '../types/ski-resort';
import { useSkiResortsFromAPI } from '../hooks/useSkiResortsAPI';
import SkiResortCard from './SkiResortCard';
import SearchForm from './SearchForm';

const SkiResortSearch: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({});
  
  // Fetch resorts from API
  const { resorts: apiResorts, loading, error } = useSkiResortsFromAPI();

  // Filter and search resorts based on current criteria
  const filteredResorts = useMemo(() => {
    return apiResorts.filter(resort => {
      // Text search
      const matchesSearch = !searchTerm || 
        resort.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resort.location.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resort.location.state.toLowerCase().includes(searchTerm.toLowerCase());

      // Filter by state
      const matchesState = !filters.state || 
        resort.location.state.toLowerCase() === filters.state.toLowerCase();

      // Filter by elevation
      const matchesMinElevation = !filters.minElevation || 
        (resort.elevation.summit !== null && resort.elevation.summit >= filters.minElevation);

      const matchesMaxElevation = !filters.maxElevation || 
        (resort.elevation.summit !== null && resort.elevation.summit <= filters.maxElevation);

      // Filter by lifts
      const matchesMinLifts = !filters.minLifts || 
        (resort.lifts.total !== null && resort.lifts.total >= filters.minLifts);

      // Filter by trails
      const matchesMinTrails = !filters.minTrails || 
        (resort.trails.total !== null && resort.trails.total >= filters.minTrails);

      // Filter by skiable acres
      const matchesMinAcres = !filters.minSkiableAcres || 
        (resort.skiableAcres !== null && resort.skiableAcres >= filters.minSkiableAcres);

      // Filter by fixed-grip only
      const matchesFixedGripOnly = !filters.fixedGripOnly || 
        resort.lifts.fixedGripOnly === true;

      return matchesSearch && matchesState && matchesMinElevation && 
             matchesMaxElevation && matchesMinLifts && matchesMinTrails && 
             matchesMinAcres && matchesFixedGripOnly;
    });
  }, [searchTerm, filters, apiResorts]);

  return (
    <div className="ski-resort-search">
      <div className="search-header">
        <h1>New England Ski Resort Explorer</h1>
        <p>Discover mountain elevations, lift statistics, and more for ski areas across New England</p>
      </div>

      <SearchForm
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        filters={filters}
        onFiltersChange={setFilters}
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