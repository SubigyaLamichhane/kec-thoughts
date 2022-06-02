import { ApolloServerPluginLandingPageGraphQLPlayground } from 'apollo-server-core';
import { ApolloServer } from 'apollo-server-express';
import connectRedis from 'connect-redis';
import cors from 'cors';
import express from 'express';
import session from 'express-session';
import Redis from 'ioredis';
import 'reflect-metadata';
import { buildSchema } from 'type-graphql';
import { COOKIE_NAME, __prod__ } from './constants';
import { dataSource } from './dataSource';
import { PostResolver } from './resolvers/posts';
import { UserResolver } from './resolvers/user';

const main = async () => {
  await dataSource.initialize();
  await dataSource.runMigrations();

  //await Post.delete({});

  const app = express();

  let RedisStore = connectRedis(session);
  let redis = new Redis();

  //applies cors is all routes
  app.use(
    cors({
      origin: 'http://localhost:3000',
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
        sameSite: 'lax', //csrf
        secure: __prod__, //cookie only works in https
      },
      saveUninitialized: false,
      secret: 'avneoanveoanveanveoanevoa',
      resave: false,
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [PostResolver, UserResolver],
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

  app.listen(5000, () => {
    console.log('Server started at port localhost:5000');
  });
  // const post = orm.em.create(Post, {
  //   title: 'my first post',
  // } as RequiredEntityData<Post>);
  // await orm.em.persistAndFlush(post);
};

main();
