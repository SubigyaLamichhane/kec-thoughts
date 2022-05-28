import React from 'react';
import { Box, Button, Flex, Link } from '@chakra-ui/react';
import NextLink from 'next/link';
import { useLogoutMutation, useMeQuery } from '../generated/graphql';

interface NavbarProps {}

const Navbar: React.FC<NavbarProps> = ({}) => {
  const [{ data, fetching }] = useMeQuery();
  const [{ fetching: logoutFetching }, logout] = useLogoutMutation();

  let body = null;
  if (fetching) {
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
          color="white"
          variant={'link'}
          onClick={() => {
            logout();
          }}
          isLoading={logoutFetching}
        >
          Logout
        </Button>
      </Box>
    );
  }

  return (
    <Box bg="grey" p={4}>
      <Flex>
        Navbar
        {body}
      </Flex>
    </Box>
  );
};

export default Navbar;
