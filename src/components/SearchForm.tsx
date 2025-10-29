import React from 'react';
import type { SearchFilters } from '../types/ski-resort';

interface SearchFormProps {
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
}

const SearchForm: React.FC<SearchFormProps> = ({
  searchTerm,
  onSearchTermChange,
  filters,
  onFiltersChange
}) => {
  const handleFilterChange = (key: keyof SearchFilters, value: string | number | undefined) => {
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
            <option value="Vermont">Vermont</option>
            <option value="New Hampshire">New Hampshire</option>
            <option value="Maine">Maine</option>
            <option value="Massachusetts">Massachusetts</option>
            <option value="Connecticut">Connecticut</option>
            <option value="Rhode Island">Rhode Island</option>
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
          <label htmlFor="minTrails">Min Number of Trails:</label>
          <input
            id="minTrails"
            type="number"
            placeholder="e.g. 50"
            value={filters.minTrails || ''}
            onChange={(e) => handleFilterChange('minTrails', e.target.value ? parseInt(e.target.value) : undefined)}
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