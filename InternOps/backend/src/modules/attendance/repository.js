const pool = require('../../config/db');
async function markAttendance(userId, markedBy, date, status) {
  const res = await pool.query(
    `INSERT INTO attendance (user_id, marked_by, date, status) VALUES ($1,$2,$3,$4)
     ON CONFLICT (user_id, date) DO UPDATE SET status=$4, marked_by=$2, updated_at=NOW() RETURNING *`,
    [userId,markedBy,date,status]
  );
  return res.rows[0];
}
async function getAttendance(userId, from, to) {
  let q = 'SELECT * FROM attendance WHERE user_id=$1 AND deleted_at IS NULL';
  const params = [userId];
  if(from) { q += ' AND date>=$2'; params.push(from); }
  if(to) { q += ' AND date<=$'+(params.length+1); params.push(to); }
  const res = await pool.query(q, params);
  return res.rows;
}
module.exports = { markAttendance, getAttendance };
