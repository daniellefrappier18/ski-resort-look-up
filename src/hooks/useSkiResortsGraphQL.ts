import { useQuery } from '@apollo/client';
import { GET_SKI_RESORTS, GET_STATES } from '../graphql/queries';
import type { SkiResort } from '../types/ski-resort';

export interface ResortFilters {
  state?: string;
  minElevation?: number;
  maxElevation?: number;
  minLifts?: number;
  maxLifts?: number;
  minTrails?: number;
  maxTrails?: number;
  fixedGripOnly?: boolean;
}

export interface UseSkiResortsResult {
  resorts: SkiResort[];
  loading: boolean;
  error: string | null;
  states: string[];
  statesLoading: boolean;
  statesError: string | null;
}

interface ResortsQueryData {
  skiResorts: SkiResort[];
}

interface StatesQueryData {
  states: string[];
}

export const useSkiResortsGraphQL = (
  filters?: ResortFilters,
  search?: string
): UseSkiResortsResult => {
  // Query for resorts
  const { 
    data: resortsData, 
    loading: resortsLoading, 
    error: resortsError 
  } = useQuery<ResortsQueryData>(GET_SKI_RESORTS, {
    variables: { filters, search },
    errorPolicy: 'all'
  });

  // Query for states
  const { 
    data: statesData, 
    loading: statesLoading, 
    error: statesError 
  } = useQuery<StatesQueryData>(GET_STATES, {
    errorPolicy: 'all'
  });

  return {
    resorts: resortsData?.skiResorts || [],
    loading: resortsLoading,
    error: resortsError?.message || null,
    states: statesData?.states || [],
    statesLoading,
    statesError: statesError?.message || null,
  };
};