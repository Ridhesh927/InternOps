const pool = require('../../config/db');
const argon2 = require('argon2');
async function createUser({ email, password, role, managerId, departmentId, fullName }) {
  const hash = await argon2.hash(password);
  const res = await pool.query(
    `INSERT INTO users (email, password_hash, role, manager_id, department_id, full_name)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING id,email,role,manager_id,department_id,full_name,suspended,created_at`,
    [email,hash,role,managerId,departmentId,fullName]
  );
  return res.rows[0];
}
async function findByEmail(email) {
  const res = await pool.query('SELECT * FROM users WHERE email=$1 AND deleted_at IS NULL', [email]);
  return res.rows[0]||null;
}
async function findById(id) {
  const res = await pool.query('SELECT * FROM users WHERE id=$1 AND deleted_at IS NULL', [id]);
  return res.rows[0]||null;
}
async function verifyPassword(user, password) { return argon2.verify(user.password_hash, password); }
async function storeRefreshToken(userId, tokenHash, expiresAt) {
  await pool.query('INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1,$2,$3)', [userId,tokenHash,expiresAt]);
}
async function revokeRefreshToken(tokenHash) {
  await pool.query('UPDATE refresh_tokens SET revoked=TRUE WHERE token_hash=$1', [tokenHash]);
}
async function revokeAllUserTokens(userId) {
  await pool.query('UPDATE refresh_tokens SET revoked=TRUE WHERE user_id=$1', [userId]);
}
module.exports = { createUser, findByEmail, findById, verifyPassword, storeRefreshToken, revokeRefreshToken, revokeAllUserTokens };
