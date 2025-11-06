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
    <form role="search" aria-label="Ski resort search and filters" className="bg-gray-100 p-6 rounded-lg mb-8 border border-gray-300">
      <fieldset>
        <legend className="sr-only">Search and Filter Ski Resorts</legend>
        <div className="mb-6">
          <label htmlFor="search" className="block mb-2 font-semibold text-gray-800">Search Resorts:</label>
          <input
          id="search"
          type="text"
          placeholder="Search by resort name, city, or state..."
          value={searchTerm}
          onChange={(e) => onSearchTermChange(e.target.value)}
          className="w-full p-3 border border-gray-400 rounded text-base"
        />
      </div>

      <div className="grid gap-6 mb-4" style={{gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))'}}>
        <div className="filter-group">
          <label htmlFor="state" className="block mb-1 font-medium text-gray-600 text-sm">State:</label>
          <select
            id="state"
            value={filters.state || ''}
            onChange={(e) => handleFilterChange('state', e.target.value)}
            className="w-full p-2 border border-gray-400 rounded text-sm"
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
          <label htmlFor="minElevation" className="block mb-1 font-medium text-gray-600 text-sm">Min Summit Elevation (ft):</label>
          <input
            id="minElevation"
            type="number"
            placeholder="e.g. 3000"
            value={filters.minElevation || ''}
            onChange={(e) => handleFilterChange('minElevation', e.target.value ? parseInt(e.target.value) : undefined)}
            className="w-full p-2 border border-gray-400 rounded text-sm"
          />
        </div>

        <div className="filter-group">
          <label htmlFor="maxElevation" className="block mb-1 font-medium text-gray-600 text-sm">Max Summit Elevation (ft):</label>
          <input
            id="maxElevation"
            type="number"
            placeholder="e.g. 4500"
            value={filters.maxElevation || ''}
            onChange={(e) => handleFilterChange('maxElevation', e.target.value ? parseInt(e.target.value) : undefined)}
            className="w-full p-2 border border-gray-400 rounded text-sm"
          />
        </div>

        <div className="filter-group">
          <label htmlFor="minLifts" className="block mb-1 font-medium text-gray-600 text-sm">Min Number of Lifts:</label>
          <input
            id="minLifts"
            type="number"
            placeholder="e.g. 10"
            value={filters.minLifts || ''}
            onChange={(e) => handleFilterChange('minLifts', e.target.value ? parseInt(e.target.value) : undefined)}
            className="w-full p-2 border border-gray-400 rounded text-sm"
          />
        </div>

        <div className="filter-group">
          <label htmlFor="minSlopeKm" className="block mb-1 font-medium text-gray-600 text-sm">Min Slope Kilometers:</label>
          <input
            id="minSlopeKm"
            type="number"
            step="0.1"
            placeholder="e.g. 10.5"
            value={filters.minSlopeKm || ''}
            onChange={(e) => handleFilterChange('minSlopeKm', e.target.value ? parseFloat(e.target.value) : undefined)}
            className="w-full p-2 border border-gray-400 rounded text-sm"
          />
        </div>

        <div className="filter-group">
          <label htmlFor="minSkiableAcres" className="block mb-1 font-medium text-gray-600 text-sm">Min Skiable Acres:</label>
          <input
            id="minSkiableAcres"
            type="number"
            placeholder="e.g. 300"
            value={filters.minSkiableAcres || ''}
            onChange={(e) => handleFilterChange('minSkiableAcres', e.target.value ? parseInt(e.target.value) : undefined)}
            className="w-full p-2 border border-gray-400 rounded text-sm"
          />
        </div>
      </div>
      <div className="flex mb-4">
        <fieldset className="filter-group flex items-center">
          <legend className="sr-only">Safety Filters</legend>
          <label htmlFor="fixedGripOnly" className="rounded-lg p-4 border-2 border-red-400 cursor-pointer flex items-center mb-0" style={{background: 'linear-gradient(45deg, #ffebee, #ffcdd2)'}}>
            <input
              id="fixedGripOnly"
              type="checkbox"
              checked={filters.fixedGripOnly || false}
              onChange={(e) => handleFilterChange('fixedGripOnly', e.target.checked ? true : undefined)}
              className="w-auto mr-2 mb-0"
              aria-describedby="fixedGripDescription"
            />
            <span className="text-red-800 font-bold text-base">
              ☠️ DANGER ZONE: Fixed-grip lifts only ☠️ 
              <br />
              <small id="fixedGripDescription" className="text-red-700 font-normal italic">(No detachable chairs, gondolas, or trams - Hard to get off!)</small>
            </span>
          </label>
        </fieldset>
      </div>

      <button 
        type="button" 
        onClick={() => {
          onSearchTermChange('');
          onFiltersChange({});
        }}
        className="bg-red-600 text-white py-2 px-4 border-0 rounded cursor-pointer text-sm transition-colors hover:bg-red-700"
      >
        Clear All Filters
      </button>
      </fieldset>
    </form>
  );
};

export default SearchForm;