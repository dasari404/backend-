const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host:               process.env.DB_HOST     || 'localhost',
  port:               parseInt(process.env.DB_PORT || '3306', 10),
  user:               process.env.DB_USER     || 'root',
  password:           process.env.DB_PASSWORD || '',
  database:           process.env.DB_NAME     || 'travelsphere',
  waitForConnections: true,
  connectionLimit:    10,
  timezone:           '+00:00',
});

// Seed default admin on first run
async function seedAdmin() {
  const bcrypt = require('bcryptjs');
  const [[rows]] = await pool.query("SELECT id FROM users WHERE role='admin' LIMIT 1");
  if (!rows) {
    const hash = bcrypt.hashSync('Admin@1234', 10);
    await pool.query(
      "INSERT INTO users (email, password_hash, role, is_verified) VALUES (?,?,'admin',1)",
      ['admin@travelsphere.in', hash]
    );
    console.log('✅ Default admin created — admin@travelsphere.in / Admin@1234');
  }
}

pool.getConnection()
  .then(conn => { conn.release(); console.log('✅ MySQL connected'); return seedAdmin(); })
  .catch(err  => { console.error('❌ MySQL connection failed:', err.message); process.exit(1); });

module.exports = pool;
