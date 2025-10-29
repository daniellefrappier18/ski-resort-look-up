import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';

// For now, we'll use a mock GraphQL endpoint
// Later you can replace this with a real GraphQL API for ski resort data
const httpLink = createHttpLink({
  uri: 'https://countries.trevorblades.com/graphql', // Temporary endpoint for testing
});

const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
    },
    query: {
      errorPolicy: 'all',
    },
  },
});

export default client;