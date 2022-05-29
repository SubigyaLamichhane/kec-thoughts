import { Box, Button } from '@chakra-ui/react';
import { Form, Formik } from 'formik';
import { NextPage } from 'next';
import { withUrqlClient } from 'next-urql';
import { useRouter } from 'next/router';
import { useState } from 'react';
import InputField from '../../components/InputField';
import Wrapper from '../../components/Wrapper';
import { useChangePasswordMutation } from '../../generated/graphql';
import { createUrqlClient } from '../../utils/createUrqlClient';
import { toErrorMap } from '../../utils/toErrorMap';

const ChangePassword: NextPage<{ token: string }> = ({ token }) => {
  const router = useRouter();
  const [, changePassword] = useChangePasswordMutation();
  const [tokenError, setTokenError] = useState('');
  const [passwordMismatchError, setPasswordMismatchError] = useState('');

  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ confirmPassword: '', newPassword: '' }}
        onSubmit={async (values, { setErrors }) => {
          if (values.newPassword !== values.confirmPassword) {
            setPasswordMismatchError("The passwords don't match");
          } else {
            setPasswordMismatchError('');
            const response = await changePassword({
              newPassword: values.newPassword,
              token,
            });

            if (response.data?.changePassword.errors) {
              const errorMap = toErrorMap(response.data.changePassword.errors);
              if ('token' in errorMap) {
                setTokenError(errorMap.token);
              }
              setErrors(errorMap);
            } else if (response.data?.changePassword.user) {
              router.push('/');
            }
          }
        }}
      >
        {({ values, handleChange, isSubmitting }) => (
          <Form>
            {passwordMismatchError && (
              <Box color="red">{passwordMismatchError}</Box>
            )}
            {tokenError && <Box color="red">{tokenError}</Box>}
            <InputField
              name="newPassword"
              placeholder="new password"
              label="New Password"
              type="password"
            />

            <Box mt={8}>
              <InputField
                name="confirmPassword"
                placeholder="type again"
                label="Confirm Password"
                type="password"
              />
            </Box>
            <Box mt={8}>
              <Button type="submit" color="teal" isLoading={isSubmitting}>
                Change Password
              </Button>
            </Box>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

ChangePassword.getInitialProps = ({ query }) => {
  return {
    token: query.token as string,
  };
};

export default withUrqlClient(createUrqlClient)(ChangePassword);
