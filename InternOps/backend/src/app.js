require('dotenv').config();
const Fastify = require('fastify');
const config = require('./config');
const authRoutes = require('./modules/auth/routes');
const userRoutes = require('./modules/users/routes');
const departmentRoutes = require('./modules/departments/routes');
const attendanceRoutes = require('./modules/attendance/routes');
const ratingRoutes = require('./modules/ratings/routes');
const socialTaskRoutes = require('./modules/social-tasks/routes');
const proofRoutes = require('./modules/proof-submissions/routes');
const notificationRoutes = require('./modules/notifications/routes');
const auditRoutes = require('./modules/audit/routes');
const uploadRoutes = require('./modules/uploads/routes');
const hierarchyRoutes = require('./modules/hierarchy/routes');
const analyticsRoutes = require('./modules/analytics/routes');
const uptoskillsRoutes = require('./modules/uptoskills/routes');
const { setupCronJobs } = require('./utils/cron');

const app = Fastify({
  logger: config.nodeEnv==='development' ? { transport: { target: 'pino-pretty' } } : true
});
app.register(require('@fastify/cors'), { origin: true, credentials: true });
app.register(require('@fastify/helmet'));
app.register(require('@fastify/rate-limit'), { max: 100, timeWindow: '1 minute' });
app.register(require('@fastify/cookie'));
app.register(require('@fastify/multipart'), { limits: { fileSize: config.maxFileSize } });
app.register(require('@fastify/static'), { root: require('path').join(__dirname,'..',config.uploadDir), prefix: '/uploads/' });
app.register(require('@fastify/swagger'), { openapi: { info: { title: 'InternOps API', version: '1.0.0' } } });
app.register(require('@fastify/swagger-ui'), { routePrefix: '/docs' });

app.register(authRoutes, { prefix: '/api/auth' });
app.register(userRoutes, { prefix: '/api/users' });
app.register(departmentRoutes, { prefix: '/api/departments' });
app.register(attendanceRoutes, { prefix: '/api/attendance' });
app.register(ratingRoutes, { prefix: '/api/ratings' });
app.register(socialTaskRoutes, { prefix: '/api/tasks' });
app.register(proofRoutes, { prefix: '/api/proofs' });
app.register(notificationRoutes, { prefix: '/api/notifications' });
app.register(auditRoutes, { prefix: '/api/audit' });
app.register(uploadRoutes, { prefix: '/api/uploads' });
app.register(analyticsRoutes, { prefix: '/api/analytics' });
app.register(hierarchyRoutes, { prefix: '/api/hierarchy' });
app.register(uptoskillsRoutes, { prefix: '/api/uptoskills' });

app.get('/health', async ()=>({ status: 'ok' }));
app.setErrorHandler((error, request, reply)=>{
  request.log.error(error);
  reply.status(error.statusCode||500).send({ error: error.message||'Internal Server Error' });
});
setupCronJobs();

const start = async ()=>{
  try {
    await app.listen({ port: config.port, host: config.host });
  } catch(err) {
    app.log.error(err);
    process.exit(1);
  }
};
start();

