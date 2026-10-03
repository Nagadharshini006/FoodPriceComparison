const bcrypt = require('bcryptjs');
require('dotenv').config();
const db = require('./db');
(async () => {
  try {
    const hash = await bcrypt.hash('admin@123', 10);
    await db.query(`INSERT INTO users (email, password_hash, role) VALUES (?, ?, 'admin')
      ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), role = 'admin'`, ['admin@foodcomparator.local', hash]);
    console.log('Admin created/reset. Username: admin | Password: admin@123');
  } catch (e) { console.error(e.message); process.exitCode = 1; }
  finally { await db.end(); }
})();
