const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

const pool = connectionString ? new Pool({ connectionString }) : null;

async function query(text, params = []) {
  if (!pool) {
    throw new Error('DATABASE_URL is not configured. Set a PostgreSQL connection string before using the CMS database.');
  }
  return pool.query(text, params);
}

async function getContent() {
  const { rows } = await query("SELECT scope, payload FROM cms_content WHERE scope IN ('site', 'approved') ORDER BY scope ASC");
  const result = { site: {}, approved: {} };
  for (const row of rows) {
    result[row.scope] = row.payload;
  }
  return result;
}

async function saveContent(payload) {
  await query(
    `INSERT INTO cms_content (scope, payload, updated_at)
     VALUES ('site', $1, NOW())
     ON CONFLICT (scope)
     DO UPDATE SET payload = EXCLUDED.payload, updated_at = NOW()`,
    [payload]
  );
  return payload;
}

async function saveDraft(createdBy, payload) {
  const result = await query(
    `INSERT INTO cms_drafts (id, created_by, payload, created_at)
     VALUES (gen_random_uuid(), $1, $2, NOW())
     RETURNING *`,
    [createdBy, payload]
  );
  return result.rows[0];
}

async function getDrafts() {
  const { rows } = await query(`SELECT * FROM cms_drafts ORDER BY created_at DESC`);
  return rows;
}

async function saveSubmission(createdBy, payload) {
  const result = await query(
    `INSERT INTO cms_submissions (id, created_by, payload, status, created_at)
     VALUES (gen_random_uuid(), $1, $2, 'pending', NOW())
     RETURNING *`,
    [createdBy, payload]
  );
  return result.rows[0];
}

async function getPendingSubmissions() {
  const { rows } = await query(`SELECT * FROM cms_submissions WHERE status = 'pending' ORDER BY created_at DESC`);
  return rows;
}

async function approveSubmission(id, reviewedBy) {
  const result = await query(
    `UPDATE cms_submissions
     SET status = 'approved', reviewed_by = $1, reviewed_at = NOW()
     WHERE id = $2
     RETURNING *`,
    [reviewedBy, id]
  );
  const row = result.rows[0];
  if (row) {
    await query(
      `INSERT INTO cms_content (scope, payload, updated_at)
       VALUES ('approved', $1, NOW())
       ON CONFLICT (scope)
       DO UPDATE SET payload = EXCLUDED.payload, updated_at = NOW()`,
      [row.payload]
    );
  }
  return row;
}

async function rejectSubmission(id) {
  const result = await query(
    `UPDATE cms_submissions SET status = 'rejected', reviewed_at = NOW() WHERE id = $2 RETURNING *`,
    [id]
  );
  return result.rows[0];
}

async function saveMedia(file) {
  const result = await query(
    `INSERT INTO cms_media (filename, url, mime_type, size_bytes)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [file.filename, file.url, file.mimetype, file.size]
  );
  return result.rows[0];
}

module.exports = {
  pool,
  query,
  getContent,
  saveContent,
  saveDraft,
  getDrafts,
  saveSubmission,
  getPendingSubmissions,
  approveSubmission,
  rejectSubmission,
  saveMedia
};
