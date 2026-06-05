const pool = require('../config/db');
async function createAuditLog({ userId, action, resourceType, resourceId, details, ipAddress }) {
  await pool.query(
    'INSERT INTO audit_logs (user_id, action, resource_type, resource_id, details, ip_address) VALUES ($1,$2,$3,$4,$5,$6)',
    [userId, action, resourceType, resourceId, details?JSON.stringify(details):null, ipAddress]
  );
}
module.exports = { createAuditLog };
