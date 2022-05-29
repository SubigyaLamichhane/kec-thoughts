import { Box, Button } from '@chakra-ui/react';
import { Form, Formik } from 'formik';
import { isConstValueNode } from 'graphql';
import { withUrqlClient } from 'next-urql';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import InputField from '../components/InputField';
import Wrapper from '../components/Wrapper';
import { useForgotPasswordMutation } from '../generated/graphql';
import { createUrqlClient } from '../utils/createUrqlClient';

interface ForgotPasswordProps {}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({}) => {
  const [complete, setComplete] = useState(false);
  const [, forgotPassword] = useForgotPasswordMutation();
  const router = useRouter();

  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ email: '' }}
        onSubmit={async (values, { setErrors }) => {
          const response = await forgotPassword({
            email: values.email,
          });
          console.log(response);
          setComplete(true);
        }}
      >
        {({ values, handleChange, isSubmitting }) =>
          complete ? (
            <Box>Check your email</Box>
          ) : (
            <Form>
              <Box mt={8}>
                <InputField
                  name="email"
                  placeholder="your email"
                  label="Email"
                  type="email"
                />
              </Box>
              <Box mt={8}>
                <Button type="submit" color="teal" isLoading={isSubmitting}>
                  Send Email Verification
                </Button>
              </Box>
            </Form>
          )
        }
      </Formik>
    </Wrapper>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(ForgotPassword);
