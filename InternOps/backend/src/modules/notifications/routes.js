const auth = require('../../middleware/auth');
const repo = require('./repository');
async function routes(fastify) {
  fastify.get('/', { preHandler:[auth] }, async (req)=> repo.get(req.user.id));
  fastify.patch('/:id/read', { preHandler:[auth] }, async (req)=>{ await repo.markRead(req.params.id, req.user.id); return { success:true }; });
}
module.exports = routes;
