const API = 'http://localhost:3000/api/productos';
let todosLosProductos = [];
let productoAEliminar = null;
let ordenActual = { columna: null, asc: true };

// Toast
function showToast(msg, isError = false) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.className = 'toast visible' + (isError ? ' error' : '');
  setTimeout(() => toast.className = 'toast', 3000);
}

// Validacion
function validarFormulario() {
  let valido = true;
  const nombre = document.getElementById('nombre').value.trim();
  const precio = parseFloat(document.getElementById('precio').value);
  const categoria = document.getElementById('categoria').value.trim();

  ['nombre', 'precio', 'categoria'].forEach(id => {
    document.getElementById(id).classList.remove('error');
    document.getElementById(id + 'Error').classList.remove('visible');
  });

if (!nombre || nombre.length < 2) {
  document.getElementById('nombre').classList.add('error');
  document.getElementById('nombreError').classList.add('visible');
  setTimeout(() => {
    document.getElementById('nombre').classList.remove('error');
    document.getElementById('nombreError').classList.remove('visible');
  }, 4000);
  valido = false;
}
if (!precio || precio <= 0) {
  document.getElementById('precio').classList.add('error');
  document.getElementById('precioError').classList.add('visible');
  setTimeout(() => {
    document.getElementById('precio').classList.remove('error');
    document.getElementById('precioError').classList.remove('visible');
  }, 4000);
  valido = false;
}
if (!categoria || categoria.length < 2) {
  document.getElementById('categoria').classList.add('error');
  document.getElementById('categoriaError').classList.add('visible');
  setTimeout(() => {
    document.getElementById('categoria').classList.remove('error');
    document.getElementById('categoriaError').classList.remove('visible');
  }, 4000);
  valido = false;
}

  return valido;
}

// Stats
function actualizarStats(productos) {
  document.getElementById('totalProductos').textContent = productos.length;
  const categorias = [...new Set(productos.map(p => p.categoria))];
  document.getElementById('totalCategorias').textContent = categorias.length;
  const promedio = productos.length > 0
    ? productos.reduce((a, p) => a + parseFloat(p.precio), 0) / productos.length
    : 0;
  document.getElementById('precioPromedio').textContent = '$' + promedio.toFixed(2);
}

// Filtro categoria
function actualizarFiltroCategoria(productos) {
  const select = document.getElementById('filterCategoria');
  const categorias = [...new Set(productos.map(p => p.categoria))];
  const valorActual = select.value;
  select.innerHTML = '<option value="">Todas las categorías</option>';
  categorias.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c;
    opt.textContent = c;
    if (c === valorActual) opt.selected = true;
    select.appendChild(opt);
  });
}

// Filtrar
function filtrarProductos() {
  const busqueda = document.getElementById('searchInput').value.toLowerCase();
  const categoria = document.getElementById('filterCategoria').value;
  let filtrados = todosLosProductos.filter(p => {
    const coincideNombre = p.nombre.toLowerCase().includes(busqueda);
    const coincideCategoria = categoria === '' || p.categoria === categoria;
    return coincideNombre && coincideCategoria;
  });

  if (ordenActual.columna) {
    filtrados.sort((a, b) => {
      let valA = a[ordenActual.columna];
      let valB = b[ordenActual.columna];
      if (ordenActual.columna === 'precio') { valA = parseFloat(valA); valB = parseFloat(valB); }
      else { valA = valA.toLowerCase(); valB = valB.toLowerCase(); }
      return ordenActual.asc ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
    });
  }

  renderTabla(filtrados);
}

// Ordenar por columna
function ordenarPor(columna) {
  if (ordenActual.columna === columna) {
    ordenActual.asc = !ordenActual.asc;
  } else {
    ordenActual.columna = columna;
    ordenActual.asc = true;
  }
  filtrarProductos();
}

// Render tabla
function renderTabla(productos) {
  const tbody = document.getElementById('productosTable');
  tbody.innerHTML = '';
  if (productos.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="empty-msg">No se encontraron productos</td></tr>';
    return;
  }
  const idEditando = document.getElementById('productId').value;
  productos.forEach(p => {
    const fila = document.createElement('tr');
    if (String(p.id) === String(idEditando)) fila.classList.add('editando');
    fila.innerHTML = `
      <td>${p.id}</td>
      <td>${p.nombre}</td>
      <td>$${parseFloat(p.precio).toFixed(2)}</td>
      <td><span class="badge">${p.categoria}</span></td>
      <td>
        <button class="btn-edit" onclick="editarProducto(${p.id}, '${p.nombre}', ${p.precio}, '${p.categoria}')">Editar</button>
        <button class="btn-delete" onclick="confirmarEliminar(${p.id}, '${p.nombre}')">Eliminar</button>
      </td>`;
    tbody.appendChild(fila);
  });
}

// Cargar productos
async function cargarProductos() {
  const res = await fetch(API);
  todosLosProductos = await res.json();
  actualizarStats(todosLosProductos);
  actualizarFiltroCategoria(todosLosProductos);
  filtrarProductos();
}

// Submit formulario
document.getElementById('productForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!validarFormulario()) return;
  const id = document.getElementById('productId').value;
  const body = {
    nombre: document.getElementById('nombre').value.trim(),
    precio: parseFloat(document.getElementById('precio').value),
    categoria: document.getElementById('categoria').value.trim()
  };
  if (id) {
    await fetch(`${API}/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    showToast('Producto actualizado correctamente ✏️');
  } else {
    await fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    showToast('Producto agregado correctamente ✅');
  }
  clearForm();
  cargarProductos();
});

// Editar
function editarProducto(id, nombre, precio, categoria) {
  document.getElementById('productId').value = id;
  document.getElementById('nombre').value = nombre;
  document.getElementById('precio').value = precio;
  document.getElementById('categoria').value = categoria;
  document.getElementById('formTitle').textContent = 'Editar Producto';
  document.getElementById('submitBtn').textContent = 'Actualizar';
  document.getElementById('submitBtn').className = 'btn-update';
  document.getElementById('cancelBtn').style.display = 'inline-block';
  filtrarProductos();
  document.getElementById('productForm').scrollIntoView({ behavior: 'smooth' });
}

// Modal eliminar
function confirmarEliminar(id, nombre) {
  productoAEliminar = id;
  document.getElementById('modalProductoNombre').textContent = nombre;
  document.getElementById('modalEliminar').classList.add('visible');
}

function cerrarModal() {
  productoAEliminar = null;
  document.getElementById('modalEliminar').classList.remove('visible');
}

async function ejecutarEliminar() {
  if (!productoAEliminar) return;
  await fetch(`${API}/${productoAEliminar}`, { method: 'DELETE' });
  cerrarModal();
  showToast('Producto eliminado 🗑️', true);
  cargarProductos();
}

// Limpiar formulario
function clearForm() {
  document.getElementById('productForm').reset();
  document.getElementById('productId').value = '';
  document.getElementById('formTitle').textContent = 'Agregar Producto';
  document.getElementById('submitBtn').textContent = 'Agregar';
  document.getElementById('submitBtn').className = 'btn-add';
  document.getElementById('cancelBtn').style.display = 'none';
  document.querySelectorAll('tr.editando').forEach(tr => tr.classList.remove('editando'));
}

// Dark mode
function toggleDarkMode() {
  document.body.classList.toggle('dark');
  const isDark = document.body.classList.contains('dark');
  localStorage.setItem('darkMode', isDark);
  document.getElementById('btnDark').textContent = isDark ? '☀️ Modo claro' : '🌙 Modo oscuro';
}

// Export CSV
function exportarCSV() {
  const busqueda = document.getElementById('searchInput').value.toLowerCase();
  const categoria = document.getElementById('filterCategoria').value;
  const filtrados = todosLosProductos.filter(p => {
    return p.nombre.toLowerCase().includes(busqueda) && (categoria === '' || p.categoria === categoria);
  });
  const filas = [['ID', 'Nombre', 'Precio', 'Categoria']];
  filtrados.forEach(p => filas.push([p.id, p.nombre, p.precio, p.categoria]));
  const csv = filas.map(f => f.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'productos.csv';
  a.click();
  URL.revokeObjectURL(url);
  showToast('Exportado correctamente 📊');
}

// Inicializar
window.onload = () => {
  const isDark = localStorage.getItem('darkMode') === 'true';
  if (isDark) {
    document.body.classList.add('dark');
    document.getElementById('btnDark').textContent = '☀️ Modo claro';
  }

  ['nombre', 'precio', 'categoria'].forEach(id => {
    const input = document.getElementById(id);

    // Al salir del campo — quita el error
    input.addEventListener('blur', () => {
      input.classList.remove('error');
      document.getElementById(id + 'Error').classList.remove('visible');
    });
  });

  cargarProductos();
};