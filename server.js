const express = require('express');
const session = require('express-session');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const { getContent, saveContent, saveDraft, getDrafts, saveSubmission, getPendingSubmissions, approveSubmission, rejectSubmission, saveMedia } = require('./lib/db');

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 3000);
const uploadsDir = path.join(__dirname, 'uploads');
fs.mkdirSync(uploadsDir, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadsDir,
    filename: (_req, file, cb) => {
      const basename = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '-');
      cb(null, `${Date.now()}-${basename}`);
    }
  }),
  limits: { fileSize: 12 * 1024 * 1024 }
});

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.CMS_SESSION_SECRET || 'wwf-cms-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'lax', secure: false, maxAge: 12 * 60 * 60 * 1000 }
}));

function requireAuth(req, res, next) {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ error: 'Unauthorized. Please log in.' });
  }
  next();
}

function requireAdmin(req, res, next) {
  if (!req.session || !req.session.user || req.session.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden. Administrator access required.' });
  }
  next();
}

app.post('/api/login', (req, res) => {
  const { username, password, role } = req.body || {};
  const expectedUsername = role === 'admin' ? (process.env.CMS_ADMIN_USERNAME || 'administrator') : (process.env.CMS_MANAGER_USERNAME || 'communications-manager');
  const expectedPassword = role === 'admin' ? (process.env.CMS_ADMIN_PASSWORD || 'change-me') : (process.env.CMS_MANAGER_PASSWORD || 'change-me');

  if (!role || (role !== 'manager' && role !== 'admin')) {
    return res.status(400).json({ error: 'Role is invalid.' });
  }

  if (username === expectedUsername && password === expectedPassword) {
    req.session.user = { username, role };
    return res.json({ ok: true, user: { username, role } });
  }

  return res.status(401).json({ error: 'Invalid username or password.' });
});

app.post('/api/logout', (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

app.get('/api/content', requireAuth, async (_req, res) => {
  const data = await getContent();
  return res.json({ content: data.site || {}, approved: data.approved || {} });
});

app.post('/api/content', requireAuth, async (req, res) => {
  const next = req.body?.content || {};
  const saved = await saveContent(next);
  return res.json({ ok: true, content: saved });
});

app.get('/api/drafts', requireAuth, async (_req, res) => {
  const drafts = await getDrafts();
  return res.json({ drafts });
});

app.post('/api/draft', requireAuth, async (req, res) => {
  const payload = req.body?.content || {};
  const draft = await saveDraft(req.session.user.username, payload);
  return res.json({ ok: true, draft });
});

app.post('/api/submit', requireAuth, async (req, res) => {
  if (req.session.user.role !== 'manager') {
    return res.status(403).json({ error: 'Only the Communications Manager can submit content.' });
  }

  const payload = req.body?.content || {};
  const item = await saveSubmission(req.session.user.username, payload);
  return res.json({ ok: true, item });
});

app.get('/api/queue', requireAuth, requireAdmin, async (_req, res) => {
  const queue = await getPendingSubmissions();
  return res.json({ queue });
});

app.post('/api/approve', requireAuth, requireAdmin, async (req, res) => {
  const { id } = req.body || {};
  const item = await approveSubmission(id, req.session.user.username);
  if (!item) return res.status(404).json({ error: 'Submission not found.' });
  return res.json({ ok: true, item });
});

app.post('/api/reject', requireAuth, requireAdmin, async (req, res) => {
  const { id } = req.body || {};
  const item = await rejectSubmission(id);
  if (!item) return res.status(404).json({ error: 'Submission not found.' });
  return res.json({ ok: true, item });
});

app.post('/api/upload', requireAuth, upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }

  const publicUrl = `${process.env.PUBLIC_BASE_URL || 'http://localhost:3000'}/uploads/${req.file.filename}`;
  const saved = await saveMedia({
    filename: req.file.filename,
    url: publicUrl,
    mimetype: req.file.mimetype,
    size: req.file.size
  });

  return res.json({ ok: true, media: saved });
});

app.use('/uploads', express.static(uploadsDir));
app.use(express.static(path.join(__dirname, 'public')));
app.get('/admin', (_req, res) => res.sendFile(path.join(__dirname, 'admin')));
app.get('/', (_req, res) => res.sendFile(path.join(__dirname, 'index.html')));

app.listen(PORT, () => {
  console.log(`WWF CMS running at http://localhost:${PORT}`);
  console.log('Remember to configure DATABASE_URL and secure credentials in .env');
});
