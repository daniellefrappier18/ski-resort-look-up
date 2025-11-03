import { gql } from '@apollo/client';

// Query to get all ski resorts with optional filtering
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
        total
        beginner
        intermediate
        advanced
        expert
      }
      skiableAcres
      liftTicketPrice
      seasonDates
      website
      phoneNumber
    }
  }
`;

// Query to get a specific ski resort by ID
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
        total
        beginner
        intermediate
        advanced
        expert
      }
      skiableAcres
      liftTicketPrice
      seasonDates
      website
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