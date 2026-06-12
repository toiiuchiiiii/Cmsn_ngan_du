import { TestTemplateRepository } from '../repositories/test-template.repository.js';
import { NotFoundError, ForbiddenError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

export class TestTemplateService {
  constructor(private repo: TestTemplateRepository) {}

  async list() {
    return this.repo.findAll();
  }

  async getById(id: number) {
    const template = await this.repo.findById(id);
    if (!template) throw new NotFoundError('bài kiểm tra');
    return template;
  }

  async create(userId: number, data: { title: string; description?: string; questions: { questionText: string; options: { label: string; value: number }[]; orderIndex: number }[] }) {
    const template = await this.repo.create({
      title: data.title,
      description: data.description || '',
      createdBy: userId,
    }, data.questions);
    logger.info({ templateId: template?.id, userId }, 'Test template created');
    return template;
  }

  async update(id: number, userId: number, role: string, data: { title?: string; description?: string; questions?: { questionText: string; options: { label: string; value: number }[]; orderIndex: number }[] }) {
    const template = await this.repo.findById(id);
    if (!template) throw new NotFoundError('bài kiểm tra');
    if (template.createdBy !== userId && role !== 'admin') {
      throw new ForbiddenError('Bạn không có quyền sửa bài kiểm tra này');
    }
    return this.repo.update(id, data, data.questions);
  }

  async delete(id: number, userId: number, role: string) {
    const template = await this.repo.findById(id);
    if (!template) throw new NotFoundError('bài kiểm tra');
    if (template.createdBy !== userId && role !== 'admin') {
      throw new ForbiddenError('Bạn không có quyền xóa bài kiểm tra này');
    }
    await this.repo.delete(id);
  }
}
