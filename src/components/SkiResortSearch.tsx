import React, { useState, useMemo } from 'react';
import type { SearchFilters } from '../types/ski-resort';
import { newEnglandSkiResorts } from '../data/ski-resorts';
import SkiResortCard from './SkiResortCard';
import SearchForm from './SearchForm';

const SkiResortSearch: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({});

  // Filter and search resorts based on current criteria
  const filteredResorts = useMemo(() => {
    return newEnglandSkiResorts.filter(resort => {
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
        resort.elevation.summit >= filters.minElevation;

      const matchesMaxElevation = !filters.maxElevation || 
        resort.elevation.summit <= filters.maxElevation;

      // Filter by lifts
      const matchesMinLifts = !filters.minLifts || 
        resort.lifts.total >= filters.minLifts;

      // Filter by trails
      const matchesMinTrails = !filters.minTrails || 
        resort.trails.total >= filters.minTrails;

      // Filter by skiable acres
      const matchesMinAcres = !filters.minSkiableAcres || 
        resort.skiableAcres >= filters.minSkiableAcres;

      return matchesSearch && matchesState && matchesMinElevation && 
             matchesMaxElevation && matchesMinLifts && matchesMinTrails && 
             matchesMinAcres;
    });
  }, [searchTerm, filters]);

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

      <div className="results-summary">
        <p>Found {filteredResorts.length} ski resort{filteredResorts.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="resort-grid">
        {filteredResorts.map(resort => (
          <SkiResortCard key={resort.id} resort={resort} />
        ))}
      </div>

      {filteredResorts.length === 0 && (
        <div className="no-results">
          <p>No ski resorts match your search criteria. Try adjusting your filters.</p>
        </div>
      )}
    </div>
  );
};

export default SkiResortSearch;