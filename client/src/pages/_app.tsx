import { ChakraProvider } from '@chakra-ui/react';
import { AppProps } from 'next/app';
import theme from '../theme';
import { ApolloProvider, ApolloClient, InMemoryCache } from '@apollo/client';
import { PaginatedApprovedPosts, PaginatedPosts } from '../generated/graphql';

// const client = new ApolloClient({
//   // uri: process.env.GRAPHQL_SERVER as string,
//   uri: 'http://localhost:5000/graphql',
//   cache: new InMemoryCache({
//     typePolicies: {
//       Query: {
//         fields: {
//           approvedPosts: {
//             keyArgs: [], // Enter the variables that are not related to paginatoin eg ['query']
//             merge(
//               existing: PaginatedApprovedPosts | undefined,
//               incoming: PaginatedApprovedPosts
//             ): PaginatedApprovedPosts {
//               console.log(incoming, existing);
//               return {
//                 __typename: 'PaginatedApprovedPosts',
//                 hasMore: incoming.hasMore,
//                 posts: [...(existing?.posts || []), ...incoming.posts],
//               };
//             },
//           },
//         },
//       },
//     },
//   }),
//   credentials: 'include',
// });

function MyApp({ Component, pageProps }: AppProps) {
  return (
    // <ApolloProvider client={client}>
    <ChakraProvider resetCSS theme={theme}>
      <Component {...pageProps} />
    </ChakraProvider>
    // </ApolloProvider>
  );
}

export default MyApp;
