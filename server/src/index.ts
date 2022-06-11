import 'reflect-metadata';
import 'dotenv-safe/config';
import { ApolloServerPluginLandingPageGraphQLPlayground } from 'apollo-server-core';
import { ApolloServer } from 'apollo-server-express';
import connectRedis from 'connect-redis';
import cors from 'cors';
import express from 'express';
import session from 'express-session';
import Redis from 'ioredis';

import { buildSchema } from 'type-graphql';
import { COOKIE_NAME, __prod__ } from './constants';
import { dataSource } from './dataSource';
import { ApprovedPostResolver } from './resolvers/approvedPosts';
import { PostResolver } from './resolvers/posts';
import { UserResolver } from './resolvers/user';
//import argon2 from 'argon2';

const main = async () => {
  await dataSource.initialize();
  //await dataSource.runMigrations();

  //await Post.delete({});

  // const hashedPassword = await argon2.hash('admin');
  // await dataSource.query(
  //   `
  //   insert into public.user(username, password, email, "isAdmin")
  //   values ('ADMIN', $1, 'kecthoughts@admin.com', true)
  //   `,
  //   [hashedPassword]
  // );

  const app = express();

  let RedisStore = connectRedis(session);
  let redis = new Redis({
    host: 'redis-12967.c244.us-east-1-2.ec2.cloud.redislabs.com',
    port: 12967,
    username: 'default',
    password: '8BtwGIgWBN1LbhnpEqWT0Q139sOZOp2L',
  });

  //applies cors is all routes
  app.set('trust proxy', 1);
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN,
      credentials: true,
    })
  );

  app.use(
    session({
      name: COOKIE_NAME,
      store: new RedisStore({
        client: redis,
        disableTouch: true,
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 30, // 1 month
        httpOnly: true,
        secure: __prod__, //cookie only works in https
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // must be 'none' to enable cross-site delivery
      },
      saveUninitialized: false,
      secret: 'avneoanveoanveanveoanevoa',
      resave: false,
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [PostResolver, UserResolver, ApprovedPostResolver],
      validate: false,
    }),
    plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],
    context: ({ req, res }) => ({ req, res, redis }),
  });

  await apolloServer.start();

  apolloServer.applyMiddleware({
    app,
    //cors: { origin: 'http://localhost:3000' }, //do this to only use it in apollo but we are going to set is globally
    cors: false,
  });

  app.get('/', (_, res) => {
    res.send('Hello');
  });

  const PORT = process.env.PORT;
  app.listen(PORT, () => {
    console.log(`Server started at port ${PORT}`);
  });
  // const post = orm.em.create(Post, {
  //   title: 'my first post',
  // } as RequiredEntityData<Post>);
  // await orm.em.persistAndFlush(post);
};

main();

// 8.A5MY.Z7tZhLpX
// S4sj3fshp1h6nkdin6qclz6ta3iwf180gvg88my3on0rhjr1aon
