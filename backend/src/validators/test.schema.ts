import { z } from 'zod';

export const submitTestSchema = z.object({
  answers: z.array(z.number().min(0).max(3)),
  testType: z.enum(['phq9', 'gad7', 'general']),
}).superRefine((data, ctx) => {
  const expectedLength = data.testType === 'general' ? 5 : 9;
  if (data.answers.length !== expectedLength) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: data.testType === 'general'
        ? 'Bài kiểm tra tổng quát cần 5 câu trả lời'
        : `Bài kiểm tra ${data.testType.toUpperCase()} cần ${expectedLength} câu trả lời`,
      path: ['answers'],
    });
  }
});
