import { MyContext } from 'src/types';
import { isAuth } from '../utils/middleware/isAuth';
import {
  Arg,
  Ctx,
  Field,
  FieldResolver,
  InputType,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  Root,
  UseMiddleware,
} from 'type-graphql';
import { Post } from '../entities/Post';
import { dataSource } from '../dataSource';

@InputType()
class PostInput {
  @Field()
  title: string;
  @Field()
  text: string;
}

@ObjectType()
class PaginatedPosts {
  @Field(() => [Post])
  posts: Post[];

  @Field()
  hasMore: boolean;
}

@Resolver(Post)
export class PostResolver {
  @FieldResolver()
  textSnippet(@Root() root: Post): String {
    return root.text.slice(0, 50);
  }

  @Query(() => PaginatedPosts)
  async posts(
    @Arg('limit', () => Int) limit: number,
    @Arg('cursor', () => String, { nullable: true }) cursor: string | null
  ): Promise<PaginatedPosts> {
    const realLimit = limit >= 50 ? 50 : limit;
    const realLimitPlusOne = realLimit + 1;

    // const replacements: any[] = [realLimitPlusOne];

    // if (cursor) {
    //   replacements.push(new Date(parseInt(cursor)));
    // }

    // const posts = await dataSource.query(
    //   `
    //   select p.*,
    //   json_build_object(
    //     'id', u.id,
    //     'username', u.username,
    //     'email', u.email,
    //     'createdAt', u."createdAt",
    //     'updatedAt', u."updatedAt",
    //     ) creator
    //   from post p
    //   inner join public.user u on u.id = p."creatorId"
    //   ${cursor ? 'where p."createdAt" < $2' : ''}
    //   order by p."createdAt" DESC
    //   limit $1
    // `,
    //   replacements
    // );

    const post = dataSource
      .getRepository(Post)
      .createQueryBuilder('p')
      //.innerJoinAndSelect('p.creator', 'u', 'u.id = p."creatorId"')
      .orderBy('"createdAt"', 'DESC') // if we dont put double quotes the A will be lowecased and error
      .take(realLimitPlusOne);
    if (cursor) {
      post.where('p."createdAt" < :cursor', {
        cursor: new Date(parseInt(cursor)),
      });
    }

    const posts = await post.getMany();

    const postsWithHasMore = {
      posts: posts.slice(0, realLimit),
      hasMore: posts.length === realLimitPlusOne,
    };

    return postsWithHasMore;
  }

  @Query(() => Post, { nullable: true })
  post(@Arg('id') id: number): Promise<Post | null> {
    return Post.findOne({ where: { id } });
  }

  @Mutation(() => Post)
  @UseMiddleware(isAuth)
  async createPost(
    @Arg('input') input: PostInput,
    @Ctx() { req }: MyContext
  ): Promise<Post> {
    const post = await Post.create({
      ...input,
      creatorId: req.session.userId,
    }).save();

    return post;
  }

  @Mutation(() => Post, { nullable: true })
  async updatePost(
    @Arg('id', () => Int) id: number,
    @Arg('title', () => String, { nullable: true }) title: string
  ): Promise<Post | null> {
    const post = await Post.findOne({ where: { id } });
    if (!post) {
      return null;
    }
    if (typeof title !== 'undefined') {
      await Post.update({ id }, { title });
    }
    return post;
  }

  @Mutation(() => Boolean)
  async deletePost(@Arg('id') id: number): Promise<boolean> {
    try {
      await Post.delete(id);
    } catch {
      return false;
    }
    return true;
  }
}
