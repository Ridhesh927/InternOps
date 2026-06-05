const auth = require('../../middleware/auth');
const repo = require('./repository');

async function routes(fastify) {
  // List my direct reports
  fastify.get('/my/direct-reports', { preHandler: [auth] }, async (req) => {
    return repo.getDirectReports(req.user.id);
  });

  // Full team under me (recursive)
  fastify.get('/my/team', { preHandler: [auth] }, async (req) => {
    return repo.getFullTeam(req.user.id);
  });

  // Upward management chain (who do I report to)
  fastify.get('/my/chain', { preHandler: [auth] }, async (req) => {
    return repo.getUpwardChain(req.user.id);
  });
}

module.exports = routes;
