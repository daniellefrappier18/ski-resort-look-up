import { useQuery, useLazyQuery } from '@apollo/client/react';
import { GET_SKI_RESORTS, SEARCH_SKI_RESORTS } from '../graphql/queries';
import type { SkiResort, SearchFilters } from '../types/ski-resort';

// Custom hooks for GraphQL operations
// These demonstrate how you would fetch data with Apollo Client

interface UseSkiResortsResult {
  skiResorts: SkiResort[] | undefined;
  loading: boolean;
  error: Error | undefined;
  refetch: () => void;
}

export const useSkiResorts = (filters?: SearchFilters): UseSkiResortsResult => {
  const { data, loading, error, refetch } = useQuery(GET_SKI_RESORTS, {
    variables: { filters },
    errorPolicy: 'all'
  });

  return {
    skiResorts: (data as { skiResorts?: SkiResort[] })?.skiResorts,
    loading,
    error,
    refetch
  };
};

interface UseSearchSkiResortsResult {
  searchSkiResorts: (searchTerm: string, filters?: SearchFilters) => void;
  skiResorts: SkiResort[] | undefined;
  loading: boolean;
  error: Error | undefined;
}

export const useSearchSkiResorts = (): UseSearchSkiResortsResult => {
  const [searchSkiResorts, { data, loading, error }] = useLazyQuery(SEARCH_SKI_RESORTS, {
    errorPolicy: 'all'
  });

  const executeSearch = (searchTerm: string, filters?: SearchFilters) => {
    searchSkiResorts({
      variables: { searchTerm, filters }
    });
  };

  return {
    searchSkiResorts: executeSearch,
    skiResorts: (data as { searchSkiResorts?: SkiResort[] })?.searchSkiResorts,
    loading,
    error
  };
};

// Example of how you would use these hooks in a component:
/*
const MyComponent = () => {
  const { skiResorts, loading, error } = useSkiResorts({ state: 'Vermont' });
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      {skiResorts?.map(resort => (
        <div key={resort.id}>{resort.name}</div>
      ))}
    </div>
  );
};
*/