import { Router } from 'express';
import { PostService } from '../../services/post.service.js';
import { PostRepository, PostLikeRepository, CommentRepository } from '../../repositories/post.repository.js';
import { postController } from '../../controllers/post.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import {
  createPostSchema,
  updatePostSchema,
  createCommentSchema,
} from '../../validators/post.schema.js';

const router = Router();

const postRepo = new PostRepository();
const likeRepo = new PostLikeRepository();
const commentRepo = new CommentRepository();
const service = new PostService(postRepo, likeRepo, commentRepo);
const controller = postController(service);

router.get('/', controller.list);
router.get('/:id', controller.getById);
router.post('/', validate(createPostSchema), controller.create);
router.put('/:id', authenticate, validate(updatePostSchema), controller.update);
router.delete('/:id', authenticate, controller.delete);
router.post('/:id/like', authenticate, controller.toggleLike);
router.get('/:id/comments', controller.listComments);
router.post('/:id/comments', validate(createCommentSchema), controller.createComment);
router.delete('/:id/comments/:commentId', authenticate, controller.deleteComment);

export default router;
