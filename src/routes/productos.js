const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', (req, res) => {
  db.query('SELECT * FROM productos', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

router.get('/:id', (req, res) => {
  db.query('SELECT * FROM productos WHERE id = ?', [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(results[0]);
  });
});

router.post('/', (req, res) => {
  const { nombre, precio, categoria, stock } = req.body;
  if (!nombre || !precio || !categoria)
    return res.status(400).json({ error: 'Todos los campos son requeridos' });

  db.query(
    'INSERT INTO productos (nombre, precio, categoria, stock) VALUES (?, ?, ?, ?)',
    [nombre, precio, categoria, stock || 0],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: result.insertId, nombre, precio, categoria, stock: stock || 0 });
    }
  );
});

router.put('/:id', (req, res) => {
  const { nombre, precio, categoria, stock } = req.body;
  db.query(
    'UPDATE productos SET nombre = ?, precio = ?, categoria = ?, stock = ? WHERE id = ?',
    [nombre, precio, categoria, stock || 0, req.params.id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      if (result.affectedRows === 0) return res.status(404).json({ error: 'Producto no encontrado' });
      res.json({ id: req.params.id, nombre, precio, categoria, stock: stock || 0 });
    }
  );
});

router.delete('/:id', (req, res) => {
  db.query('DELETE FROM productos WHERE id = ?', [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json({ mensaje: 'Producto eliminado correctamente' });
  });
});

module.exports = router;