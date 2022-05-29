import { withUrqlClient } from 'next-urql';
import React from 'react';
import Navbar from '../components/Navbar';
import { usePostsQuery } from '../generated/graphql';
import { createUrqlClient } from '../utils/createUrqlClient';

interface IndexProps {}

const Index: React.FC<IndexProps> = ({}) => {
  const [{ data }] = usePostsQuery();

  return (
    <div>
      <Navbar />
      {data && data.posts.map((p) => <div key={p.id}>{p.title}</div>)}
    </div>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
