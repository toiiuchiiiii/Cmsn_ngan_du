import type { TestType } from '@/types'

export const TEST_OPTIONS = [
  { label: 'Không bao giờ', value: 0 },
  { label: 'Vài ngày', value: 1 },
  { label: 'Hơn nửa số ngày', value: 2 },
  { label: 'Hầu như mỗi ngày', value: 3 },
]

export const TEST_TYPES: TestType[] = [
  {
    id: 'phq9',
    name: 'PHQ-9 — Trầm cảm',
    description: 'Bảng câu hỏi đánh giá mức độ trầm cảm gồm 9 câu hỏi. Dựa trên tiêu chuẩn chẩn đoán PHQ-9.',
    time: '5 phút',
    questions: [
      'Ít hứng thú hoặc niềm vui khi làm mọi việc',
      'Cảm thấy chán nản, trầm cảm hoặc tuyệt vọng',
      'Khó đi vào giấc ngủ, khó ngủ lại hoặc ngủ quá nhiều',
      'Cảm thấy mệt mỏi hoặc thiếu năng lượng',
      'Ăn không ngon hoặc ăn quá nhiều',
      'Cảm thấy không tốt về bản thân — hoặc cảm thấy thất bại',
      'Khó tập trung vào mọi việc như đọc báo hoặc xem TV',
      'Di chuyển hoặc nói chuyện chậm đến mức người khác có thể nhận ra',
      'Có suy nghĩ rằng mình nên chết hoặc tự làm hại bản thân',
    ],
    options: TEST_OPTIONS,
    severityLevels: [
      {
        min: 0, max: 4, label: 'Bình thường',
        description: 'Kết quả cho thấy mức độ trầm cảm thấp hoặc không có.',
        recommendation: 'Hãy duy trì thói quen lành mạnh và giữ kết nối với mạng lưới hỗ trợ của bạn. Các bài tập chánh niệm và thể dục đều đặn cũng rất hữu ích.',
        color: '#7BA38B',
      },
      {
        min: 5, max: 9, label: 'Nhẹ',
        description: 'Bạn có thể đang gặp một số triệu chứng trầm cảm nhẹ.',
        recommendation: 'Hãy thử các bài tập thư giãn, chánh niệm. Cân nhắc nói chuyện với người thân hoặc bạn bè về cảm xúc của bạn.',
        color: '#C9A97C',
      },
      {
        min: 10, max: 14, label: 'Vừa',
        description: 'Các triệu chứng trầm cảm ở mức trung bình. Bạn có thể đang gặp khó khăn trong sinh hoạt hàng ngày.',
        recommendation: 'Chúng tôi khuyên bạn nên đặt lịch tư vấn với chuyên gia sức khỏe tâm thần. Có nhiều phương pháp điều trị hiệu quả có thể giúp bạn.',
        color: '#D4A5A5',
      },
      {
        min: 15, max: 27, label: 'Nặng',
        description: 'Các triệu chứng trầm cảm ở mức nặng. Bạn cần được hỗ trợ chuyên nghiệp càng sớm càng tốt.',
        recommendation: 'Hãy liên hệ ngay với chuyên gia tư vấn hoặc gọi đường dây nóng hỗ trợ khủng hoảng: 1900 9999. Bạn không đơn độc — luôn có người sẵn sàng giúp đỡ.',
        color: '#C97C7C',
      },
    ],
  },
  {
    id: 'gad7',
    name: 'GAD-7 — Lo âu',
    description: 'Đánh giá mức độ lo âu trong 2 tuần qua với 7 câu hỏi.',
    time: '3 phút',
    questions: [
      'Cảm thấy lo lắng, bồn chồn hoặc căng thẳng',
      'Không thể ngừng lo lắng hoặc kiểm soát lo lắng',
      'Lo lắng quá nhiều về nhiều thứ khác nhau',
      'Khó thư giãn',
      'Bồn chồn đến mức khó ngồi yên',
      'Trở nên dễ cáu kỉnh hoặc khó chịu',
      'Sợ hãi như thể điều khủng khiếp sắp xảy ra',
    ],
    options: TEST_OPTIONS,
    severityLevels: [
      {
        min: 0, max: 4, label: 'Bình thường',
        description: 'Mức độ lo âu thấp hoặc không có.',
        recommendation: 'Tiếp tục duy trì các hoạt động lành mạnh. Các bài tập thở sâu và thiền định có thể giúp duy trì trạng thái bình tĩnh.',
        color: '#7BA38B',
      },
      {
        min: 5, max: 9, label: 'Nhẹ',
        description: 'Có dấu hiệu lo âu nhẹ.',
        recommendation: 'Thử các kỹ thuật thư giãn như hít thở sâu, yoga, hoặc đi dạo. Hãy dành thời gian cho bản thân mỗi ngày.',
        color: '#C9A97C',
      },
      {
        min: 10, max: 14, label: 'Vừa',
        description: 'Lo âu ở mức trung bình, có thể ảnh hưởng đến cuộc sống hàng ngày.',
        recommendation: 'Chúng tôi khuyên bạn nên tìm kiếm sự tư vấn. Các liệu pháp như CBT (liệu pháp nhận thức hành vi) rất hiệu quả cho lo âu.',
        color: '#D4A5A5',
      },
      {
        min: 15, max: 21, label: 'Nặng',
        description: 'Lo âu ở mức nặng, cần được hỗ trợ chuyên nghiệp.',
        recommendation: 'Vui lòng liên hệ ngay với chuyên gia sức khỏe tâm thần hoặc gọi đường dây nóng 1900 9999. Hỗ trợ luôn sẵn sàng cho bạn.',
        color: '#C97C7C',
      },
    ],
  },
  {
    id: 'general',
    name: 'Kiểm tra sức khỏe tâm thần tổng quát',
    description: 'Bài kiểm tra ngắn 5 câu hỏi giúp đánh giá sơ bộ tình trạng sức khỏe tinh thần.',
    time: '2 phút',
    questions: [
      'Ít hứng thú hoặc niềm vui khi làm mọi việc',
      'Cảm thấy chán nản, trầm cảm hoặc tuyệt vọng',
      'Cảm thấy lo lắng, bồn chồn hoặc căng thẳng',
      'Cảm thấy mệt mỏi hoặc thiếu năng lượng',
      'Khó đi vào giấc ngủ hoặc khó ngủ',
    ],
    options: TEST_OPTIONS,
    severityLevels: [
      {
        min: 0, max: 4, label: 'Bình thường',
        description: 'Kết quả cho thấy mức căng thẳng thấp.',
        recommendation: 'Hãy duy trì thói quen lành mạnh và giữ kết nối với mạng lưới hỗ trợ của bạn.',
        color: '#7BA38B',
      },
      {
        min: 5, max: 9, label: 'Nhẹ',
        description: 'Bạn có thể đang gặp một chút căng thẳng.',
        recommendation: 'Hãy thử các bài tập chánh niệm hoặc nói chuyện với người hỗ trợ đồng trang lứa.',
        color: '#C9A97C',
      },
      {
        min: 10, max: 14, label: 'Vừa',
        description: 'Kết quả cho thấy bạn có thể đang gặp khó khăn.',
        recommendation: 'Chúng tôi khuyên bạn nên đặt lịch tư vấn hoặc liên hệ với đội hỗ trợ.',
        color: '#D4A5A5',
      },
      {
        min: 15, max: 15, label: 'Nặng',
        description: 'Bạn đang gặp căng thẳng đáng kể.',
        recommendation: 'Hãy liên hệ ngay với chuyên gia tư vấn hoặc gọi đường dây nóng khủng hoảng 1900 9999.',
        color: '#C97C7C',
      },
    ],
  },
]
