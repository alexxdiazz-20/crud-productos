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
  if (err) console.error('Error creando tabla productos:', err);
});

db.query(`ALTER TABLE productos ADD COLUMN IF NOT EXISTS stock INT NOT NULL DEFAULT 0`, (err) => {
  if (err && !err.message.includes('Duplicate column')) {
    console.error('Error alterando tabla:', err);
  }
});

db.query(`
  CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`, (err) => {
  if (err) console.error('Error creando tabla usuarios:', err);
});

// Usuario por defecto: admin / admin123
db.query(`
  INSERT IGNORE INTO usuarios (nombre, email, password) VALUES ('Administrador', 'admin@crud.com', 'admin123')
`, (err) => {
  if (err) console.error('Error insertando usuario por defecto:', err);
});

module.exports = db;