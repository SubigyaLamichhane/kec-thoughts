import { cacheExchange, Resolver, Cache } from '@urql/exchange-graphcache';
import { dedupExchange, fetchExchange, gql } from 'urql';
import {
  LogoutMutation,
  MeQuery,
  MeDocument,
  LoginMutation,
  RegisterMutation,
  CreatePostMutation,
  PostsQuery,
  PostsDocument,
  ApprovedPostsDocument,
  ApprovedPostsQuery,
  ApprovePostMutation,
} from '../generated/graphql';
import { betterUpdateQuery } from './betterUpdateQuery';

const cursorPagination = (): Resolver => {
  return (_parent, fieldArgs, cache, info) => {
    const { parentKey: entityKey, fieldName } = info;
    const allFileds = cache.inspectFields(entityKey);
    const fieldInfos = allFileds.filter((info) => info.fieldName === fieldName);
    const size = fieldInfos.length;
    if (size === 0) {
      return undefined;
    }

    const fieldKey = `${fieldName}(${JSON.stringify(fieldArgs)})`;
    const isItInTheCache = cache.resolve(
      cache.resolve(entityKey, fieldKey) as string,
      'posts'
      //entityKey,
    );
    info.partial = !isItInTheCache;
    let newHasMore = true;
    const results: string[] = [];
    fieldInfos.forEach((fi) => {
      const key = cache.resolve(entityKey, fi.fieldKey) as string;
      const posts = cache.resolve(key, 'posts') as string[];
      const hasMore = cache.resolve(key, 'hasMore');
      if (!hasMore) {
        newHasMore = hasMore as boolean;
      }
      results.push(...posts);
    });

    return {
      __typename: 'PaginatedPosts',
      hasMore: newHasMore,
      posts: results,
    };
  };
};

// function invalidateAllPosts(cache: Cache) {
//   const allFields = cache.inspectFields('Query');
//   const fieldInfos = allFields.filter((info) => info.fieldName === 'posts');
//   fieldInfos.forEach((fi) => {
//     cache.invalidate('Query', 'posts', fi.arguments || {});
//   });
// }

export const createUrqlClient = (ssrExchange: any) => ({
  url: 'http://localhost:5000/graphql',
  fetchOptions: {
    credentials: 'include' as const,
  },
  exchanges: [
    dedupExchange,
    cacheExchange({
      keys: {
        PaginatedPosts: () => null,
      },
      resolvers: {
        Query: {
          posts: cursorPagination(),
        },
      },
      updates: {
        Mutation: {
          approvePost: (result, args, cache, info) => {
            cache.updateQuery;
            cache.updateQuery({ query: ApprovedPostsDocument }, (data) => {
              // @ts-ignore
              data.approvedPosts.posts.unshift(result.approvePost);
              return data;
            });
          },
          createPost: (result, args, cache, info) => {
            cache.updateQuery;
            cache.updateQuery({ query: PostsDocument }, (data) => {
              // @ts-ignore
              data.posts.posts.unshift(result.createPost);
              return data;
            });
          },
          logout: (result, args, cache, info) => {
            cache.updateQuery;
            betterUpdateQuery<LogoutMutation, MeQuery>(
              cache,
              { query: MeDocument },
              result,
              (result, query) => {
                return { me: null };
              }
            );
          },
          login: (result, args, cache, info) => {
            console.log('ran');
            cache.updateQuery;
            betterUpdateQuery<LoginMutation, MeQuery>(
              cache,
              { query: MeDocument },
              result,
              (result, query) => {
                if (result.login.errors) {
                  console.log(query);
                  return query;
                } else {
                  return {
                    me: result.login.user,
                  };
                }
              }
            );
          },
          register: (result, args, cache, info) => {
            cache.updateQuery;
            betterUpdateQuery<RegisterMutation, MeQuery>(
              cache,
              { query: MeDocument },
              result,
              (result, query) => {
                if (result.register.errors) {
                  return query;
                } else {
                  return {
                    me: result.register.user,
                  };
                }
              }
            );
          },
        },
      },
    }),
    ssrExchange,
    fetchExchange,
  ],
});
