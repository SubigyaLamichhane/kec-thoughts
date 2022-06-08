import React from 'react';
import { Box, Button, Flex, Link } from '@chakra-ui/react';
import NextLink from 'next/link';
import { useLogoutMutation, useMeQuery } from '../generated/graphql';
import { isServer } from '../utils/isServer';
import { useApolloClient } from '@apollo/client';

interface NavbarProps {}

const Navbar: React.FC<NavbarProps> = ({}) => {
  const apolloClient = useApolloClient();
  const { data, loading } = useMeQuery({
    skip: isServer(),
  });
  const [logout, { loading: logoutLoading }] = useLogoutMutation();

  let body = null;
  if (loading) {
    // loading
  } else if (!data?.me) {
    // User is not logged in
    body = (
      <Box ml={'auto'}>
        <NextLink href={'/login'}>
          <Link mr={2} color="white">
            Login
          </Link>
        </NextLink>
        <NextLink href={'/register'}>
          <Link mr={2} color="white">
            Register
          </Link>
        </NextLink>
      </Box>
    );
  } else {
    // User is logged in
    body = (
      <Box ml={'auto'}>
        <NextLink href={'/'}>
          <Link mr={2} color="white">
            {data.me.username}
          </Link>
        </NextLink>
        <Button
          mr={2}
          color="white"
          variant={'link'}
          onClick={async () => {
            await logout();
            await apolloClient.resetStore();
          }}
          isLoading={logoutLoading}
        >
          Logout
        </Button>
        {data.me.isAdmin && (
          <NextLink href={'/approve-post'}>
            <Link mr={2} color="white">
              Approve Posts
            </Link>
          </NextLink>
        )}
      </Box>
    );
  }

  return (
    <Box bg="grey" p={4}>
      <Flex>
        Kec Thoughts
        {body}
      </Flex>
    </Box>
  );
};

export default Navbar;
