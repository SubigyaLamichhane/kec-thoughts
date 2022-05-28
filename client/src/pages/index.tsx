import { withUrqlClient } from 'next-urql';
import React from 'react';
import Navbar from '../components/Navbar';
import { createUrqlClient } from '../utils/createUrqlClient';

interface IndexProps {}

const Index: React.FC<IndexProps> = ({}) => {
  return (
    <div>
      <Navbar />
      <h1>IndexPage</h1>
    </div>
  );
};

export default withUrqlClient(createUrqlClient)(Index);
