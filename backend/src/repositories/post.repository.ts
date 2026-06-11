import { eq, desc, count, and, sql } from 'drizzle-orm';
import { db } from '../config/database.js';
import {
  posts,
  postLikes,
  comments,
  type Post,
  type NewPost,
  type PostLike,
  type NewPostLike,
  type Comment,
  type NewComment,
} from '../db/schema/posts.js';

export class PostRepository {
  async findAll(page: number, limit: number): Promise<{ entries: Post[]; total: number }> {
    const offset = (page - 1) * limit;

    const [total] = await db.select({ total: count() }).from(posts);
    const entries = await db
      .select()
      .from(posts)
      .orderBy(desc(posts.createdAt))
      .limit(limit)
      .offset(offset);

    return { entries, total: total.total };
  }

  async findById(id: number): Promise<Post | undefined> {
    const result = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
    return result[0];
  }

  async findByUserId(userId: number, page: number, limit: number): Promise<{ entries: Post[]; total: number }> {
    const offset = (page - 1) * limit;

    const [total] = await db.select({ total: count() }).from(posts).where(eq(posts.userId, userId));
    const entries = await db
      .select()
      .from(posts)
      .where(eq(posts.userId, userId))
      .orderBy(desc(posts.createdAt))
      .limit(limit)
      .offset(offset);

    return { entries, total: total.total };
  }

  async create(data: NewPost): Promise<Post> {
    const result = await db.insert(posts).values(data).returning();
    return result[0];
  }

  async update(id: number, data: Partial<NewPost>): Promise<Post | undefined> {
    const result = await db
      .update(posts)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(posts.id, id))
      .returning();
    return result[0];
  }

  async delete(id: number): Promise<void> {
    await db.delete(posts).where(eq(posts.id, id));
  }

  async incrementLikeCount(id: number): Promise<void> {
    await db
      .update(posts)
      .set({ likeCount: sql`${posts.likeCount} + 1` })
      .where(eq(posts.id, id));
  }

  async decrementLikeCount(id: number): Promise<void> {
    await db
      .update(posts)
      .set({ likeCount: sql`${posts.likeCount} - 1` })
      .where(eq(posts.id, id));
  }

  async incrementCommentCount(id: number): Promise<void> {
    await db
      .update(posts)
      .set({ commentCount: sql`${posts.commentCount} + 1` })
      .where(eq(posts.id, id));
  }

  async decrementCommentCount(id: number): Promise<void> {
    await db
      .update(posts)
      .set({ commentCount: sql`${posts.commentCount} - 1` })
      .where(eq(posts.id, id));
  }
}

export class PostLikeRepository {
  async findByPostAndUser(postId: number, userId: number): Promise<PostLike | undefined> {
    const result = await db
      .select()
      .from(postLikes)
      .where(and(eq(postLikes.postId, postId), eq(postLikes.userId, userId)))
      .limit(1);
    return result[0];
  }

  async create(data: NewPostLike): Promise<PostLike> {
    const result = await db.insert(postLikes).values(data).returning();
    return result[0];
  }

  async delete(id: number): Promise<void> {
    await db.delete(postLikes).where(eq(postLikes.id, id));
  }
}

export class CommentRepository {
  async findByPostId(postId: number, page: number, limit: number): Promise<{ entries: Comment[]; total: number }> {
    const offset = (page - 1) * limit;

    const [total] = await db.select({ total: count() }).from(comments).where(eq(comments.postId, postId));
    const entries = await db
      .select()
      .from(comments)
      .where(eq(comments.postId, postId))
      .orderBy(desc(comments.createdAt))
      .limit(limit)
      .offset(offset);

    return { entries, total: total.total };
  }

  async findById(id: number): Promise<Comment | undefined> {
    const result = await db.select().from(comments).where(eq(comments.id, id)).limit(1);
    return result[0];
  }

  async create(data: NewComment): Promise<Comment> {
    const result = await db.insert(comments).values(data).returning();
    return result[0];
  }

  async delete(id: number): Promise<void> {
    await db.delete(comments).where(eq(comments.id, id));
  }
}
