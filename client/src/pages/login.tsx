import { Box, Button, Link } from '@chakra-ui/react';
import { Form, Formik } from 'formik';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';
import InputField from '../components/InputField';
import Wrapper from '../components/Wrapper';
import { MeDocument, MeQuery, useLoginMutation } from '../generated/graphql';
import { withApollo } from '../utils/withApollo';

interface LoginProps {}

const Login: React.FC<LoginProps> = ({}) => {
  const router = useRouter();
  const [login] = useLoginMutation();

  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ usernameOrEmail: '', password: '' }}
        onSubmit={async (values, { setErrors }) => {
          const { data, errors } = await login({
            variables: { options: values },
            update: (cache, { data }) => {
              cache.writeQuery<MeQuery>({
                query: MeDocument,
                data: {
                  __typename: 'Query',
                  me: data?.login.user,
                },
              });
            },
          });
          if (!data.login.user) {
            alert('An error occured!!!');
          } else {
            //worked
            router.push('/');
          }
        }}
      >
        {({ values, handleChange, isSubmitting }) => (
          <Form>
            <InputField
              name="usernameOrEmail"
              placeholder="username or email"
              label="Username or Email"
              textarea={false}
            />
            <Box mt={8}>
              <InputField
                name="password"
                placeholder="password"
                label="Password"
                type="password"
                textarea={false}
              />
            </Box>
            <Box mt={8}>
              <NextLink href="/forgot-password">
                <Link>Forgot Password</Link>
              </NextLink>
            </Box>
            <Box mt={8}>
              <Button type="submit" color="teal" isLoading={isSubmitting}>
                Login
              </Button>
            </Box>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default withApollo({ ssr: false })(Login);
