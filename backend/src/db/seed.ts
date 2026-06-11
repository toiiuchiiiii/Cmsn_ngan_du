import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import bcrypt from 'bcryptjs';
import { config } from '../config/index.js';
import { users } from './schema/users.js';
import { botReplies } from './schema/bot-replies.js';
import { mentalTests } from './schema/mental-tests.js';
import { appointments } from './schema/appointments.js';

const sql = postgres(config.database.url, { max: 1 });
const db = drizzle(sql);

async function main() {
  console.log('Seeding database...');

  await migrate(db, { migrationsFolder: 'src/db/migrations' });

  const passwordHash = (pw: string) => bcrypt.hashSync(pw, config.bcrypt.rounds);

  const [admin] = await db.insert(users).values({
    name: 'Admin',
    email: 'admin@mindwell.com',
    passwordHash: passwordHash('Admin123!'),
    role: 'admin',
    isActive: true,
  }).returning();

  const [therapist] = await db.insert(users).values({
    name: 'Therapist',
    email: 'therapist@mindwell.com',
    passwordHash: passwordHash('Therapist123!'),
    role: 'therapist',
    isActive: true,
  }).returning();

  const [patient] = await db.insert(users).values({
    name: 'Patient',
    email: 'patient@mindwell.com',
    passwordHash: passwordHash('Patient123!'),
    role: 'patient',
    isActive: true,
  }).returning();

  console.log('Created users:', { admin: admin.id, therapist: therapist.id, patient: patient.id });

  const botReplyData = [
    { keywords: 'buồn,chán,nản,chẳng muốn làm gì', reply: 'Mình hiểu cảm giác của bạn. Có chuyện gì đã xảy ra với bạn gần đây không? Mình luôn sẵn sàng lắng nghe.' },
    { keywords: 'lo lắng,hồi hộp,stress,căng thẳng', reply: 'Căng thẳng có thể ảnh hưởng rất nhiều đến sức khỏe. Hãy thử hít thở sâu: hít vào 4 giây, giữ 4 giây, thở ra 4 giây. Bạn có muốn chia sẻ thêm không?' },
    { keywords: 'mất ngủ,khó ngủ,thức đêm', reply: 'Mất ngủ rất khó chịu phải không? Bạn có thể thử tắt điện thoại 1 giờ trước khi ngủ, uống một ly sữa ấm, hoặc nghe nhạc nhẹ. Bạn đã thử cách nào chưa?' },
    { keywords: 'tự ti,thiếu tự tin,mặc cảm', reply: 'Bạn xứng đáng được hạnh phúc và yêu thương. Hãy nhớ rằng ai cũng có giá trị riêng của mình. Bạn đang nghĩ gì về bản thân lúc này?' },
    { keywords: 'giận dữ,bực mình,tức giận', reply: 'Cảm xúc tức giận là hoàn toàn bình thường. Hãy thử đếm từ 1 đến 10 hoặc đi bộ vài phút để bình tĩnh lại trước khi đưa ra quyết định. Bạn muốn kể mình nghe chuyện gì không?' },
    { keywords: 'cô đơn,một mình,lẻ loi', reply: 'Cảm giác cô đơn thật sự rất nặng nề. Nhưng bạn không cô đơn đâu, mình luôn ở đây để trò chuyện cùng bạn. Hãy thử kết nối với một người bạn hoặc người thân nhé.' },
    { keywords: 'mệt mỏi,kiệt sức,không còn năng lượng', reply: 'Bạn đã nghỉ ngơi đủ chưa? Đôi khi cơ thể cần thời gian để phục hồi. Hãy uống một cốc nước, nghỉ ngơi vài phút và đừng quá áp lực với bản thân nhé.' },
    { keywords: 'chúc ngủ ngon,ngủ ngon', reply: 'Chúc bạn ngủ thật ngon nhé! Ngày mai sẽ là một ngày mới tốt đẹp. Mơ đẹp nha! 🌙' },
    { keywords: 'chào,hello,hi', reply: 'Chào bạn! Mình là MindBot - trợ lý sức khỏe tinh thần của bạn. Hôm nay bạn thế nào? Có gì mình có thể giúp bạn không?' },
    { keywords: 'cảm ơn,cám ơn,thank', reply: 'Không có gì đâu bạn! Mình luôn sẵn lòng giúp đỡ. Hãy nhớ chăm sóc sức khỏe tinh thần thật tốt nhé. Nếu cần gì cứ nhắn mình.' },
  ];

  for (const br of botReplyData) {
    await db.insert(botReplies).values(br);
  }

  console.log('Created bot replies');

  await db.insert(mentalTests).values({
    userId: patient.id,
    score: 7,
    result: 'Nhẹ - Bạn có một số dấu hiệu lo âu nhẹ. Hãy theo dõi và chăm sóc sức khỏe tinh thần.',
    answers: JSON.stringify({ q1: 2, q2: 1, q3: 2, q4: 1, q5: 1 }),
    testType: 'gad-7',
  });

  await db.insert(mentalTests).values({
    userId: patient.id,
    score: 15,
    result: 'Vừa - Bạn có dấu hiệu trầm cảm ở mức độ vừa. Nên tìm sự hỗ trợ từ chuyên gia tâm lý.',
    answers: JSON.stringify({ q1: 2, q2: 2, q3: 1, q4: 3, q5: 2, q6: 3, q7: 2 }),
    testType: 'phq-9',
  });

  console.log('Created test results');

  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextWeek = new Date(now);
  nextWeek.setDate(nextWeek.getDate() + 7);

  await db.insert(appointments).values({
    userId: patient.id,
    therapistId: therapist.id,
    date: tomorrow,
    status: 'confirmed',
    notes: 'Khám tư vấn tâm lý định kỳ',
  });

  await db.insert(appointments).values({
    userId: patient.id,
    therapistId: therapist.id,
    date: nextWeek,
    status: 'pending',
    notes: 'Theo dõi tình trạng lo âu',
  });

  await db.insert(appointments).values({
    userId: therapist.id,
    therapistId: null,
    date: new Date(tomorrow.getTime() + 2 * 60 * 60 * 1000),
    status: 'confirmed',
    notes: 'Họp đội ngũ chuyên gia',
  });

  console.log('Created appointments');
  console.log('Seed complete!');
  await sql.end();
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
