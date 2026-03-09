// backend/src/repositories/userRepository.js
const pool = require("../config/db");

async function findByEmail(email) {
  const [rows] = await pool.query("SELECT * FROM users WHERE email = ? LIMIT 1", [email]);
  return rows[0] || null;
}

async function findById(id) {
  const [rows] = await pool.query("SELECT id, name, email, role, created_at FROM users WHERE id = ? LIMIT 1", [id]);
  return rows[0] || null;
}

async function createUser({ name, email, password_hash, role = "citizen" }) {
  const [result] = await pool.query(
    "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)",
    [name, email, password_hash, role]
  );
  return result.insertId;
}

module.exports = { findByEmail, findById, createUser };