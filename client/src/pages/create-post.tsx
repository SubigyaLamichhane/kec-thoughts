import { Box, Button } from '@chakra-ui/react';
import { Form, Formik } from 'formik';
import { useRouter } from 'next/router';
import React from 'react';
import InputField from '../components/InputField';
import Wrapper from '../components/Wrapper';
import { useCreatePostMutation } from '../generated/graphql';
import { withApollo } from '../utils/withApollo';

interface CreatePostProps {}

const CreatePost: React.FC<CreatePostProps> = ({}) => {
  const [createPost] = useCreatePostMutation();
  const router = useRouter();

  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ title: '', text: '' }}
        onSubmit={async (values, { setErrors }) => {
          const response = await createPost({
            variables: { input: values },
            update: (cache) => {
              cache.evict({ fieldName: 'posts:{}' });
            },
          });
          if (response.data?.createPost) {
            router.push('/');
            alert(
              'Your post is in the process of being reveiwed and approved by the admin.'
            );
          }
        }}
      >
        {({ values, handleChange, isSubmitting }) => (
          <Form>
            <InputField
              textarea={false}
              name="title"
              placeholder="title"
              label="Title"
            />
            <Box mt={8}>
              <InputField
                name="text"
                placeholder="text..."
                label="Body"
                textarea={true}
              />
            </Box>
            <Box mt={8}>
              <Button type="submit" color="teal" isLoading={isSubmitting}>
                Create Post
              </Button>
            </Box>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default withApollo({ ssr: false })(CreatePost);
