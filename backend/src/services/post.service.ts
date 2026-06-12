import { PostRepository, PostLikeRepository, CommentRepository } from '../repositories/post.repository.js';
import { NotFoundError, ForbiddenError, ConflictError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

export class PostService {
  constructor(
    private postRepo: PostRepository,
    private likeRepo: PostLikeRepository,
    private commentRepo: CommentRepository
  ) {}

  async list(page: number, limit: number) {
    return this.postRepo.findAll(page, limit);
  }

  async getById(id: number) {
    const post = await this.postRepo.findById(id);
    if (!post) {
      throw new NotFoundError('bài viết');
    }
    return post;
  }

  async create(userId: number | null, data: { title: string; content: string; isAnonymous?: boolean; guestName?: string; guestEmail?: string }) {
    const post = await this.postRepo.create({
      userId,
      title: data.title,
      content: data.content,
      isAnonymous: data.isAnonymous ? 1 : 0,
      guestName: data.guestName,
      guestEmail: data.guestEmail,
    });

    logger.info({ postId: post.id, userId }, 'Post created');
    return post;
  }

  async update(id: number, userId: number | null, data: Partial<{ title: string; content: string; isAnonymous?: boolean }>) {
    const post = await this.postRepo.findById(id);
    if (!post) {
      throw new NotFoundError('bài viết');
    }
    if (post.userId !== userId) {
      throw new ForbiddenError('Bạn không có quyền sửa bài viết này');
    }

    const dbData: Record<string, unknown> = { ...data };
    if (dbData.isAnonymous !== undefined) {
      dbData.isAnonymous = dbData.isAnonymous ? 1 : 0;
    }
    const updated = await this.postRepo.update(id, dbData as any);
    return updated!;
  }

  async delete(id: number, userId: number | null, userRole: string) {
    const post = await this.postRepo.findById(id);
    if (!post) {
      throw new NotFoundError('bài viết');
    }
    if (userId && post.userId !== userId && userRole !== 'admin') {
      throw new ForbiddenError('Bạn không có quyền xoá bài viết này');
    }

    await this.postRepo.delete(id);
    logger.info({ postId: id, userId }, 'Post deleted');
  }

  async toggleLike(postId: number, userId: number) {
    const post = await this.postRepo.findById(postId);
    if (!post) {
      throw new NotFoundError('bài viết');
    }

    const existing = await this.likeRepo.findByPostAndUser(postId, userId);
    if (existing) {
      await this.likeRepo.delete(existing.id);
      await this.postRepo.decrementLikeCount(postId);
      return { liked: false };
    }

    await this.likeRepo.create({ postId, userId });
    await this.postRepo.incrementLikeCount(postId);
    return { liked: true };
  }

  async listComments(postId: number, page: number, limit: number) {
    const post = await this.postRepo.findById(postId);
    if (!post) {
      throw new NotFoundError('bài viết');
    }
    return this.commentRepo.findByPostId(postId, page, limit);
  }

  async createComment(postId: number, userId: number | null, data: { content: string; guestName?: string; guestEmail?: string }) {
    const post = await this.postRepo.findById(postId);
    if (!post) {
      throw new NotFoundError('bài viết');
    }

    const comment = await this.commentRepo.create({
      postId,
      userId,
      content: data.content,
      guestName: data.guestName,
      guestEmail: data.guestEmail,
    });

    await this.postRepo.incrementCommentCount(postId);

    logger.info({ commentId: comment.id, postId, userId }, 'Comment created');
    return comment;
  }

  async deleteComment(postId: number, commentId: number, userId: number, userRole: string) {
    const post = await this.postRepo.findById(postId);
    if (!post) {
      throw new NotFoundError('bài viết');
    }

    const comment = await this.commentRepo.findById(commentId);
    if (!comment) {
      throw new NotFoundError('bình luận');
    }
    if (comment.userId !== userId && userRole !== 'admin') {
      throw new ForbiddenError('Bạn không có quyền xoá bình luận này');
    }

    await this.commentRepo.delete(commentId);
    await this.postRepo.decrementCommentCount(postId);

    logger.info({ commentId, postId, userId }, 'Comment deleted');
  }
}
