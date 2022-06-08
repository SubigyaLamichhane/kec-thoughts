import { Field, Int, ObjectType } from 'type-graphql';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Post } from './Post';

@ObjectType()
@Entity()
export class User extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field(() => String)
  @CreateDateColumn()
  createdAt = new Date();

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt = new Date();

  @Field(() => String)
  @Column({ type: 'text', unique: true })
  username!: string;

  @Column({ type: 'text' })
  password!: string;

  @Field(() => String)
  @Column({ type: 'text', unique: true })
  email!: string;

  @OneToMany(() => Post, (post) => post.creator)
  posts: Post[];

  @Field(() => Boolean)
  @Column({ type: 'boolean', nullable: true })
  isAdmin: Boolean;

  @OneToMany(() => Post, (post) => post.creator)
  approvedposts: Post[];
}
