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
exports.dataSource = new typeorm_1.DataSource({
    type: 'postgres',
    database: 'lireddit3',
    username: 'liredit3',
    password: 'postgres',
    logging: false,
    synchronize: true,
    entities: [Post_1.Post, User_1.User],
    migrations: [path_1.default.join(__dirname, './migrations/*')],
});
//# sourceMappingURL=dataSource.js.map