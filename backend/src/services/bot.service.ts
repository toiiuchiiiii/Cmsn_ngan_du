import { BotReplyRepository, ChatFeedbackRepository } from '../repositories/bot.repository.js';
import { NotFoundError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

const CRISIS_KEYWORDS = [
  'tự tử', 'tự sát', 'khủng hoảng', 'muốn chết',
  'kết thúc cuộc đời', 'đau khổ quá', 'không muốn sống nữa',
];

const CRISIS_RESPONSE = `Tôi rất quan tâm đến bạn. Nếu bạn đang gặp khủng hoảng, hãy liên hệ ngay:
• Trung tâm hỗ trợ tâm lý: 1900 599 933
• Đường dây nóng TPHCM: (028) 3899 6099
• Hotline Bộ Y tế: 1900 3228
Bạn không cô đơn, hãy nói chuyện với người thân hoặc chuyên gia tâm lý ngay nhé.`;

const DEFAULT_REPLIES = [
  'Cảm ơn bạn đã chia sẻ. Hãy cho mình biết thêm để mình có thể giúp đỡ bạn tốt hơn nhé.',
  'Mình hiểu cảm giác của bạn. Bạn có muốn nói thêm về điều đó không?',
  'Mình luôn sẵn sàng lắng nghe bạn. Hãy kể mình nghe thêm nhé.',
  'Cảm ơn bạn đã tin tưởng và chia sẻ. Mình hy vọng bạn sẽ luôn khỏe mạnh và bình an.',
];

export class BotService {
  constructor(
    private botReplyRepo: BotReplyRepository,
    private feedbackRepo: ChatFeedbackRepository
  ) {}

  async chat(message: string, userId?: number) {
    const lowerMsg = message.toLowerCase();

    for (const keyword of CRISIS_KEYWORDS) {
      if (lowerMsg.includes(keyword)) {
        logger.info({ userId, keyword }, 'Crisis keyword detected in chat');
        return { reply: CRISIS_RESPONSE, isCrisis: true, matchedKeyword: keyword };
      }
    }

    const words = lowerMsg.split(/\s+/);
    const matchedReplies: { reply: string; keyword: string }[] = [];

    for (const word of words) {
      if (word.length < 2) continue;
      const results = await this.botReplyRepo.findByKeyword(word);
      for (const r of results) {
        matchedReplies.push({ reply: r.reply, keyword: word });
      }
    }

    if (matchedReplies.length > 0) {
      const selected = matchedReplies[Math.floor(Math.random() * matchedReplies.length)];
      return { reply: selected.reply, isCrisis: false, matchedKeyword: selected.keyword };
    }

    const fallback = DEFAULT_REPLIES[Math.floor(Math.random() * DEFAULT_REPLIES.length)];
    return { reply: fallback, isCrisis: false };
  }

  async submitFeedback(
    data: { messageText: string; botReply: string; helpful: number; keywords?: string },
    userId: number
  ) {
    const result = await this.feedbackRepo.create({
      messageText: data.messageText,
      botReply: data.botReply,
      helpful: data.helpful,
      keywords: data.keywords || null,
      userId,
    });

    logger.info({ feedbackId: result.id, userId, helpful: data.helpful }, 'Feedback submitted');
    return result;
  }

  async listReplies() {
    return this.botReplyRepo.findAll();
  }

  async createReply(data: { keywords: string; reply: string }) {
    const result = await this.botReplyRepo.create(data);
    logger.info({ replyId: result.id }, 'Bot reply rule created');
    return result;
  }

  async updateReply(id: number, data: { keywords?: string; reply?: string }) {
    const existing = await this.botReplyRepo.update(id, data);
    if (!existing) throw new NotFoundError('quy tắc bot');
    logger.info({ replyId: id }, 'Bot reply rule updated');
    return existing;
  }

  async deleteReply(id: number) {
    const existing = await this.botReplyRepo.delete(id);
    if (!existing) throw new NotFoundError('quy tắc bot');
    logger.info({ replyId: id }, 'Bot reply rule deleted');
    return existing;
  }
}
