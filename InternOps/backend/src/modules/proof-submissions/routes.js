const auth = require('../../middleware/auth');
const rbac = require('../../middleware/rbac');
const repo = require('../social-tasks/repository');
const { createAuditLog } = require('../../utils/audit');
const { checkHierarchyAccess } = require('../../utils/hierarchy');
async function routes(fastify) {
  fastify.post('/submit', { preHandler:[auth, rbac('INTERN')] }, async (req,reply)=>{
    const { task_id } = req.body;
    const data = await req.file();
    if(!data) return reply.status(400).send({ error:'Image required' });
    const path = require('path'); const fs = require('fs');
    const filename = Date.now()+'-'+data.filename;
    const uploadPath = path.join('uploads', filename);
    await fs.promises.writeFile(uploadPath, await data.toBuffer());
    const proof = await repo.submitProof(task_id, req.user.id, uploadPath);
    await createAuditLog({ userId:req.user.id, action:'PROOF_SUBMITTED', resourceType:'proof', resourceId:proof.id });
    return proof;
  });
  fastify.patch('/:id/verify', { preHandler:[auth, rbac('CAPTAIN','TL','SENIOR_TL')] }, async (req,reply)=>{
    const pool = require('../../config/db');
    const { rows:[proof] } = await pool.query('SELECT * FROM proof_submissions WHERE id=$1', [req.params.id]);
    if(!proof) return reply.status(404).send({ error:'Proof not found' });
    if(req.user.role!=='ADMIN') {
      const allowed = await checkHierarchyAccess(req.user.id, proof.intern_id);
      if(!allowed) return reply.status(403).send({ error:'Not in your hierarchy' });
    }
    const verified = await repo.verifyProof(req.params.id, req.user.id);
    await createAuditLog({ userId:req.user.id, action:'PROOF_VERIFIED', resourceType:'proof', resourceId:verified.id });
    return verified;
  });
  fastify.get('/task/:taskId', { preHandler:[auth, rbac('CAPTAIN','TL','SENIOR_TL','ADMIN')] }, async (req)=> repo.getProofsByTask(req.params.taskId));
  fastify.get('/my', { preHandler:[auth] }, async (req)=> repo.getProofsByIntern(req.user.id));
}
module.exports = routes;
