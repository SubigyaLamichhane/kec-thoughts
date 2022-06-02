import {
  Box,
  Heading,
  Text,
  Stack,
  Flex,
  Link,
  Button,
} from '@chakra-ui/react';
import { withUrqlClient } from 'next-urql';
import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { usePostsQuery } from '../generated/graphql';
import { createUrqlClient } from '../utils/createUrqlClient';
import NextLink from 'next/link';
import Wrapper from '../components/Wrapper';

interface IndexProps {}

const Index: React.FC<IndexProps> = ({}) => {
  const [variables, setVariables] = useState({
    limit: 10,
    cursor: null as null | string,
  });
  const [{ data, fetching }] = usePostsQuery({
    variables: {
      limit: variables.limit,
      cursor: variables.cursor,
    },
  });

  console.log(data);

  if (!fetching && !data) {
    return <div>There are no posts.</div>;
  }

  return (
    <div>
      <Navbar />
      <Wrapper>
        <Flex mb={10} mt={10}>
          <Heading>LiReddit</Heading>
          <NextLink href="/create-post">
            <Link ml={'auto'}>Create Post</Link>
          </NextLink>
        </Flex>
        <Stack spacing={8}>
          {data &&
            data.posts.posts.map((post) => (
              <Box key={post.id} p={5} shadow="md" borderWidth={'1px'}>
                <Heading fontSize={'xl'}>{post.title}</Heading>
                <Text mt={4}>{post.textSnippet}</Text>
              </Box>
            ))}
        </Stack>
        {data && data.posts.hasMore ? (
          <Flex>
            <Button
              onClick={() =>
                setVariables({
                  limit: variables.limit,
                  cursor:
                    data.posts.posts[data.posts.posts.length - 1].createdAt,
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

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
