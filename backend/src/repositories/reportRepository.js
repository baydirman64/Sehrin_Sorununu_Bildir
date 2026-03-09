const pool = require("../config/db");

async function createReport(data) {
  const {
    user_id,
    title,
    category,
    danger_level,
    description,
    photo_url,
    latitude,
    longitude,
    address,
  } = data;

  const [result] = await pool.query(
    `INSERT INTO reports
     (user_id, title, category, danger_level, description, photo_url, latitude, longitude, address)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      user_id,
      title,
      category,
      danger_level,
      description || null,
      photo_url || null,
      latitude,
      longitude,
      address || null,
    ]
  );

  return result.insertId;
}

async function findById(id) {
  const [rows] = await pool.query(
    `SELECT r.*, u.name AS user_name, u.email AS user_email
     FROM reports r
     JOIN users u ON u.id = r.user_id
     WHERE r.id = ?
     LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

async function listMine(userId) {
  const [rows] = await pool.query(
    `SELECT * FROM reports
     WHERE user_id = ?
     ORDER BY created_at DESC`,
    [userId]
  );
  return rows;
}

async function listAll(filters) {
  const {
    status,
    category,
    danger_level,
    from,
    to,
    page = 1,
    limit = 20,
  } = filters;

  const where = [];
  const params = [];

  if (status) { where.push("r.status = ?"); params.push(status); }
  if (category) { where.push("r.category = ?"); params.push(category); }
  if (danger_level) { where.push("r.danger_level = ?"); params.push(danger_level); }
  if (from) { where.push("r.created_at >= ?"); params.push(from); }
  if (to) { where.push("r.created_at <= ?"); params.push(to); }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const safeLimit = Math.min(Number(limit) || 20, 100);
  const safePage = Math.max(Number(page) || 1, 1);
  const offset = (safePage - 1) * safeLimit;

  const [countRows] = await pool.query(
    `SELECT COUNT(*) AS total FROM reports r ${whereSql}`,
    params
  );
  const total = countRows[0].total;

  const [rows] = await pool.query(
    `SELECT r.*, u.name AS user_name
     FROM reports r
     JOIN users u ON u.id = r.user_id
     ${whereSql}
     ORDER BY r.created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, safeLimit, offset]
  );

  return { total, page: safePage, limit: safeLimit, items: rows };
}

async function listMapItems(filters) {
  const { status, category, danger_level, limit = 500 } = filters;

  const where = [];
  const params = [];

  if (status) { where.push("status = ?"); params.push(status); }
  if (category) { where.push("category = ?"); params.push(category); }
  if (danger_level) { where.push("danger_level = ?"); params.push(danger_level); }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const safeLimit = Math.min(Number(limit) || 500, 2000);

  const [rows] = await pool.query(
    `SELECT id, title, category, danger_level, status, latitude, longitude, created_at
     FROM reports
     ${whereSql}
     ORDER BY created_at DESC
     LIMIT ?`,
    [...params, safeLimit]
  );

  return rows;
}

async function updateStatus(reportId, status) {
  await pool.query(`UPDATE reports SET status = ? WHERE id = ?`, [status, reportId]);
}

module.exports = {
  createReport,
  findById,
  listMine,
  listAll,
  listMapItems,
  updateStatus,
};