const auth = require('../../middleware/auth');
const rbac = require('../../middleware/rbac');
const pool = require('../../config/db');
async function routes(fastify) {
  fastify.get('/overview', { preHandler:[auth, rbac('ADMIN','SENIOR_TL')] }, async ()=>{
    const counts = await pool.query("SELECT role, COUNT(*) FROM users WHERE deleted_at IS NULL GROUP BY role");
    return { users: counts.rows };
  });
}
module.exports = routes;
