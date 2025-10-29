import { useState, useEffect } from 'react';
import type { SkiResort, SearchFilters } from '../types/ski-resort';
import { SkiResortAPI, fallbackResorts } from '../services/skiResortAPI';

interface UseSkiResortsFromAPI {
  resorts: SkiResort[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useSkiResortsFromAPI = (): UseSkiResortsFromAPI => {
  const [resorts, setResorts] = useState<SkiResort[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchResorts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await SkiResortAPI.getAllResorts();
      setResorts(data);
    } catch (err) {
      console.error('Failed to fetch resorts from API, using fallback data:', err);
      setError('Failed to load ski resort data from API. Using cached data.');
      setResorts(fallbackResorts);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResorts();
  }, []);

  return {
    resorts,
    loading,
    error,
    refetch: fetchResorts,
  };
};

interface UseSearchSkiResortsFromAPI {
  searchResorts: (searchTerm?: string, filters?: SearchFilters) => void;
  resorts: SkiResort[];
  loading: boolean;
  error: string | null;
}

export const useSearchSkiResortsFromAPI = (): UseSearchSkiResortsFromAPI => {
  const [resorts, setResorts] = useState<SkiResort[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const searchResorts = async (searchTerm?: string, filters?: SearchFilters) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await SkiResortAPI.searchResorts(searchTerm, filters as Record<string, unknown>);
      setResorts(data);
    } catch (err) {
      console.error('Failed to search resorts from API:', err);
      setError('Failed to search ski resorts. Please try again.');
      setResorts([]);
    } finally {
      setLoading(false);
    }
  };

  return {
    searchResorts,
    resorts,
    loading,
    error,
  };
};