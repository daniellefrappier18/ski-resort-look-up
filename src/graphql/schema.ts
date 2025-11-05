import { gql } from '@apollo/client';

export const typeDefs = gql`
  type Location {
    state: String!
    city: String
    coordinates: Coordinates
  }

  type Coordinates {
    lat: Float
    lng: Float
  }

  type Elevation {
    base: Int
    summit: Int
    vertical: Int
  }

  type Lifts {
    total: Int!
    chairlifts: Int!
    surfaceLifts: Int!
    gondolas: Int!
    funiculars: Int!
    fixedGripOnly: Boolean!
  }

  type Trails {
    totalKm: Float
    beginnerKm: Float
    intermediateKm: Float
    advancedKm: Float
  }

  type SkiResort {
    id: ID!
    name: String!
    location: Location!
    elevation: Elevation!
    lifts: Lifts!
    trails: Trails!
    skiableAcres: Float
    seasonDates: String
    website: String
    url: String
    trail_map_url: String
    adult_pass_price: Float
    child_pass_price: Float
  }

  input ResortFilters {
    state: String
    minElevation: Int
    maxElevation: Int
    minLifts: Int
    minSlopeKm: Float
    minSkiableAcres: Int
    fixedGripOnly: Boolean
  }

  type Query {
    skiResorts(filters: ResortFilters, search: String): [SkiResort!]!
    skiResort(id: ID!): SkiResort
    searchResorts(query: String!): [SkiResort!]!
    resortsByState(state: String!): [SkiResort!]!
    fixedGripResorts: [SkiResort!]!
    states: [String!]!
  }
`;