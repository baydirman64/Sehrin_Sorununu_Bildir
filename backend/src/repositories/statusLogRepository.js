const pool = require("../config/db");

async function addLog({ report_id, changed_by, old_status, new_status }) {
  await pool.query(
    `INSERT INTO report_status_logs (report_id, changed_by, old_status, new_status)
     VALUES (?, ?, ?, ?)`,
    [report_id, changed_by, old_status, new_status]
  );
}

async function listByReport(reportId) {
  const [rows] = await pool.query(
    `SELECT l.*, u.name AS changed_by_name
     FROM report_status_logs l
     JOIN users u ON u.id = l.changed_by
     WHERE l.report_id = ?
     ORDER BY l.created_at DESC`,
    [reportId]
  );
  return rows;
}

module.exports = { addLog, listByReport };