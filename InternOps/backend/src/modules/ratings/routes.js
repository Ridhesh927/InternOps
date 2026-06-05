const auth = require('../../middleware/auth');
const direct = require('../../middleware/directManager');
const ownership = require('../../middleware/ownership');
const repo = require('./repository');
const { createAuditLog } = require('../../utils/audit');
async function routes(fastify) {
  fastify.post('/', { preHandler:[auth, direct('rated_user_id')] }, async (req)=>{
    const { rated_user_id, score, remarks } = req.body;
    const rating = await repo.addRating(rated_user_id, req.user.id, score, remarks);
    await createAuditLog({ userId:req.user.id, action:'RATING_CREATED', resourceType:'rating', resourceId:rating.id, details:{target:rated_user_id,score} });
    return rating;
  });
  fastify.get('/:userId', { preHandler:[auth, ownership('userId')] }, async (req)=> repo.getRatings(req.params.userId));
}
module.exports = routes;
