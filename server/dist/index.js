"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
require("dotenv-safe/config");
const apollo_server_core_1 = require("apollo-server-core");
const apollo_server_express_1 = require("apollo-server-express");
const connect_redis_1 = __importDefault(require("connect-redis"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const express_session_1 = __importDefault(require("express-session"));
const ioredis_1 = __importDefault(require("ioredis"));
const type_graphql_1 = require("type-graphql");
const constants_1 = require("./constants");
const dataSource_1 = require("./dataSource");
const approvedPosts_1 = require("./resolvers/approvedPosts");
const posts_1 = require("./resolvers/posts");
const user_1 = require("./resolvers/user");
const main = async () => {
    await dataSource_1.dataSource.initialize();
    const app = (0, express_1.default)();
    let RedisStore = (0, connect_redis_1.default)(express_session_1.default);
    let redis = new ioredis_1.default({
        host: 'redis-12967.c244.us-east-1-2.ec2.cloud.redislabs.com',
        port: 12967,
        username: 'default',
        password: '8BtwGIgWBN1LbhnpEqWT0Q139sOZOp2L',
    });
    app.set('trust proxy', 1);
    app.use((0, cors_1.default)({
        origin: process.env.CORS_ORIGIN,
        credentials: true,
    }));
    app.use((0, express_session_1.default)({
        name: constants_1.COOKIE_NAME,
        store: new RedisStore({
            client: redis,
            disableTouch: true,
        }),
        cookie: {
            maxAge: 1000 * 60 * 60 * 24 * 30,
            httpOnly: true,
            secure: constants_1.__prod__,
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        },
        saveUninitialized: false,
        secret: 'avneoanveoanveanveoanevoa',
        resave: false,
    }));
    const apolloServer = new apollo_server_express_1.ApolloServer({
        schema: await (0, type_graphql_1.buildSchema)({
            resolvers: [posts_1.PostResolver, user_1.UserResolver, approvedPosts_1.ApprovedPostResolver],
            validate: false,
        }),
        plugins: [(0, apollo_server_core_1.ApolloServerPluginLandingPageGraphQLPlayground)()],
        context: ({ req, res }) => ({ req, res, redis }),
    });
    await apolloServer.start();
    apolloServer.applyMiddleware({
        app,
        cors: false,
    });
    app.get('/', (_, res) => {
        res.send('Hello');
    });
    const PORT = process.env.PORT;
    app.listen(PORT, () => {
        console.log(`Server started at port ${PORT}`);
    });
};
main();
//# sourceMappingURL=index.js.map