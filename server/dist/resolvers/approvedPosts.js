"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApprovedPostResolver = void 0;
const isAuth_1 = require("../utils/middleware/isAuth");
const type_graphql_1 = require("type-graphql");
const Post_1 = require("../entities/Post");
const dataSource_1 = require("../dataSource");
const isAdmin_1 = require("../utils/middleware/isAdmin");
const ApprovedPosts_1 = require("../entities/ApprovedPosts");
let PaginatedApprovedPosts = class PaginatedApprovedPosts {
};
__decorate([
    (0, type_graphql_1.Field)(() => [ApprovedPosts_1.ApprovedPost]),
    __metadata("design:type", Array)
], PaginatedApprovedPosts.prototype, "posts", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", Boolean)
], PaginatedApprovedPosts.prototype, "hasMore", void 0);
PaginatedApprovedPosts = __decorate([
    (0, type_graphql_1.ObjectType)()
], PaginatedApprovedPosts);
let ApprovedPostResolver = class ApprovedPostResolver {
    textSnippet(root) {
        return root.text.slice(0, 50);
    }
    async approvedPosts(limit, cursor) {
        const realLimit = limit >= 50 ? 50 : limit;
        const realLimitPlusOne = realLimit + 1;
        const post = dataSource_1.dataSource
            .getRepository(ApprovedPosts_1.ApprovedPost)
            .createQueryBuilder('p')
            .orderBy('"createdAt"', 'DESC')
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
    post(id) {
        return ApprovedPosts_1.ApprovedPost.findOne({ where: { id } });
    }
    async approvePost(postId, { req }) {
        const post = await Post_1.Post.findOne({ where: { id: postId } });
        if (!post) {
            return {
                error: 'Post not found in the database.',
            };
        }
        const { creator, creatorId, id, text, title, updatedAt } = post;
        const approvedPost = await ApprovedPosts_1.ApprovedPost.create({
            creator,
            creatorId,
            id,
            text,
            title,
            updatedAt,
            approverId: req.session.userId,
        }).save();
        await Post_1.Post.delete({ id: post.id });
        return approvedPost;
    }
    async updatePost(id, title) {
        const post = await ApprovedPosts_1.ApprovedPost.findOne({ where: { id } });
        if (!post) {
            return null;
        }
        if (typeof title !== 'undefined') {
            await ApprovedPosts_1.ApprovedPost.update({ id }, { title });
        }
        return post;
    }
    async deletePost(id) {
        try {
            await ApprovedPosts_1.ApprovedPost.delete(id);
        }
        catch (_a) {
            return false;
        }
        return true;
    }
};
__decorate([
    (0, type_graphql_1.FieldResolver)(),
    __param(0, (0, type_graphql_1.Root)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ApprovedPosts_1.ApprovedPost]),
    __metadata("design:returntype", String)
], ApprovedPostResolver.prototype, "textSnippet", null);
__decorate([
    (0, type_graphql_1.Query)(() => PaginatedApprovedPosts),
    __param(0, (0, type_graphql_1.Arg)('limit', () => type_graphql_1.Int)),
    __param(1, (0, type_graphql_1.Arg)('cursor', () => String, { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], ApprovedPostResolver.prototype, "approvedPosts", null);
__decorate([
    (0, type_graphql_1.Query)(() => ApprovedPosts_1.ApprovedPost, { nullable: true }),
    __param(0, (0, type_graphql_1.Arg)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ApprovedPostResolver.prototype, "post", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => ApprovedPosts_1.ApprovedPost),
    (0, type_graphql_1.UseMiddleware)(isAuth_1.isAuth, isAdmin_1.isAdmin),
    __param(0, (0, type_graphql_1.Arg)('id', () => type_graphql_1.Int)),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], ApprovedPostResolver.prototype, "approvePost", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => ApprovedPosts_1.ApprovedPost, { nullable: true }),
    (0, type_graphql_1.UseMiddleware)(isAuth_1.isAuth),
    (0, type_graphql_1.UseMiddleware)(isAdmin_1.isAdmin),
    __param(0, (0, type_graphql_1.Arg)('id', () => type_graphql_1.Int)),
    __param(1, (0, type_graphql_1.Arg)('title', () => String, { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", Promise)
], ApprovedPostResolver.prototype, "updatePost", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Boolean),
    (0, type_graphql_1.UseMiddleware)(isAuth_1.isAuth),
    (0, type_graphql_1.UseMiddleware)(isAdmin_1.isAdmin),
    __param(0, (0, type_graphql_1.Arg)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ApprovedPostResolver.prototype, "deletePost", null);
ApprovedPostResolver = __decorate([
    (0, type_graphql_1.Resolver)(ApprovedPosts_1.ApprovedPost)
], ApprovedPostResolver);
exports.ApprovedPostResolver = ApprovedPostResolver;
//# sourceMappingURL=approvedPosts.js.map