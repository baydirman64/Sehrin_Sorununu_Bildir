// backend/src/repositories/noteRepository.js
const pool = require("../config/db");

async function addNote({ report_id, authority_id, note }) {
  const [result] = await pool.query(
    `INSERT INTO authority_notes (report_id, authority_id, note)
     VALUES (?, ?, ?)`,
    [report_id, authority_id, note]
  );
  return result.insertId;
}

async function listNotes(reportId) {
  const [rows] = await pool.query(
    `SELECT n.*, u.name AS authority_name
     FROM authority_notes n
     JOIN users u ON u.id = n.authority_id
     WHERE n.report_id = ?
     ORDER BY n.created_at DESC`,
    [reportId]
  );
  return rows;
}

module.exports = { addNote, listNotes };