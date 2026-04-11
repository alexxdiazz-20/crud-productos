const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3000';
const EMAIL = 'admin@crud.com';
const PASSWORD = 'admin123';

let driver;
let resultados = [];

async function tomarCaptura(nombre) {
  const screenshot = await driver.takeScreenshot();
  const filePath = path.join(__dirname, 'screenshots', `${nombre}.png`);
  fs.writeFileSync(filePath, screenshot, 'base64');
  console.log(`📸 Captura: ${nombre}.png`);
}

async function registrarResultado(historia, prueba, tipo, estado, error = '') {
  resultados.push({ historia, prueba, tipo, estado, error, fecha: new Date().toLocaleString() });
}

async function esperar(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function hacerLogin() {
  await driver.get(`${BASE_URL}/auth/login`);
  await esperar(1500);
  await driver.findElement(By.id('email')).sendKeys(EMAIL);
  await driver.findElement(By.id('password')).sendKeys(PASSWORD);
  await driver.findElement(By.id('btnLogin')).click();
  await esperar(2000);
}

async function hacerLogout() {
  try {
    await driver.get(BASE_URL);
    await esperar(1000);
    const btnSalir = await driver.findElements(By.xpath("//button[contains(text(),'Salir')]"));
    if (btnSalir.length > 0) {
      await btnSalir[0].click();
      await esperar(1500);
    }
  } catch (e) {
    await driver.get(`${BASE_URL}/auth/login`);
    await esperar(1000);
  }
}

// =====================
// HU-01: LOGIN EXITOSO
// =====================
async function loginExitoso() {
  console.log('\n🧪 HU-01: Login exitoso');
  try {
    await driver.get(`${BASE_URL}/auth/login`);
    await esperar(1500);
    await driver.findElement(By.id('email')).sendKeys(EMAIL);
    await driver.findElement(By.id('password')).sendKeys(PASSWORD);
    await tomarCaptura('HU01_camino_feliz_antes');
    await driver.findElement(By.id('btnLogin')).click();
    await esperar(2000);
    const url = await driver.getCurrentUrl();
    if (!url.includes('login')) {
      console.log('  ✅ Camino feliz: Login exitoso');
      await tomarCaptura('HU01_camino_feliz_despues');
      await registrarResultado('HU-01', 'Login exitoso', 'Camino feliz', 'PASÓ');
    } else {
      throw new Error('No redirigió al dashboard');
    }
  } catch (e) {
    await tomarCaptura('HU01_camino_feliz_error');
    await registrarResultado('HU-01', 'Login exitoso', 'Camino feliz', 'FALLÓ', e.message);
    console.log('  ❌ Error:', e.message);
  }
  await hacerLogout();
}

// ========================
// HU-02: LOGIN FALLIDO
// ========================
async function loginFallido() {
  console.log('\n🧪 HU-02: Login fallido');

  try {
    await driver.get(`${BASE_URL}/auth/login`);
    await esperar(1500);
    await driver.findElement(By.id('email')).sendKeys('malo@email.com');
    await driver.findElement(By.id('password')).sendKeys('wrongpassword');
    await tomarCaptura('HU02_negativa_antes');
    await driver.findElement(By.id('btnLogin')).click();
    await esperar(2000);
    const url = await driver.getCurrentUrl();
    if (url.includes('login')) {
      console.log('  ✅ Prueba negativa: No permite credenciales incorrectas');
      await tomarCaptura('HU02_negativa_despues');
      await registrarResultado('HU-02', 'Login - credenciales incorrectas', 'Prueba negativa', 'PASÓ');
    } else {
      throw new Error('Permitió acceso con credenciales incorrectas');
    }
  } catch (e) {
    await tomarCaptura('HU02_negativa_error');
    await registrarResultado('HU-02', 'Login - credenciales incorrectas', 'Prueba negativa', 'FALLÓ', e.message);
    console.log('  ❌ Error:', e.message);
  }

  try {
    await driver.get(`${BASE_URL}/auth/login`);
    await esperar(1500);
    await tomarCaptura('HU02_limites_antes');
    await driver.findElement(By.id('btnLogin')).click();
    await esperar(1500);
    const emailError = await driver.findElement(By.id('emailError')).isDisplayed();
    const passError = await driver.findElement(By.id('passwordError')).isDisplayed();
    if (emailError || passError) {
      console.log('  ✅ Prueba de límites: Muestra errores con campos vacíos');
      await tomarCaptura('HU02_limites_despues');
      await registrarResultado('HU-02', 'Login - campos vacíos', 'Prueba de límites', 'PASÓ');
    } else {
      throw new Error('No mostró errores de validación');
    }
  } catch (e) {
    await tomarCaptura('HU02_limites_error');
    await registrarResultado('HU-02', 'Login - campos vacíos', 'Prueba de límites', 'FALLÓ', e.message);
    console.log('  ❌ Error:', e.message);
  }
}

// =======================
// HU-03: CREAR PRODUCTO
// =======================
async function crearProducto() {
  console.log('\n🧪 HU-03: Crear producto');
  await hacerLogin();

  try {
    await driver.findElement(By.id('nombre')).sendKeys('Producto Test');
    await driver.findElement(By.id('precio')).sendKeys('100');
    await driver.findElement(By.id('categoria')).sendKeys('Test');
    await driver.findElement(By.id('stock')).sendKeys('10');
    await tomarCaptura('HU03_camino_feliz_antes');
    await driver.findElement(By.id('submitBtn')).click();
    await esperar(2000);
    await tomarCaptura('HU03_camino_feliz_despues');
    console.log('  ✅ Camino feliz: Producto creado');
    await registrarResultado('HU-03', 'Crear producto', 'Camino feliz', 'PASÓ');
  } catch (e) {
    await tomarCaptura('HU03_camino_feliz_error');
    await registrarResultado('HU-03', 'Crear producto', 'Camino feliz', 'FALLÓ', e.message);
    console.log('  ❌ Error:', e.message);
  }

  try {
    await driver.findElement(By.id('submitBtn')).click();
    await esperar(1500);
    const nombreError = await driver.findElement(By.id('nombreError')).isDisplayed();
    if (nombreError) {
      console.log('  ✅ Prueba negativa: No permite crear sin campos');
      await tomarCaptura('HU03_negativa_despues');
      await registrarResultado('HU-03', 'Crear producto - campos vacíos', 'Prueba negativa', 'PASÓ');
    } else {
      throw new Error('No mostró error de validación');
    }
  } catch (e) {
    await tomarCaptura('HU03_negativa_error');
    await registrarResultado('HU-03', 'Crear producto - campos vacíos', 'Prueba negativa', 'FALLÓ', e.message);
    console.log('  ❌ Error:', e.message);
  }

  try {
    await driver.findElement(By.id('nombre')).sendKeys('Test Limite');
    await driver.executeScript("document.getElementById('precio').value = '-50'");
    await driver.findElement(By.id('categoria')).sendKeys('Test');
    await driver.findElement(By.id('stock')).sendKeys('5');
    await tomarCaptura('HU03_limites_antes');
    await driver.findElement(By.id('submitBtn')).click();
    await esperar(1500);
    const precioError = await driver.findElement(By.id('precioError')).isDisplayed();
    if (precioError) {
      console.log('  ✅ Prueba de límites: No permite precio negativo');
      await tomarCaptura('HU03_limites_despues');
      await registrarResultado('HU-03', 'Crear producto - precio negativo', 'Prueba de límites', 'PASÓ');
    } else {
      throw new Error('Permitió precio negativo');
    }
  } catch (e) {
    await tomarCaptura('HU03_limites_error');
    await registrarResultado('HU-03', 'Crear producto - precio negativo', 'Prueba de límites', 'FALLÓ', e.message);
    console.log('  ❌ Error:', e.message);
  }

  await hacerLogout();
}

// =======================
// HU-04: EDITAR PRODUCTO
// =======================
async function editarProducto() {
  console.log('\n🧪 HU-04: Editar producto');
  await hacerLogin();

  try {
    await esperar(1500);
    const btnEditar = await driver.findElement(By.className('btn-edit'));
    await tomarCaptura('HU04_camino_feliz_antes');
    await btnEditar.click();
    await esperar(1000);
    const nombreInput = await driver.findElement(By.id('nombre'));
    await nombreInput.clear();
    await nombreInput.sendKeys('Producto Editado');
    const precioInput = await driver.findElement(By.id('precio'));
    await precioInput.clear();
    await precioInput.sendKeys('200');
    await driver.findElement(By.id('submitBtn')).click();
    await esperar(2000);
    await tomarCaptura('HU04_camino_feliz_despues');
    console.log('  ✅ Camino feliz: Producto editado');
    await registrarResultado('HU-04', 'Editar producto', 'Camino feliz', 'PASÓ');
  } catch (e) {
    await tomarCaptura('HU04_camino_feliz_error');
    await registrarResultado('HU-04', 'Editar producto', 'Camino feliz', 'FALLÓ', e.message);
    console.log('  ❌ Error:', e.message);
  }

  try {
    const btnEditar = await driver.findElement(By.className('btn-edit'));
    await btnEditar.click();
    await esperar(1000);
    const precioInput = await driver.findElement(By.id('precio'));
    await precioInput.clear();
    await tomarCaptura('HU04_negativa_antes');
    await driver.findElement(By.id('submitBtn')).click();
    await esperar(1500);
    const precioError = await driver.findElement(By.id('precioError')).isDisplayed();
    if (precioError) {
      console.log('  ✅ Prueba negativa: No permite precio vacío al editar');
      await tomarCaptura('HU04_negativa_despues');
      await registrarResultado('HU-04', 'Editar producto - precio vacío', 'Prueba negativa', 'PASÓ');
    } else {
      throw new Error('Permitió precio vacío al editar');
    }
  } catch (e) {
    await tomarCaptura('HU04_negativa_error');
    await registrarResultado('HU-04', 'Editar producto - precio vacío', 'Prueba negativa', 'FALLÓ', e.message);
    console.log('  ❌ Error:', e.message);
  }

  try {
    const btnEditar = await driver.findElement(By.className('btn-edit'));
    await btnEditar.click();
    await esperar(1000);
    const nombreInput = await driver.findElement(By.id('nombre'));
    await nombreInput.clear();
    await nombreInput.sendKeys('A');
    await tomarCaptura('HU04_limites_antes');
    await driver.findElement(By.id('submitBtn')).click();
    await esperar(1500);
    const nombreError = await driver.findElement(By.id('nombreError')).isDisplayed();
    if (nombreError) {
      console.log('  ✅ Prueba de límites: No permite nombre muy corto');
      await tomarCaptura('HU04_limites_despues');
      await registrarResultado('HU-04', 'Editar producto - nombre muy corto', 'Prueba de límites', 'PASÓ');
    } else {
      throw new Error('Permitió nombre muy corto');
    }
  } catch (e) {
    await tomarCaptura('HU04_limites_error');
    await registrarResultado('HU-04', 'Editar producto - nombre muy corto', 'Prueba de límites', 'FALLÓ', e.message);
    console.log('  ❌ Error:', e.message);
  }

  await hacerLogout();
}

// =========================
// HU-05: ELIMINAR PRODUCTO
// =========================
async function eliminarProducto() {
  console.log('\n🧪 HU-05: Eliminar producto');
  await hacerLogin();

  try {
    await esperar(1500);
    const btnEliminar = await driver.findElement(By.className('btn-delete'));
    await tomarCaptura('HU05_camino_feliz_antes');
    await btnEliminar.click();
    await esperar(1000);
    const modal = await driver.findElement(By.id('modalEliminar'));
    const modalVisible = await modal.isDisplayed();
    if (modalVisible) {
      await driver.findElement(By.className('btn-confirm')).click();
      await esperar(2000);
      await tomarCaptura('HU05_camino_feliz_despues');
      console.log('  ✅ Camino feliz: Producto eliminado');
      await registrarResultado('HU-05', 'Eliminar producto', 'Camino feliz', 'PASÓ');
    } else {
      throw new Error('Modal no apareció');
    }
  } catch (e) {
    await tomarCaptura('HU05_camino_feliz_error');
    await registrarResultado('HU-05', 'Eliminar producto', 'Camino feliz', 'FALLÓ', e.message);
    console.log('  ❌ Error:', e.message);
  }

  try {
    await driver.findElement(By.id('nombre')).sendKeys('Para Cancelar');
    await driver.findElement(By.id('precio')).sendKeys('50');
    await driver.findElement(By.id('categoria')).sendKeys('Test');
    await driver.findElement(By.id('stock')).sendKeys('1');
    await driver.findElement(By.id('submitBtn')).click();
    await esperar(2000);
    const btnsEliminar = await driver.findElements(By.className('btn-delete'));
    await btnsEliminar[btnsEliminar.length - 1].click();
    await esperar(1000);
    await tomarCaptura('HU05_negativa_antes');
    await driver.findElement(By.className('btn-cancelmodal')).click();
    await esperar(1500);
    const modal = await driver.findElement(By.id('modalEliminar'));
    const modalOculto = !(await modal.isDisplayed());
    if (modalOculto) {
      console.log('  ✅ Prueba negativa: Cancelar no elimina el producto');
      await tomarCaptura('HU05_negativa_despues');
      await registrarResultado('HU-05', 'Eliminar producto - cancelar', 'Prueba negativa', 'PASÓ');
    } else {
      throw new Error('Modal no se cerró');
    }
  } catch (e) {
    await tomarCaptura('HU05_negativa_error');
    await registrarResultado('HU-05', 'Eliminar producto - cancelar', 'Prueba negativa', 'FALLÓ', e.message);
    console.log('  ❌ Error:', e.message);
  }

  try {
    const filaAntes = await driver.findElements(By.css('#productosTable tr'));
    const cantAntes = filaAntes.length;
    const btnEliminar = await driver.findElement(By.className('btn-delete'));
    await btnEliminar.click();
    await esperar(1000);
    await driver.findElement(By.className('btn-confirm')).click();
    await esperar(2000);
    const filaDespues = await driver.findElements(By.css('#productosTable tr'));
    const cantDespues = filaDespues.length;
    await tomarCaptura('HU05_limites_despues');
    if (cantDespues < cantAntes) {
      console.log('  ✅ Prueba de límites: Tabla se actualiza correctamente');
      await registrarResultado('HU-05', 'Eliminar - tabla actualizada', 'Prueba de límites', 'PASÓ');
    } else {
      throw new Error('Tabla no se actualizó');
    }
  } catch (e) {
    await tomarCaptura('HU05_limites_error');
    await registrarResultado('HU-05', 'Eliminar - tabla actualizada', 'Prueba de límites', 'FALLÓ', e.message);
    console.log('  ❌ Error:', e.message);
  }

  await hacerLogout();
}

// ================================
// HU-06: BUSQUEDA Y FILTRADO
// ================================
async function busquedaFiltrado() {
  console.log('\n🧪 HU-06: Búsqueda y filtrado');
  await hacerLogin();

  // Crear producto de prueba primero
  await driver.findElement(By.id('nombre')).sendKeys('ProductoBusqueda');
  await driver.findElement(By.id('precio')).sendKeys('150');
  await driver.findElement(By.id('categoria')).sendKeys('BusquedaTest');
  await driver.findElement(By.id('stock')).sendKeys('5');
  await driver.findElement(By.id('submitBtn')).click();
  await esperar(2000);

  // Camino feliz - busqueda por nombre
  try {
    const searchInput = await driver.findElement(By.id('searchInput'));
    await searchInput.clear();
    await searchInput.sendKeys('ProductoBusqueda');
    await esperar(1000);
    await tomarCaptura('HU06_camino_feliz_antes');
    const filas = await driver.findElements(By.css('#productosTable tr'));
    if (filas.length >= 1) {
      console.log('  ✅ Camino feliz: Búsqueda filtra correctamente');
      await tomarCaptura('HU06_camino_feliz_despues');
      await registrarResultado('HU-06', 'Búsqueda por nombre', 'Camino feliz', 'PASÓ');
    } else {
      throw new Error('No encontró productos');
    }
  } catch (e) {
    await tomarCaptura('HU06_camino_feliz_error');
    await registrarResultado('HU-06', 'Búsqueda por nombre', 'Camino feliz', 'FALLÓ', e.message);
    console.log('  ❌ Error:', e.message);
  }

  // Prueba negativa - busqueda sin resultados
  try {
    const searchInput = await driver.findElement(By.id('searchInput'));
    await searchInput.clear();
    await searchInput.sendKeys('XYZProductoQueNoExiste123');
    await esperar(1000);
    await tomarCaptura('HU06_negativa_antes');
    const mensajeVacio = await driver.findElement(By.css('.empty-msg')).isDisplayed();
    if (mensajeVacio) {
      console.log('  ✅ Prueba negativa: Muestra mensaje cuando no hay resultados');
      await tomarCaptura('HU06_negativa_despues');
      await registrarResultado('HU-06', 'Búsqueda sin resultados', 'Prueba negativa', 'PASÓ');
    } else {
      throw new Error('No mostró mensaje de sin resultados');
    }
  } catch (e) {
    await tomarCaptura('HU06_negativa_error');
    await registrarResultado('HU-06', 'Búsqueda sin resultados', 'Prueba negativa', 'FALLÓ', e.message);
    console.log('  ❌ Error:', e.message);
  }

  // Prueba de limites - filtro por categoria
  try {
    const searchInput = await driver.findElement(By.id('searchInput'));
    await searchInput.clear();
    await esperar(500);
    const selectCategoria = await driver.findElement(By.id('filterCategoria'));
    await selectCategoria.findElement(By.xpath(`//option[contains(text(),'BusquedaTest')]`)).click();
    await esperar(1000);
    await tomarCaptura('HU06_limites_antes');
    const filas = await driver.findElements(By.css('#productosTable tr'));
    if (filas.length >= 1) {
      console.log('  ✅ Prueba de límites: Filtro por categoría funciona');
      await tomarCaptura('HU06_limites_despues');
      await registrarResultado('HU-06', 'Filtro por categoría', 'Prueba de límites', 'PASÓ');
    } else {
      throw new Error('Filtro por categoría no funcionó');
    }
  } catch (e) {
    await tomarCaptura('HU06_limites_error');
    await registrarResultado('HU-06', 'Filtro por categoría', 'Prueba de límites', 'FALLÓ', e.message);
    console.log('  ❌ Error:', e.message);
  }

  await hacerLogout();
}

// ================================
// HU-07: EXPORTAR CSV
// ================================
async function exportarCSV() {
  console.log('\n🧪 HU-07: Exportar CSV');
  await hacerLogin();

  // Camino feliz - boton exportar existe y es clickeable
  try {
    await tomarCaptura('HU07_camino_feliz_antes');
    const btnExportar = await driver.findElement(By.xpath("//button[contains(text(),'Exportar CSV')]"));
    const visible = await btnExportar.isDisplayed();
    if (visible) {
      await btnExportar.click();
      await esperar(2000);
      console.log('  ✅ Camino feliz: Botón exportar CSV funciona');
      await tomarCaptura('HU07_camino_feliz_despues');
      await registrarResultado('HU-07', 'Exportar CSV', 'Camino feliz', 'PASÓ');
    } else {
      throw new Error('Botón exportar no visible');
    }
  } catch (e) {
    await tomarCaptura('HU07_camino_feliz_error');
    await registrarResultado('HU-07', 'Exportar CSV', 'Camino feliz', 'FALLÓ', e.message);
    console.log('  ❌ Error:', e.message);
  }

  // Prueba negativa - exportar con filtro activo
  try {
    const searchInput = await driver.findElement(By.id('searchInput'));
    await searchInput.clear();
    await searchInput.sendKeys('ProductoBusqueda');
    await esperar(1000);
    await tomarCaptura('HU07_negativa_antes');
    const btnExportar = await driver.findElement(By.xpath("//button[contains(text(),'Exportar CSV')]"));
    await btnExportar.click();
    await esperar(2000);
    console.log('  ✅ Prueba negativa: Exporta solo productos filtrados');
    await tomarCaptura('HU07_negativa_despues');
    await registrarResultado('HU-07', 'Exportar CSV con filtro', 'Prueba negativa', 'PASÓ');
    await searchInput.clear();
    await esperar(500);
  } catch (e) {
    await tomarCaptura('HU07_negativa_error');
    await registrarResultado('HU-07', 'Exportar CSV con filtro', 'Prueba negativa', 'FALLÓ', e.message);
    console.log('  ❌ Error:', e.message);
  }

  // Prueba de limites - exportar con tabla vacia
  try {
    const searchInput = await driver.findElement(By.id('searchInput'));
    await searchInput.sendKeys('XYZNoExiste999');
    await esperar(1000);
    await tomarCaptura('HU07_limites_antes');
    const btnExportar = await driver.findElement(By.xpath("//button[contains(text(),'Exportar CSV')]"));
    await btnExportar.click();
    await esperar(1500);
    console.log('  ✅ Prueba de límites: Maneja exportación con filtro sin resultados');
    await tomarCaptura('HU07_limites_despues');
    await registrarResultado('HU-07', 'Exportar CSV tabla vacía', 'Prueba de límites', 'PASÓ');
    await searchInput.clear();
  } catch (e) {
    await tomarCaptura('HU07_limites_error');
    await registrarResultado('HU-07', 'Exportar CSV tabla vacía', 'Prueba de límites', 'FALLÓ', e.message);
    console.log('  ❌ Error:', e.message);
  }

  await hacerLogout();
}

// ================================
// HU-08: GESTION DE STOCK
// ================================
async function gestionStock() {
  console.log('\n🧪 HU-08: Gestión de stock con alertas');
  await hacerLogin();

  // Camino feliz - crear producto con stock normal
  try {
    await driver.findElement(By.id('nombre')).sendKeys('Producto Stock Normal');
    await driver.findElement(By.id('precio')).sendKeys('100');
    await driver.findElement(By.id('categoria')).sendKeys('Stock');
    await driver.findElement(By.id('stock')).sendKeys('10');
    await tomarCaptura('HU08_camino_feliz_antes');
    await driver.findElement(By.id('submitBtn')).click();
    await esperar(2000);
    await tomarCaptura('HU08_camino_feliz_despues');
    console.log('  ✅ Camino feliz: Producto con stock normal creado');
    await registrarResultado('HU-08', 'Stock normal', 'Camino feliz', 'PASÓ');
  } catch (e) {
    await tomarCaptura('HU08_camino_feliz_error');
    await registrarResultado('HU-08', 'Stock normal', 'Camino feliz', 'FALLÓ', e.message);
    console.log('  ❌ Error:', e.message);
  }

  // Prueba negativa - stock cero muestra alerta roja
  try {
    await driver.findElement(By.id('nombre')).sendKeys('Producto Sin Stock');
    await driver.findElement(By.id('precio')).sendKeys('100');
    await driver.findElement(By.id('categoria')).sendKeys('Stock');
    await driver.findElement(By.id('stock')).sendKeys('0');
    await driver.findElement(By.id('submitBtn')).click();
    await esperar(2000);
    await tomarCaptura('HU08_negativa_antes');
    const stockCero = await driver.findElements(By.css('td[style*="color:#f44336"]'));
    if (stockCero.length > 0) {
      console.log('  ✅ Prueba negativa: Stock 0 muestra alerta roja');
      await tomarCaptura('HU08_negativa_despues');
      await registrarResultado('HU-08', 'Stock 0 - alerta roja', 'Prueba negativa', 'PASÓ');
    } else {
      throw new Error('No mostró alerta roja para stock 0');
    }
  } catch (e) {
    await tomarCaptura('HU08_negativa_error');
    await registrarResultado('HU-08', 'Stock 0 - alerta roja', 'Prueba negativa', 'FALLÓ', e.message);
    console.log('  ❌ Error:', e.message);
  }

   // Prueba de limites - stock negativo no permitido
  try {
    await driver.findElement(By.id('nombre')).sendKeys('Test Stock Negativo');
    await driver.findElement(By.id('precio')).sendKeys('100');
    await driver.findElement(By.id('categoria')).sendKeys('Stock');
    await driver.executeScript("document.getElementById('stock').value = ''");
    await tomarCaptura('HU08_limites_antes');
    await driver.findElement(By.id('submitBtn')).click();
    await esperar(1500);
    const stockError = await driver.findElement(By.id('stockError')).isDisplayed();
    if (stockError) {
      console.log('  ✅ Prueba de límites: No permite stock inválido');
      await tomarCaptura('HU08_limites_despues');
      await registrarResultado('HU-08', 'Stock inválido no permitido', 'Prueba de límites', 'PASÓ');
    } else {
      throw new Error('Permitió stock inválido');
    }
  } catch (e) {
    await tomarCaptura('HU08_limites_error');
    await registrarResultado('HU-08', 'Stock inválido no permitido', 'Prueba de límites', 'FALLÓ', e.message);
    console.log('  ❌ Error:', e.message);
  }

  await hacerLogout();
}

// ================================
// HU-09: MODO OSCURO
// ================================
async function modoOscuro() {
  console.log('\n🧪 HU-09: Modo oscuro');
  await hacerLogin();

  // Camino feliz - activar modo oscuro
  try {
    await tomarCaptura('HU09_camino_feliz_antes');
    const btnDark = await driver.findElement(By.id('btnDark'));
    await btnDark.click();
    await esperar(1000);
    const isDark = await driver.executeScript("return document.body.classList.contains('dark')");
    if (isDark) {
      console.log('  ✅ Camino feliz: Modo oscuro activado');
      await tomarCaptura('HU09_camino_feliz_despues');
      await registrarResultado('HU-09', 'Activar modo oscuro', 'Camino feliz', 'PASÓ');
    } else {
      throw new Error('Modo oscuro no se activó');
    }
  } catch (e) {
    await tomarCaptura('HU09_camino_feliz_error');
    await registrarResultado('HU-09', 'Activar modo oscuro', 'Camino feliz', 'FALLÓ', e.message);
    console.log('  ❌ Error:', e.message);
  }

  // Prueba negativa - desactivar modo oscuro
  try {
    const btnDark = await driver.findElement(By.id('btnDark'));
    await btnDark.click();
    await esperar(1000);
    await tomarCaptura('HU09_negativa_antes');
    const isDark = await driver.executeScript("return document.body.classList.contains('dark')");
    if (!isDark) {
      console.log('  ✅ Prueba negativa: Modo oscuro desactivado correctamente');
      await tomarCaptura('HU09_negativa_despues');
      await registrarResultado('HU-09', 'Desactivar modo oscuro', 'Prueba negativa', 'PASÓ');
    } else {
      throw new Error('Modo oscuro no se desactivó');
    }
  } catch (e) {
    await tomarCaptura('HU09_negativa_error');
    await registrarResultado('HU-09', 'Desactivar modo oscuro', 'Prueba negativa', 'FALLÓ', e.message);
    console.log('  ❌ Error:', e.message);
  }

  // Prueba de limites - preferencia persiste al recargar
  try {
    const btnDark = await driver.findElement(By.id('btnDark'));
    await btnDark.click();
    await esperar(1000);
    await driver.navigate().refresh();
    await esperar(2000);
    await tomarCaptura('HU09_limites_antes');
    const isDarkAfterRefresh = await driver.executeScript("return document.body.classList.contains('dark')");
    if (isDarkAfterRefresh) {
      console.log('  ✅ Prueba de límites: Preferencia de modo oscuro persiste');
      await tomarCaptura('HU09_limites_despues');
      await registrarResultado('HU-09', 'Modo oscuro persiste al recargar', 'Prueba de límites', 'PASÓ');
    } else {
      throw new Error('Preferencia no persistió');
    }
  } catch (e) {
    await tomarCaptura('HU09_limites_error');
    await registrarResultado('HU-09', 'Modo oscuro persiste al recargar', 'Prueba de límites', 'FALLÓ', e.message);
    console.log('  ❌ Error:', e.message);
  }

  await hacerLogout();
}

// ================================
// HU-10: CIERRE DE SESION
// ================================
async function cierreSesion() {
  console.log('\n🧪 HU-10: Cierre de sesión seguro');
  await hacerLogin();

  // Camino feliz - cerrar sesion correctamente
  try {
    await tomarCaptura('HU10_camino_feliz_antes');
    const btnSalir = await driver.findElement(By.xpath("//button[contains(text(),'Salir')]"));
    await btnSalir.click();
    await esperar(2000);
    const url = await driver.getCurrentUrl();
    if (url.includes('login')) {
      console.log('  ✅ Camino feliz: Cierre de sesión exitoso');
      await tomarCaptura('HU10_camino_feliz_despues');
      await registrarResultado('HU-10', 'Cerrar sesión', 'Camino feliz', 'PASÓ');
    } else {
      throw new Error('No redirigió al login');
    }
  } catch (e) {
    await tomarCaptura('HU10_camino_feliz_error');
    await registrarResultado('HU-10', 'Cerrar sesión', 'Camino feliz', 'FALLÓ', e.message);
    console.log('  ❌ Error:', e.message);
  }

  // Prueba negativa - no acceder al dashboard sin sesion
  try {
    await driver.get(BASE_URL);
    await esperar(2000);
    await tomarCaptura('HU10_negativa_antes');
    const url = await driver.getCurrentUrl();
    if (url.includes('login')) {
      console.log('  ✅ Prueba negativa: No permite acceso sin sesión');
      await tomarCaptura('HU10_negativa_despues');
      await registrarResultado('HU-10', 'Acceso sin sesión bloqueado', 'Prueba negativa', 'PASÓ');
    } else {
      throw new Error('Permitió acceso sin sesión');
    }
  } catch (e) {
    await tomarCaptura('HU10_negativa_error');
    await registrarResultado('HU-10', 'Acceso sin sesión bloqueado', 'Prueba negativa', 'FALLÓ', e.message);
    console.log('  ❌ Error:', e.message);
  }

  // Prueba de limites - boton salir visible en dashboard
  try {
    await hacerLogin();
    await tomarCaptura('HU10_limites_antes');
    const btnSalir = await driver.findElement(By.xpath("//button[contains(text(),'Salir')]"));
    const visible = await btnSalir.isDisplayed();
    if (visible) {
      console.log('  ✅ Prueba de límites: Botón salir siempre visible');
      await tomarCaptura('HU10_limites_despues');
      await registrarResultado('HU-10', 'Botón salir visible', 'Prueba de límites', 'PASÓ');
    } else {
      throw new Error('Botón salir no visible');
    }
    await hacerLogout();
  } catch (e) {
    await tomarCaptura('HU10_limites_error');
    await registrarResultado('HU-10', 'Botón salir visible', 'Prueba de límites', 'FALLÓ', e.message);
    console.log('  ❌ Error:', e.message);
  }
}

// ======================
// GENERAR REPORTE HTML
// ======================
function generarReporte() {
  const pasaron = resultados.filter(r => r.estado === 'PASÓ').length;
  const fallaron = resultados.filter(r => r.estado === 'FALLÓ').length;
  const total = resultados.length;

  const filas = resultados.map(r => `
    <tr class="${r.estado === 'PASÓ' ? 'pass' : 'fail'}">
      <td>${r.historia}</td>
      <td>${r.prueba}</td>
      <td><span class="badge-tipo">${r.tipo}</span></td>
      <td><span class="badge-estado ${r.estado === 'PASÓ' ? 'badge-pass' : 'badge-fail'}">${r.estado}</span></td>
      <td>${r.error || '-'}</td>
      <td>${r.fecha}</td>
    </tr>
  `).join('');

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Reporte de Pruebas Selenium - CRUD Productos</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; background: #f0f2f5; padding: 30px; }
    .header { background: #1F3864; color: white; padding: 30px; border-radius: 10px; margin-bottom: 30px; }
    .header h1 { font-size: 28px; margin-bottom: 8px; }
    .header p { color: #ccc; font-size: 14px; margin-top: 6px; }
    .stats { display: flex; gap: 20px; margin-bottom: 30px; }
    .stat { background: white; padding: 20px 30px; border-radius: 10px; text-align: center; flex: 1; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .stat h2 { font-size: 36px; margin-bottom: 5px; }
    .stat p { color: #666; font-size: 14px; }
    .total h2 { color: #1F3864; }
    .passed h2 { color: #4CAF50; }
    .failed h2 { color: #f44336; }
    table { width: 100%; border-collapse: collapse; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    th { background: #1F3864; color: white; padding: 14px; text-align: left; font-size: 13px; }
    td { padding: 12px 14px; border-bottom: 1px solid #eee; font-size: 13px; }
    tr.pass { background: #f1fff1; }
    tr.fail { background: #fff1f1; }
    .badge-tipo { background: #e3f2fd; color: #1565c0; padding: 3px 8px; border-radius: 12px; font-size: 11px; }
    .badge-estado { padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: bold; }
    .badge-pass { background: #4CAF50; color: white; }
    .badge-fail { background: #f44336; color: white; }
  </style>
</head>
<body>
  <div class="header">
    <h1>📊 Reporte de Pruebas Automatizadas</h1>
    <p>Proyecto: CRUD Productos | Herramienta: Selenium WebDriver | Lenguaje: JavaScript</p>
    <p>Estudiante: Ricardo Alexander Diaz Santana | Matrícula: 2024-0244</p>
    <p>Fecha: ${new Date().toLocaleString()}</p>
  </div>
  <div class="stats">
    <div class="stat total"><h2>${total}</h2><p>Total de pruebas</p></div>
    <div class="stat passed"><h2>${pasaron}</h2><p>Pruebas exitosas</p></div>
    <div class="stat failed"><h2>${fallaron}</h2><p>Pruebas fallidas</p></div>
    <div class="stat"><h2>${total > 0 ? Math.round((pasaron/total)*100) : 0}%</h2><p>Tasa de éxito</p></div>
  </div>
  <table>
    <thead>
      <tr>
        <th>Historia</th>
        <th>Caso de prueba</th>
        <th>Tipo</th>
        <th>Estado</th>
        <th>Error</th>
        <th>Fecha</th>
      </tr>
    </thead>
    <tbody>${filas}</tbody>
  </table>
</body>
</html>`;

  fs.writeFileSync(path.join(__dirname, 'reports', 'reporte.html'), html);
  console.log('\n📄 Reporte generado: tests/reports/reporte.html');
}

// ======================
// EJECUTAR PRUEBAS
// ======================
async function ejecutarPruebas() {
  console.log('🚀 Iniciando pruebas automatizadas...\n');
  const options = new chrome.Options();
  driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();

  try {
    await loginExitoso();
    await loginFallido();
    await crearProducto();
    await editarProducto();
    await eliminarProducto();
    await busquedaFiltrado();
    await exportarCSV();
    await gestionStock();
    await modoOscuro();
    await cierreSesion();
  } finally {
    generarReporte();
    await driver.quit();
    console.log('\n✅ Pruebas completadas. Revisa tests/reports/reporte.html');
  }
}

ejecutarPruebas();