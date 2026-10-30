const express = require('express');
const session = require('express-session');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 3000);
const rootDir = __dirname;
const storePath = path.join(rootDir, 'data', 'store.json');
const uploadsDir = path.join(rootDir, 'uploads');

fs.mkdirSync(path.dirname(storePath), { recursive: true });
fs.mkdirSync(uploadsDir, { recursive: true });

const defaultContent = {
  home: {
    title: 'Together for a living Tunisia',
    subtitle: 'Protecting nature, empowering communities, and advancing a sustainable future for North Africa.',
    heroImage: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80'
  },
  about: {
    mission: 'To stop the degradation of the natural environment and build a future in which people live in harmony with nature.',
    vision: 'A healthy, resilient region where people and nature thrive together.',
    summary: 'WWF North Africa works with communities, institutions, and partners to preserve biodiversity, restore ecosystems, and improve livelihoods.'
  },
  projects: [],
  news: [],
  team: [],
  partners: [],
  contact: {
    email: 'contact@wwfna.org',
    phone: '+216 00 000 000',
    address: '5 Rue Ibn El Monadi, El Menzah 1, 1004 Tunis',
    facebook: 'https://www.facebook.com',
    instagram: 'https://www.instagram.com',
    linkedin: 'https://www.linkedin.com'
  },
  downloads: []
};

function readStore() {
  try {
    const data = fs.readFileSync(storePath, 'utf8');
    const parsed = JSON.parse(data);
    return {
      content: parsed.content || defaultContent,
      drafts: parsed.drafts || [],
      queue: parsed.queue || [],
      approved: parsed.approved || defaultContent
    };
  } catch (error) {
    const initial = {
      content: defaultContent,
      drafts: [],
      queue: [],
      approved: defaultContent
    };
    fs.writeFileSync(storePath, JSON.stringify(initial, null, 2), 'utf8');
    return initial;
  }
}

function writeStore(data) {
  fs.writeFileSync(storePath, JSON.stringify(data, null, 2), 'utf8');
}

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.CMS_SESSION_SECRET || 'wwf-north-africa-cms-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    maxAge: 1000 * 60 * 60 * 12
  }
}));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9_.-]/g, '-');
    const suffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${suffix}-${safe}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }
});

function requireLogin(req, res, next) {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ error: 'Unauthorized. Please log in.' });
  }
  next();
}

function requireRole(role, req, res, next) {
  if (!req.session || !req.session.user || req.session.user.role !== role) {
    return res.status(403).json({ error: 'Forbidden for this role.' });
  }
  next();
}

app.get(['/admin', '/admin/'], (req, res) => {
  res.sendFile(path.join(rootDir, 'admin'));
});

app.get('/api/health', (req, res) => res.json({ ok: true, service: 'WWF North Africa CMS' }));

app.post('/api/login', (req, res) => {
  const { username, password, role } = req.body || {};
  const validRole = role === 'manager' || role === 'admin';

  if (!validRole) {
    return res.status(400).json({ error: 'Invalid role supplied.' });
  }

  const expectedUsername = role === 'manager'
    ? (process.env.CMS_MANAGER_USERNAME || 'communications-manager')
    : (process.env.CMS_ADMIN_USERNAME || 'administrator');

  const expectedPassword = role === 'manager'
    ? (process.env.CMS_MANAGER_PASSWORD || 'change-me')
    : (process.env.CMS_ADMIN_PASSWORD || 'change-me');

  if (username !== expectedUsername || password !== expectedPassword) {
    return res.status(401).json({ error: 'Invalid username or password.' });
  }

  req.session.user = { username, role };
  return res.json({ ok: true, user: { username, role } });
});

app.post('/api/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ ok: true });
  });
});

app.get('/api/content', requireLogin, (req, res) => {
  const store = readStore();
  return res.json({ content: store.content, approved: store.approved });
});

app.post('/api/content', requireLogin, (req, res) => {
  const store = readStore();
  store.content = req.body.content || store.content;
  store.content.lastSaved = new Date().toISOString();
  writeStore(store);
  return res.json({ ok: true, content: store.content });
});

app.post('/api/draft', requireLogin, (req, res) => {
  const store = readStore();
  const payload = req.body.content || store.content;
  const draft = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    createdAt: new Date().toISOString(),
    content: payload
  };
  store.drafts.push(draft);
  writeStore(store);
  return res.json({ ok: true, draft });
});

app.get('/api/drafts', requireLogin, (req, res) => {
  const store = readStore();
  return res.json({ drafts: store.drafts });
});

app.post('/api/submit', requireLogin, (req, res) => {
  const store = readStore();
  const item = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    createdAt: new Date().toISOString(),
    status: 'pending',
    role: req.session.user.role,
    content: req.body.content || store.content
  };
  store.queue.push(item);
  store.content = item.content;
  writeStore(store);
  return res.json({ ok: true, item });
});

app.get('/api/queue', requireLogin, requireRole.bind(null, 'admin'), (req, res) => {
  const store = readStore();
  return res.json({ queue: store.queue.filter((item) => item.status === 'pending') });
});

app.post('/api/approve', requireLogin, requireRole.bind(null, 'admin'), (req, res) => {
  const { id } = req.body || {};
  const store = readStore();
  const index = store.queue.findIndex((item) => item.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Submission not found.' });
  }

  const approved = store.queue[index];
  approved.status = 'approved';
  store.approved = approved.content;
  store.content = approved.content;
  store.queue.splice(index, 1);
  writeStore(store);

  return res.json({ ok: true, approved: store.approved });
});

app.post('/api/reject', requireLogin, requireRole.bind(null, 'admin'), (req, res) => {
  const { id } = req.body || {};
  const store = readStore();
  const next = store.queue.filter((item) => item.id !== id);
  store.queue = next;
  writeStore(store);
  return res.json({ ok: true, queue: store.queue });
});

app.post('/api/upload', requireLogin, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }

  const publicUrl = `/uploads/${req.file.filename}`;
  return res.json({ ok: true, url: publicUrl, filename: req.file.filename });
});

app.use('/uploads', express.static(uploadsDir));

app.use(express.static(rootDir));

app.listen(PORT, () => {
  console.log(`WWF North Africa CMS running on http://localhost:${PORT}`);
  console.log('Use the .env.example file to configure secure login credentials before production launch.');
});
