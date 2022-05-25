// import {
//   Configuration,
//   Connection,
//   IDatabaseDriver,
//   Options,
// } from '@mikro-orm/core';
import { MikroORM } from '@mikro-orm/core';
import { __prod__ } from './constants';
import { Post } from './entities/Post';
import path from 'path';
import { User } from './entities/User';

export default {
  migrations: {
    path: path.join(__dirname, './migrations'),
    pattern: /^[\w-]+\d+\.[tj]s$/,
  },
  entities: [Post, User],
  dbName: 'lireddit',
  type: 'postgresql',
  debug: !__prod__,
  user: 'postgres',
  password: 'myPassword',
  allowGlobalContext: true,
} as Parameters<typeof MikroORM.init>[0];

// | Configuration<IDatabaseDriver<Connection>>
// | Options<IDatabaseDriver<Connection>>
// | undefined;
