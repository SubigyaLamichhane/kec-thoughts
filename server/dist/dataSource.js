"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dataSource = void 0;
const typeorm_1 = require("typeorm");
const Post_1 = require("./entities/Post");
const User_1 = require("./entities/User");
const path_1 = __importDefault(require("path"));
const ApprovedPosts_1 = require("./entities/ApprovedPosts");
exports.dataSource = new typeorm_1.DataSource({
    url: process.env.DATABASE_URL,
    type: 'postgres',
    logging: false,
    synchronize: true,
    entities: [Post_1.Post, User_1.User, ApprovedPosts_1.ApprovedPost],
    migrations: [path_1.default.join(__dirname, './migrations/*')],
    ssl: {
        rejectUnauthorized: false,
    },
});
//# sourceMappingURL=dataSource.js.map