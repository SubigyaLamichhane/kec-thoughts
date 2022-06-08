import {
  Box,
  Button,
  Flex,
  Heading,
  Link,
  Stack,
  Text,
} from '@chakra-ui/react';
import { Form, Formik } from 'formik';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Wrapper from '../components/Wrapper';
import {
  useApprovePostMutation,
  useMeQuery,
  usePostsQuery,
} from '../generated/graphql';
import { isServer } from '../utils/isServer';
import { withApollo } from '../utils/withApollo';

interface ApprovePostProps {}

const ApprovePost: React.FC<ApprovePostProps> = ({}) => {
  const [approvePost] = useApprovePostMutation();
  const router = useRouter();

  const { data: meData, loading: meLoading } = useMeQuery({
    skip: isServer(),
  });

  const [variables, setVariables] = useState({
    limit: 10,
    cursor: null as null | string,
  });
  const { data, loading } = usePostsQuery({
    variables: {
      limit: variables.limit,
      cursor: variables.cursor,
    },
  });

  if (!loading && !data) {
    return <div>There are no posts.</div>;
  }
  if (meLoading) {
    // loading
  } else if (!meData?.me || !meData.me.isAdmin) {
    return <div>You need to be logged in as admin to Approve Posts</div>;
  } else {
    return (
      <div>
        <Navbar />
        <Wrapper>
          <Flex mb={10} mt={10}>
            <Heading>Kec Thoughts</Heading>
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
                  <Formik
                    initialValues={{ title: '', text: '' }}
                    onSubmit={async (values, { setErrors }) => {
                      const response = await approvePost({
                        variables: { id: post.id },
                        update: (cache) => {
                          cache.evict({ fieldName: 'approvedPosts:{}' });
                          cache.evict({ id: 'Post:' + post.id });
                        },
                      });
                      if (!response.data?.approvePost) {
                        alert('Approve Post Failed');
                      }
                    }}
                  >
                    {({ values, handleChange, isSubmitting }) => (
                      <Form>
                        <Box mt={8}>
                          <Button
                            type="submit"
                            color="teal"
                            isLoading={isSubmitting}
                          >
                            ApprovePost
                          </Button>
                        </Box>
                      </Form>
                    )}
                  </Formik>
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
  }

  return <div>An Error Occured.</div>;
};

export default withApollo({ ssr: true })(ApprovePost);
