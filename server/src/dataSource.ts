import { DataSource } from 'typeorm';
import { Post } from './entities/Post';
import { User } from './entities/User';
import path from 'path';

export const dataSource = new DataSource({
  type: 'postgres',
  database: 'lireddit3',
  username: 'liredit3',
  password: 'postgres',
  logging: false,
  synchronize: true,
  entities: [Post, User],
  migrations: [path.join(__dirname, './migrations/*')],
});
