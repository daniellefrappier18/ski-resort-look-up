import { gql } from '@apollo/client';

export const GET_SKI_RESORTS = gql`
  query GetSkiResorts($filters: ResortFilters, $search: String) {
    skiResorts(filters: $filters, search: $search) {
      id
      name
      location {
        state
        city
      }
      elevation {
        base
        summit
        vertical
      }
      lifts {
        total
        chairlifts
        surfaceLifts
        gondolas
        funiculars
        fixedGripOnly
      }
      trails {
        totalKm
        beginnerKm
        intermediateKm
        advancedKm
        expertKm
      }
      skiableAcres
      website
      url
      trail_map_url
      adult_pass_price
      child_pass_price
  
    }
  }
`;

export const GET_SKI_RESORT_BY_ID = gql`
  query GetSkiResortById($id: ID!) {
    skiResort(id: $id) {
      id
      name
      location {
        state
        city
      }
      elevation {
        base
        summit
        vertical
      }
      lifts {
        total
        chairlifts
        surfaceLifts
        gondolas
        funiculars
        fixedGripOnly
      }
      trails {
        totalKm
        beginnerKm
        intermediateKm
        advancedKm
        expertKm
      }
      skiableAcres
      liftTicketPrice
      seasonDates
      website
      url
      trail_map_url
      phoneNumber
    }
  }
`;

// Query to get unique states for filter dropdown
export const GET_STATES = gql`
  query GetStates {
    states
  }
`;