const repo = require('./repository');
const { generateAccessToken, generateRefreshToken, hashToken, verifyRefreshToken } = require('../../utils/tokens');
const { createAuditLog } = require('../../utils/audit');

async function register(data, creator) {
  const user = await repo.createUser(data);
  await createAuditLog({ userId:creator.id, action:'USER_CREATED', resourceType:'user', resourceId:user.id, details:{email:user.email,role:user.role} });
  return user;
}
async function login(email, password, ip) {
  const user = await repo.findByEmail(email);
  if(!user||user.suspended) throw new Error('Invalid credentials or suspended');
  if(!(await repo.verifyPassword(user, password))) throw new Error('Invalid credentials');
  const access = generateAccessToken(user);
  const refresh = generateRefreshToken(user);
  const expires = new Date(Date.now()+7*24*60*60*1000);
  await repo.storeRefreshToken(user.id, hashToken(refresh), expires);
  await createAuditLog({ userId:user.id, action:'LOGIN', ipAddress:ip });
  return { accessToken:access, refreshToken:refresh, user:{id:user.id,email:user.email,role:user.role,fullName:user.full_name} };
}
async function refreshTokens(token, ip) {
  let decoded;
  try { decoded = verifyRefreshToken(token); } catch { throw new Error('Invalid refresh token'); }
  const hash = hashToken(token);
  const pool = require('../../config/db');
  const { rows } = await pool.query('SELECT * FROM refresh_tokens WHERE token_hash=$1 AND revoked=FALSE AND expires_at>NOW()', [hash]);
  if(rows.length===0) throw new Error('Token revoked/expired');
  await repo.revokeRefreshToken(hash);
  const user = await repo.findById(decoded.id);
  if(!user||user.suspended) throw new Error('User not found/suspended');
  const newAccess = generateAccessToken(user);
  const newRefresh = generateRefreshToken(user);
  const newExpiry = new Date(Date.now()+7*24*60*60*1000);
  await repo.storeRefreshToken(user.id, hashToken(newRefresh), newExpiry);
  return { accessToken:newAccess, refreshToken:newRefresh };
}
async function logout(token) { await repo.revokeRefreshToken(hashToken(token)); }
module.exports = { register, login, refreshTokens, logout };
