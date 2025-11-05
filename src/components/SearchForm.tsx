import React from 'react';
import type { SearchFilters } from '../types/ski-resort';

interface SearchFormProps {
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  states?: string[];
}

const SearchForm: React.FC<SearchFormProps> = ({
  searchTerm,
  onSearchTermChange,
  filters,
  onFiltersChange,
  states = []
}) => {
  const handleFilterChange = (key: keyof SearchFilters, value: string | number | boolean | undefined) => {
    onFiltersChange({
      ...filters,
      [key]: value === '' ? undefined : value
    });
  };

  return (
    <div className="search-form">
      <div className="search-input-group">
        <label htmlFor="search">Search Resorts:</label>
        <input
          id="search"
          type="text"
          placeholder="Search by resort name, city, or state..."
          value={searchTerm}
          onChange={(e) => onSearchTermChange(e.target.value)}
        />
      </div>

      <div className="filters-grid">
        <div className="filter-group">
          <label htmlFor="state">State:</label>
          <select
            id="state"
            value={filters.state || ''}
            onChange={(e) => handleFilterChange('state', e.target.value)}
          >
            <option value="">All States</option>
            {states.map(state => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="minElevation">Min Summit Elevation (ft):</label>
          <input
            id="minElevation"
            type="number"
            placeholder="e.g. 3000"
            value={filters.minElevation || ''}
            onChange={(e) => handleFilterChange('minElevation', e.target.value ? parseInt(e.target.value) : undefined)}
          />
        </div>

        <div className="filter-group">
          <label htmlFor="maxElevation">Max Summit Elevation (ft):</label>
          <input
            id="maxElevation"
            type="number"
            placeholder="e.g. 4500"
            value={filters.maxElevation || ''}
            onChange={(e) => handleFilterChange('maxElevation', e.target.value ? parseInt(e.target.value) : undefined)}
          />
        </div>

        <div className="filter-group">
          <label htmlFor="minLifts">Min Number of Lifts:</label>
          <input
            id="minLifts"
            type="number"
            placeholder="e.g. 10"
            value={filters.minLifts || ''}
            onChange={(e) => handleFilterChange('minLifts', e.target.value ? parseInt(e.target.value) : undefined)}
          />
        </div>

        <div className="filter-group">
          <label htmlFor="minSlopeKm">Min Slope Kilometers:</label>
          <input
            id="minSlopeKm"
            type="number"
            step="0.1"
            placeholder="e.g. 10.5"
            value={filters.minSlopeKm || ''}
            onChange={(e) => handleFilterChange('minSlopeKm', e.target.value ? parseFloat(e.target.value) : undefined)}
          />
        </div>

        <div className="filter-group">
          <label htmlFor="minSkiableAcres">Min Skiable Acres:</label>
          <input
            id="minSkiableAcres"
            type="number"
            placeholder="e.g. 300"
            value={filters.minSkiableAcres || ''}
            onChange={(e) => handleFilterChange('minSkiableAcres', e.target.value ? parseInt(e.target.value) : undefined)}
          />
        </div>
      </div>
      <div className="danger-zone">
        <div className="filter-group checkbox-group">
          <label htmlFor="fixedGripOnly" className="checkbox-label danger-filter">
            <input
              id="fixedGripOnly"
              type="checkbox"
              checked={filters.fixedGripOnly || false}
              onChange={(e) => handleFilterChange('fixedGripOnly', e.target.checked ? true : undefined)}
            />
            <span className="checkbox-text">
              ☠️ DANGER ZONE: Fixed-grip lifts only ☠️ 
              <br />
              <small>(No detachable chairs, gondolas, or trams - Hard to get off!)</small>
            </span>
          </label>
        </div>
      </div>

      <button 
        type="button" 
        onClick={() => {
          onSearchTermChange('');
          onFiltersChange({});
        }}
        className="clear-filters-btn"
      >
        Clear All Filters
      </button>
    </div>
  );
};

export default SearchForm;