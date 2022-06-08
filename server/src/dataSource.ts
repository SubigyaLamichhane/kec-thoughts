import { DataSource } from 'typeorm';
import { Post } from './entities/Post';
import { User } from './entities/User';
import path from 'path';
import { ApprovedPost } from './entities/ApprovedPosts';
import { __prod__ } from './constants';

export const dataSource = new DataSource({
  url: process.env.DATABASE_URL,
  type: 'postgres',
  // host: 'localhost',
  // database: 'lireddit3',
  // username: 'liredit3',
  // password: 'postgres',
  logging: false,
  synchronize: true,
  entities: [Post, User, ApprovedPost],
  migrations: [path.join(__dirname, './migrations/*')],
  ssl: {
    rejectUnauthorized: false,
  },
});
