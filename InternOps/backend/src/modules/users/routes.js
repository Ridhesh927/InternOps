const auth = require('../../middleware/auth');
const rbac = require('../../middleware/rbac');
const ownership = require('../../middleware/ownership');
const repo = require('./repository');
const { createAuditLog } = require('../../utils/audit');
async function routes(fastify) {
  fastify.get('/', { preHandler:[auth, rbac('ADMIN')] }, async (req)=>{
    const { rows } = await repo.listUsersByRole(req.query.role||'INTERN');
    return rows;
  });
  fastify.get('/:id', { preHandler:[auth, ownership('id')] }, async (req,reply)=>{
    const { rows:[user] } = await repo.getUserById(req.params.id);
    return user || reply.status(404).send({ error:'Not found' });
  });
  fastify.patch('/:id/suspend', { preHandler:[auth, rbac('ADMIN')] }, async (req)=>{
    await repo.suspendUser(req.params.id);
    await createAuditLog({ userId:req.user.id, action:'USER_SUSPENDED', resourceType:'user', resourceId:req.params.id });
    return { message:'Suspended' };
  });
  fastify.patch('/:id/activate', { preHandler:[auth, rbac('ADMIN')] }, async (req)=>{
    await repo.activateUser(req.params.id);
    await createAuditLog({ userId:req.user.id, action:'USER_ACTIVATED', resourceType:'user', resourceId:req.params.id });
    return { message:'Activated' };
  });
  fastify.delete('/:id', { preHandler:[auth, rbac('ADMIN')] }, async (req)=>{
    await repo.softDeleteUser(req.params.id);
    await createAuditLog({ userId:req.user.id, action:'USER_DELETED', resourceType:'user', resourceId:req.params.id });
    return { message:'Soft-deleted' };
  });
}
module.exports = routes;
