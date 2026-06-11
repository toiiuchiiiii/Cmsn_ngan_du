import type { QuickAction, BotReply } from '@/types'

export const QUICK_ACTIONS: QuickAction[] = [
  { id: 'anxiety', label: 'Tôi cảm thấy lo lắng', icon: '💭' },
  { id: 'relax', label: 'Cách thư giãn', icon: '🧘' },
  { id: 'expert', label: 'Tìm chuyên gia', icon: '👨‍⚕️' },
  { id: 'breathing', label: 'Bài tập thở', icon: '🌬️' },
]

export const PREDEFINED_REPLIES: Record<string, string> = {
  anxiety:
    'Cảm giác lo lắng là điều bình thường. Bạn có thể thử:\n\n'
    + '1. **Hít thở sâu**: Hít vào 4 giây, giữ 4 giây, thở ra 4 giây\n'
    + '2. **Viết nhật ký**: Ghi lại những suy nghĩ đang làm bạn lo lắng\n'
    + '3. **Tập thể dục nhẹ**: Đi bộ 5-10 phút giúp giảm căng thẳng\n\n'
    + 'Nếu lo lắng kéo dài, hãy liên hệ chuyên gia tâm lý.',
  relax:
    'Một số cách thư giãn hiệu quả:\n\n'
    + '🧘 **Thiền 5 phút**: Ngồi yên, tập trung vào hơi thở\n'
    + '🎵 **Nghe nhạc nhẹ**: Nhạc không lời hoặc âm thanh thiên nhiên\n'
    + '📖 **Đọc sách**: Một cuốn sách yêu thích giúp tâm trí thư thái\n'
    + '🚿 **Tắm nước ấm**: Giúp cơ thể thả lỏng\n\n'
    + 'Hãy dành ít nhất 10 phút mỗi ngày cho bản thân.',
  expert:
    'Bạn có thể tìm chuyên gia tâm lý qua:\n\n'
    + '🏥 **Phòng Y tế Sinh viên**: Đặt lịch hẹn trực tiếp trên ứng dụng\n'
    + '📞 **Hotline hỗ trợ tâm lý**: 1900 1234 (miễn phí)\n'
    + '🌐 **Danh sách chuyên gia**: Xem mục "Lịch hẹn" để đặt lịch\n\n'
    + 'Bạn không cần phải đối mặt một mình.',
  breathing:
    '**Bài tập thở 4-7-8**:\n\n'
    + '1. 🌬️ Thở ra hoàn toàn bằng miệng\n'
    + '2. 👃 Hít vào bằng mũi trong **4 giây**\n'
    + '3. 🤐 Giữ hơi trong **7 giây**\n'
    + '4. 👄 Thở ra bằng miệng trong **8 giây**\n\n'
    + 'Lặp lại 4 lần. Bài tập này giúp làm dịu hệ thần kinh ngay lập tức.',
  crisis:
    '⚠️ **Bạn không đơn độc. Hãy gọi ngay:**\n\n'
    + '📞 **Đường dây nóng hỗ trợ khủng hoảng**: 1900 1234\n'
    + '📞 **Tổng đài tư vấn tâm lý miễn phí**: 1800 5678\n\n'
    + 'Hoặc đến **Phòng Y tế Sinh viên** gần nhất để được hỗ trợ trực tiếp.',
  welcome:
    'Chào bạn! 👋\n\n'
    + 'Mình là **Trợ lý MindWell**, luôn sẵn sàng hỗ trợ bạn. '
    + 'Hãy chọn một chủ đề bên dưới hoặc gõ câu hỏi của bạn.\n\n'
    + '🌿 Mọi thứ bạn chia sẻ đều được bảo mật.',
}

export const KEYWORD_REPLIES: BotReply[] = [
  { keyword: 'khủng hoảng', response: PREDEFINED_REPLIES.crisis },
  { keyword: 'cứu', response: PREDEFINED_REPLIES.crisis },
  { keyword: 'tự tử', response: PREDEFINED_REPLIES.crisis },
  { keyword: 'muốn chết', response: PREDEFINED_REPLIES.crisis },
]

export function getBotReply(userMessage: string): string {
  const lower = userMessage.toLowerCase()
  for (const kr of KEYWORD_REPLIES) {
    if (lower.includes(kr.keyword)) {
      return kr.response
    }
  }
  return (
    'Cảm ơn bạn đã chia sẻ. 🤗\n\n'
    + 'Mình hiểu những điều bạn đang trải qua là không dễ dàng. '
    + 'Hãy thử một số gợi ý bên dưới hoặc cho mình biết thêm để mình có thể hỗ trợ tốt hơn.\n\n'
    + 'Nếu bạn cần hỗ trợ ngay, hãy gọi **1900 1234** (miễn phí).'
  )
}
