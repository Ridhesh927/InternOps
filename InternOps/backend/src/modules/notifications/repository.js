const pool = require('../../config/db');
async function send(userId, msg) { await pool.query('INSERT INTO notifications (user_id, message) VALUES ($1,$2)', [userId,msg]); }
async function get(userId) { return (await pool.query('SELECT * FROM notifications WHERE user_id=$1 ORDER BY created_at DESC LIMIT 50', [userId])).rows; }
async function markRead(notifId, userId) { await pool.query('UPDATE notifications SET read=TRUE WHERE id=$1 AND user_id=$2', [notifId,userId]); }
module.exports = { send, get, markRead };
