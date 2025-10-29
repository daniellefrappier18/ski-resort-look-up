import { gql } from '@apollo/client';

// Example GraphQL queries for ski resort data
// These would be used with a real GraphQL API

export const GET_SKI_RESORTS = gql`
  query GetSkiResorts($filters: SkiResortFilters) {
    skiResorts(filters: $filters) {
      id
      name
      location {
        state
        city
        coordinates {
          latitude
          longitude
        }
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
      }
      trails {
        total
        beginner
        intermediate
        advanced
        expert
      }
      skiableAcres
      snowmaking {
        percentage
        acres
      }
      website
      description
      liftTicketPrice {
        adult
        child
        senior
      }
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
        coordinates {
          latitude
          longitude
        }
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
      }
      trails {
        total
        beginner
        intermediate
        advanced
        expert
      }
      skiableAcres
      snowmaking {
        percentage
        acres
      }
      seasonDates {
        opening
        closing
      }
      website
      phoneNumber
      description
      amenities
      liftTicketPrice {
        adult
        child
        senior
      }
    }
  }
`;

export const SEARCH_SKI_RESORTS = gql`
  query SearchSkiResorts($searchTerm: String!, $filters: SkiResortFilters) {
    searchSkiResorts(searchTerm: $searchTerm, filters: $filters) {
      id
      name
      location {
        state
        city
      }
      elevation {
        summit
        vertical
      }
      lifts {
        total
      }
      trails {
        total
      }
      skiableAcres
    }
  }
`;

// Example mutation for adding a new ski resort
export const ADD_SKI_RESORT = gql`
  mutation AddSkiResort($input: SkiResortInput!) {
    addSkiResort(input: $input) {
      id
      name
      location {
        state
        city
      }
    }
  }
`;

// Example subscription for live ski resort updates
export const SKI_RESORT_UPDATES = gql`
  subscription SkiResortUpdates {
    skiResortUpdated {
      id
      name
      snowmaking {
        percentage
      }
    }
  }
`;