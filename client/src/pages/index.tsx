import {
  Box,
  Button,
  Flex,
  Heading,
  Link,
  Stack,
  Text,
} from '@chakra-ui/react';
import NextLink from 'next/link';
import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Wrapper from '../components/Wrapper';
import { useApprovedPostsQuery, useMeQuery } from '../generated/graphql';
import { isServer } from '../utils/isServer';
import { withApollo } from '../utils/withApollo';

interface IndexProps {}

const Index: React.FC<IndexProps> = ({}) => {
  const { data, loading, fetchMore, variables } = useApprovedPostsQuery({
    variables: {
      limit: 15,
      cursor: null,
    },
  });
  const { data: meData, loading: MeLoading } = useMeQuery({
    skip: isServer(),
  });

  if (!loading && !data) {
    return <div>There are no posts.</div>;
  }

  return (
    <div>
      <Navbar />
      <Wrapper>
        <Flex mb={10} mt={10}>
          <Heading>Kec Thoughts</Heading>
          {meData
            ? meData?.me && (
                <NextLink href="/create-post">
                  <Link ml={'auto'}>Create Post</Link>
                </NextLink>
              )
            : null}
        </Flex>
        <Stack spacing={8}>
          {data &&
            data.approvedPosts.posts.map((post) => (
              <Box key={post.id} p={5} shadow="md" borderWidth={'1px'}>
                <Heading fontSize={'xl'}>{post.title}</Heading>
                <Text mt={4}>{post.textSnippet}</Text>
              </Box>
            ))}
        </Stack>
        {data && data.approvedPosts.hasMore ? (
          <Flex>
            <Button
              onClick={() =>
                fetchMore({
                  variables: {
                    limit: variables!.limit,
                    cursor:
                      data.approvedPosts.posts[
                        data.approvedPosts.posts.length - 1
                      ].createdAt,
                  },
                })
              }
              m={'auto'}
            >
              Load More
            </Button>
          </Flex>
        ) : null}
      </Wrapper>
    </div>
  );
};

export default withApollo({ ssr: true })(Index);
