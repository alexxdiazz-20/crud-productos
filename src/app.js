const express = require('express');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
const productosRouter = require('./routes/productos');
const authRouter = require('./routes/auth');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'crud-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 } // 1 hora
}));

// Middleware para proteger rutas
function requireAuth(req, res, next) {
  if (req.session.usuario) return next();
  res.status(401).json({ error: 'No autorizado' });
}

app.use('/auth', authRouter);
app.use('/api/productos', requireAuth, productosRouter);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});