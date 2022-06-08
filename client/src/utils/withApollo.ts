import { withApollo as createWithApollo } from 'next-apollo';
import { ApolloClient, InMemoryCache } from '@apollo/client';
import { PaginatedApprovedPosts } from '../generated/graphql';

const client = (ctx) =>
  new ApolloClient({
    // uri: process.env.GRAPHQL_SERVER as string,
    uri: process.env.NEXT_PUBLIC_API_URL,
    credentials: 'include',
    headers: {
      cookie:
        (typeof window === 'undefined'
          ? ctx?.req?.headers.cookie
          : undefined) || '',
    },
    cache: new InMemoryCache({
      typePolicies: {
        Query: {
          fields: {
            approvedPosts: {
              keyArgs: [], // Enter the variables that are not related to paginatoin eg ['query']
              merge(
                existing: PaginatedApprovedPosts | undefined,
                incoming: PaginatedApprovedPosts
              ): PaginatedApprovedPosts {
                return {
                  __typename: 'PaginatedApprovedPosts',
                  hasMore: incoming.hasMore,
                  posts: [...(existing?.posts || []), ...incoming.posts],
                };
              },
            },
          },
        },
      },
    }),
  });

export const withApollo = createWithApollo(client);
