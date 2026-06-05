const auth = require('../../middleware/auth');
const rbac = require('../../middleware/rbac');
const repo = require('./repository');
const { createAuditLog } = require('../../utils/audit');
async function routes(fastify) {
  fastify.post('/', { preHandler:[auth, rbac('ADMIN','SENIOR_TL')] }, async (req)=>{
    const task = await repo.createTask({...req.body, createdBy:req.user.id});
    await createAuditLog({ userId:req.user.id, action:'TASK_CREATED', resourceType:'social_task', resourceId:task.id });
    return task;
  });
  fastify.get('/', { preHandler:[auth] }, async (req)=> repo.getTasks(req.query));
}
module.exports = routes;
