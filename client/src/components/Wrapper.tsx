import React from 'react';
import { Box, Flex } from '@chakra-ui/react';

interface WrapperProps {
  variant?: 'small' | 'regular';
}

const Wrapper: React.FC<WrapperProps> = ({ children, variant = 'regular' }) => {
  return (
    <Flex>
      <Box
        mt={8}
        maxW={variant === 'regular' ? '800px' : '400px'}
        w="100%"
        m={'auto'}
        marginTop={10}
      >
        {children}
      </Box>
    </Flex>
  );
};

export default Wrapper;
