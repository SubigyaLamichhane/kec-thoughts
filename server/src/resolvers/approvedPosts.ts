import { MyContext } from 'src/types';
import { isAuth } from '../utils/middleware/isAuth';
import {
  Arg,
  Ctx,
  Field,
  FieldResolver,
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
import { isAdmin } from '../utils/middleware/isAdmin';
import { ApprovedPost } from '../entities/ApprovedPosts';

@ObjectType()
class PaginatedApprovedPosts {
  @Field(() => [ApprovedPost])
  posts: ApprovedPost[];

  @Field()
  hasMore: boolean;
}

@Resolver(ApprovedPost)
export class ApprovedPostResolver {
  @FieldResolver()
  textSnippet(@Root() root: ApprovedPost): String {
    return root.text.slice(0, 50);
  }

  @Query(() => PaginatedApprovedPosts)
  async approvedPosts(
    @Arg('limit', () => Int) limit: number,
    @Arg('cursor', () => String, { nullable: true }) cursor: string | null
  ): Promise<PaginatedApprovedPosts> {
    const realLimit = limit >= 50 ? 50 : limit;
    const realLimitPlusOne = realLimit + 1;

    const post = dataSource
      .getRepository(ApprovedPost)
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

  @Query(() => ApprovedPost, { nullable: true })
  post(@Arg('id') id: number): Promise<ApprovedPost | null> {
    return ApprovedPost.findOne({ where: { id } });
  }

  @Mutation(() => ApprovedPost)
  @UseMiddleware(isAuth, isAdmin)
  async approvePost(
    @Arg('id', () => Int) postId: number,
    @Ctx() { req }: MyContext
  ): Promise<ApprovedPost | { error: string }> {
    const post = await Post.findOne({ where: { id: postId } });
    if (!post) {
      return {
        error: 'Post not found in the database.',
      };
    }
    const { creator, creatorId, id, text, title, updatedAt } = post;
    const approvedPost = await ApprovedPost.create({
      creator,
      creatorId,
      id,
      text,
      title,
      updatedAt,
      approverId: req.session.userId,
    }).save();

    await Post.delete({ id: post.id });

    return approvedPost;
  }

  @Mutation(() => ApprovedPost, { nullable: true })
  @UseMiddleware(isAuth)
  @UseMiddleware(isAdmin)
  async updatePost(
    @Arg('id', () => Int) id: number,
    @Arg('title', () => String, { nullable: true }) title: string
  ): Promise<ApprovedPost | null> {
    const post = await ApprovedPost.findOne({ where: { id } });
    if (!post) {
      return null;
    }
    if (typeof title !== 'undefined') {
      await ApprovedPost.update({ id }, { title });
    }
    return post;
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  @UseMiddleware(isAdmin)
  async deletePost(@Arg('id') id: number): Promise<boolean> {
    try {
      await ApprovedPost.delete(id);
    } catch {
      return false;
    }
    return true;
  }
}
