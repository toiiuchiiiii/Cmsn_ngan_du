const express = require('express');
const db = require('../db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.get('/contacts', authMiddleware, async function (req, res) {
  var users = await db.all(
    "SELECT id, name, email, CASE WHEN email LIKE 'agent.%' THEN 1 ELSE 0 END AS is_agent FROM users WHERE id != $1 ORDER BY is_agent DESC, name ASC",
    [req.userId]
  );
  res.json({ contacts: users });
});

router.get('/conversations', authMiddleware, async function (req, res) {
  var rows = await db.all(`
    SELECT c.id, c.user1_id, c.user2_id, c.created_at,
      u1.name AS user1_name, u2.name AS user2_name,
      (SELECT text FROM messages WHERE conversation_id = c.id ORDER BY id DESC LIMIT 1) AS last_message,
      (SELECT created_at FROM messages WHERE conversation_id = c.id ORDER BY id DESC LIMIT 1) AS last_message_at,
      (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id AND sender_id != $1 AND read = 0) AS unread
    FROM conversations c
    JOIN users u1 ON u1.id = c.user1_id
    JOIN users u2 ON u2.id = c.user2_id
    WHERE c.user1_id = $2 OR c.user2_id = $3
    ORDER BY last_message_at DESC
  `, [req.userId, req.userId, req.userId]);

  res.json({ conversations: rows });
});

router.post('/conversations', authMiddleware, async function (req, res) {
  var { contact_id } = req.body;
  if (!contact_id) return res.status(400).json({ error: 'contact_id là bắt buộc' });

  var existing = await db.get(
    'SELECT * FROM conversations WHERE (user1_id = $1 AND user2_id = $2) OR (user1_id = $3 AND user2_id = $4)',
    [req.userId, contact_id, contact_id, req.userId]
  );

  if (existing) return res.json({ conversation: existing });

  var result = await db.run("INSERT INTO conversations (user1_id, user2_id) VALUES ($1, $2) RETURNING *", [req.userId, contact_id]);
  var conv = db.isPg ? result.rows[0] : await db.get('SELECT * FROM conversations WHERE id = ?', [result.lastInsertRowid]);
  res.status(201).json({ conversation: conv });
});

router.get('/conversations/:id/messages', authMiddleware, async function (req, res) {
  var conv = await db.get(
    'SELECT * FROM conversations WHERE id = $1 AND (user1_id = $2 OR user2_id = $3)',
    [req.params.id, req.userId, req.userId]
  );
  if (!conv) return res.status(404).json({ error: 'Không tìm thấy' });

  var after = req.query.after ? parseInt(req.query.after) : 0;
  var messages = await db.all(
    'SELECT m.*, u.name AS sender_name FROM messages m JOIN users u ON u.id = m.sender_id WHERE m.conversation_id = $1 AND m.id > $2 ORDER BY m.id ASC',
    [req.params.id, after]
  );

  await db.run('UPDATE messages SET read = 1 WHERE conversation_id = $1 AND sender_id != $2', [req.params.id, req.userId]);

  res.json({ messages: messages });
});

router.post('/conversations/:id/messages', authMiddleware, async function (req, res) {
  var conv = await db.get(
    'SELECT * FROM conversations WHERE id = $1 AND (user1_id = $2 OR user2_id = $3)',
    [req.params.id, req.userId, req.userId]
  );
  if (!conv) return res.status(404).json({ error: 'Không tìm thấy' });

  var { text } = req.body;
  if (!text || !text.trim()) return res.status(400).json({ error: 'Tin nhắn không được để trống' });

  var result = await db.run("INSERT INTO messages (conversation_id, sender_id, text) VALUES ($1, $2, $3) RETURNING *", [req.params.id, req.userId, text.trim()]);
  var msg = db.isPg ? result.rows[0] : await db.get('SELECT m.*, u.name AS sender_name FROM messages m JOIN users u ON u.id = m.sender_id WHERE m.id = ?', [result.lastInsertRowid]);
  res.status(201).json({ message: msg });
});

module.exports = router;