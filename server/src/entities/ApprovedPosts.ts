import { Field, Int, ObjectType } from 'type-graphql';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './User';

@ObjectType()
@Entity()
export class ApprovedPost extends BaseEntity {
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
  @Column({ type: 'text' })
  title!: string;

  @Field()
  @Column()
  text!: string;

  @Field()
  @ManyToOne(() => User, (user) => user.posts)
  creator: User;

  @Field()
  @Column()
  creatorId!: number;

  @Field()
  @Column()
  approverId!: number;

  @Field()
  @ManyToOne(() => User, (user) => user.posts)
  approvedBy: User;
}
