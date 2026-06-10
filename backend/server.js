require('express-async-errors');

const express = require('express');
const cors = require('cors');
const path = require('path');
const os = require('os');
const db = require('./db');

const usersRouter = require('./routes/users');
const postsRouter = require('./routes/posts');
const testsRouter = require('./routes/tests');
const appointmentsRouter = require('./routes/appointments');
const botRouter = require('./routes/bot');
const chatRouter = require('./routes/chat');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

var frontendPath = path.join(__dirname, '..');
app.use(express.static(frontendPath));

app.use('/api/users', usersRouter);
app.use('/api/posts', postsRouter);
app.use('/api/tests', testsRouter);
app.use('/api/appointments', appointmentsRouter);
app.use('/api/bot', botRouter);
app.use('/api/chat', chatRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

app.use(function (err, req, res, next) {
  console.error(err);
  res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
});

function getLocalIp() {
  var interfaces = os.networkInterfaces();
  for (var name in interfaces) {
    for (var i = 0; i < interfaces[name].length; i++) {
      var addr = interfaces[name][i];
      if (addr.family === 'IPv4' && !addr.internal) {
        return addr.address;
      }
    }
  }
  return '127.0.0.1';
}

db.init().then(function () {
  app.listen(PORT, '0.0.0.0', () => {
    var ip = getLocalIp();
    console.log('');
    console.log('  MindWell — Mental Health Support');
    console.log('  ─────────────────────────────────');
    console.log('  Local:   http://localhost:' + PORT);
    console.log('  Network: http://' + ip + ':' + PORT);
    console.log('  ─────────────────────────────────');
    console.log('');
  });
});
