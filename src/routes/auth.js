const express = require('express');
const router = express.Router();
const db = require('../db');

// Mostrar login
router.get('/login', (req, res) => {
  if (req.session.usuario) return res.redirect('/');
  res.sendFile('login.html', { root: './src/public' });
});

// Procesar login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Todos los campos son requeridos' });

  db.query('SELECT * FROM usuarios WHERE email = ? AND password = ?', [email, password], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0)
      return res.status(401).json({ error: 'Credenciales incorrectas' });

    req.session.usuario = {
      id: results[0].id,
      nombre: results[0].nombre,
      email: results[0].email
    };
    res.json({ success: true, nombre: results[0].nombre });
  });
});

// Logout
router.post('/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

// Verificar sesion
router.get('/session', (req, res) => {
  if (req.session.usuario) {
    res.json({ loggedIn: true, usuario: req.session.usuario });
  } else {
    res.json({ loggedIn: false });
  }
});

module.exports = router;