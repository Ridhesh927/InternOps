const service = require('./service');
const { z } = require('zod');
const rbac = require('../../middleware/rbac');
async function routes(fastify) {
  fastify.post('/register', { preHandler:[rbac('ADMIN')] }, async (req,reply)=>{
    const schema = z.object({
      email: z.string().email(),
      password: z.string().min(8),
      role: z.enum(['ADMIN','SENIOR_TL','TL','CAPTAIN','INTERN']),
      managerId: z.string().uuid().optional(),
      departmentId: z.string().uuid().optional(),
      fullName: z.string().optional()
    });
    const data = schema.parse(req.body);
    return reply.status(201).send(await service.register(data, req.user));
  });
  fastify.post('/login', async (req,reply)=>{
    const { email, password } = z.object({ email:z.string().email(), password:z.string() }).parse(req.body);
    const result = await service.login(email, password, req.ip);
    reply.setCookie('refreshToken', result.refreshToken, { httpOnly:true, secure:false, sameSite:'strict', path:'/api/auth/refresh' });
    return { accessToken: result.accessToken, user: result.user };
  });
  fastify.post('/refresh', async (req,reply)=>{
    const token = req.cookies.refreshToken || req.body.refreshToken;
    if(!token) return reply.status(400).send({ error:'Refresh token required' });
    const tokens = await service.refreshTokens(token, req.ip);
    reply.setCookie('refreshToken', tokens.refreshToken, { httpOnly:true, secure:false, sameSite:'strict', path:'/api/auth/refresh' });
    return { accessToken: tokens.accessToken };
  });
  fastify.post('/logout', async (req,reply)=>{
    const token = req.cookies.refreshToken || req.body.refreshToken;
    if(token) await service.logout(token);
    reply.clearCookie('refreshToken', { path:'/api/auth/refresh' });
    return { message:'Logged out' };
  });
}
module.exports = routes;
