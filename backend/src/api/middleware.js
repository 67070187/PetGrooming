const jwt = require('jsonwebtoken');
const { fail } = require('./helpers');

function auth(req, res, next) {
  const token = /^Bearer (.+)$/i.exec(req.get('authorization') || '');
  if (!token) return fail(res, 401, 'UNAUTHORIZED', 'กรุณาเข้าสู่ระบบ');
  try {
    req.user = jwt.verify(token[1], process.env.JWT_SECRET);
    next();
  } catch {
    return fail(res, 401, 'UNAUTHORIZED', 'Token ไม่ถูกต้อง');
  }
}

function staff(req, res, next) {
  if (req.user.role !== 'staff') return fail(res, 403, 'FORBIDDEN', 'เฉพาะพนักงาน');
  next();
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  console.error('Request failed:', err.code || err.message); // never log bodies/headers
  fail(res, 500, 'INTERNAL_ERROR', 'เกิดข้อผิดพลาดในระบบ');
}

module.exports = { auth, staff, errorHandler };
