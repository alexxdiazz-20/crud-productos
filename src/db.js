const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'crud-productos'
});

db.connect((err) => {
  if (err) {
    console.error('Error conectando a MySQL:', err);
    return;
  }
  console.log('Conectado a MySQL correctamente');
});

db.query(`
  CREATE TABLE IF NOT EXISTS productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    precio DECIMAL(10,2) NOT NULL,
    categoria VARCHAR(255) NOT NULL,
    stock INT NOT NULL DEFAULT 0
  )
`, (err) => {
  if (err) console.error('Error creando tabla:', err);
});

db.query(`ALTER TABLE productos ADD COLUMN IF NOT EXISTS stock INT NOT NULL DEFAULT 0`, (err) => {
  if (err && !err.message.includes('Duplicate column')) {
    console.error('Error alterando tabla:', err);
  }
});

module.exports = db;