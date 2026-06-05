const auth = require('../../middleware/auth');
const direct = require('../../middleware/directManager');
const ownership = require('../../middleware/ownership');
const repo = require('./repository');
const { createAuditLog } = require('../../utils/audit');
async function routes(fastify) {
  fastify.post('/mark', { preHandler:[auth, direct('user_id')] }, async (req)=>{
    const { user_id, date, status } = req.body;
    const att = await repo.markAttendance(user_id, req.user.id, date, status);
    await createAuditLog({ userId:req.user.id, action:'ATTENDANCE_MARKED', resourceType:'attendance', resourceId:att.id, details:{target:user_id,date,status} });
    return att;
  });
  fastify.get('/:userId', { preHandler:[auth, ownership('userId')] }, async (req)=>{
    return repo.getAttendance(req.params.userId, req.query.from, req.query.to);
  });
}
module.exports = routes;
