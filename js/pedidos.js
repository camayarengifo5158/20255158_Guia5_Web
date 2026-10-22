"use strict";

const pedidos = [];

let precioMaximoActivo = null;

function validarPedido(datos) {
  const errores = {};

  if (datos.producto.trim() === "") {
    errores.producto = "Ingrese el nombre del producto.";
  }

  const precio = Number(datos.precio);
  if (datos.precio.trim() === "") {
    errores.precio = "Ingrese el precio unitario.";
  } else if (!Number.isFinite(precio) || precio <= 0) {
    errores.precio = "El precio debe ser mayor que cero.";
  }

  const cantidad = Number(datos.cantidad);
  if (datos.cantidad.trim() === "") {
    errores.cantidad = "Ingrese la cantidad.";
  } else if (!Number.isInteger(cantidad) || cantidad <= 0) {
    errores.cantidad = "La cantidad debe ser un número entero positivo.";
  }

  return errores;
}

function crearPedido(datos) {
  return {
    producto: datos.producto.trim(),
    precio: Number(datos.precio),
    cantidad: Number(datos.cantidad),
  };
}

function agregarPedido(pedido) {
  pedidos.push(pedido);
}

function vaciarPedidos() {
  pedidos.length = 0;
}

function calcularSubtotal(pedido) {
  return pedido.precio * pedido.cantidad;
}

function filtrarPorPrecioMaximo(lista, precioMaximo) {
  return lista.filter((pedido) => pedido.precio <= precioMaximo);
}

function calcularTotalUnidades(lista) {
  return lista.reduce((total, pedido) => total + pedido.cantidad, 0);
}

function calcularMontoTotal(lista) {
  return lista.reduce((total, pedido) => total + calcularSubtotal(pedido), 0);
}

function obtenerPedidosVisibles() {
  if (precioMaximoActivo === null) {
    return pedidos;
  }
  return filtrarPorPrecioMaximo(pedidos, precioMaximoActivo);
}

function validarPrecioMaximo(valorCrudo) {
  if (valorCrudo.trim() === "") {
    return "Ingrese un precio máximo para filtrar.";
  }
  const valor = Number(valorCrudo);
  if (!Number.isFinite(valor) || valor < 0) {
    return "El precio máximo debe ser un número igual o mayor que cero.";
  }
  return null;
}


const formulario = document.querySelector("#formPedido");
const inputProducto = document.querySelector("#inputProducto");
const inputPrecio = document.querySelector("#inputPrecio");
const inputCantidad = document.querySelector("#inputCantidad");
const inputPrecioMaximo = document.querySelector("#inputPrecioMaximo");

const btnFiltrar = document.querySelector("#btnFiltrar");
const btnMostrarTodos = document.querySelector("#btnMostrarTodos");
const btnLimpiar = document.querySelector("#btnLimpiar");

const cuerpoTabla = document.querySelector("#cuerpoTabla");
const totalUnidades = document.querySelector("#totalUnidades");
const montoTotal = document.querySelector("#montoTotal");
const avisoFiltro = document.querySelector("#avisoFiltro");
const mensajeEstado = document.querySelector("#mensajeEstado");

const campos = {
  producto: { input: inputProducto, error: document.querySelector("#errorProducto") },
  precio: { input: inputPrecio, error: document.querySelector("#errorPrecio") },
  cantidad: { input: inputCantidad, error: document.querySelector("#errorCantidad") },
};

const formatoMoneda = new Intl.NumberFormat("es-SV", {
  style: "currency",
  currency: "USD",
});

function formatearMoneda(valor) {
  return formatoMoneda.format(valor);
}

function escaparHTML(texto) {
  return texto
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function leerFormulario() {
  return {
    producto: inputProducto.value,
    precio: inputPrecio.value,
    cantidad: inputCantidad.value,
  };
}

function limpiarErrores() {
  Object.values(campos).forEach(({ input, error }) => {
    input.classList.remove("is-invalid");
    error.textContent = "";
  });
}

function mostrarErrores(errores) {
  limpiarErrores();
  Object.entries(errores).forEach(([nombre, mensaje]) => {
    campos[nombre].input.classList.add("is-invalid");
    campos[nombre].error.textContent = mensaje;
  });
  const primero = Object.keys(campos).find((nombre) => errores[nombre]);
  campos[primero].input.focus();
}

function mostrarErrorPrecioMaximo(mensaje) {
  const error = document.querySelector("#errorPrecioMaximo");
  if (mensaje) {
    inputPrecioMaximo.classList.add("is-invalid");
    error.textContent = mensaje;
  } else {
    inputPrecioMaximo.classList.remove("is-invalid");
    error.textContent = "";
  }
}

function renderizarTabla(lista) {
  if (lista.length === 0) {
    const texto = pedidos.length === 0
      ? "Todavía no hay pedidos registrados."
      : `Ningún pedido tiene un precio unitario menor o igual a ${formatearMoneda(precioMaximoActivo)}.`;
    cuerpoTabla.innerHTML =
      `<tr><td colspan="4" class="text-center text-body-secondary py-4">${texto}</td></tr>`;
    return;
  }

  cuerpoTabla.innerHTML = lista
    .map((pedido) => `
      <tr>
        <td>${escaparHTML(pedido.producto)}</td>
        <td class="text-end">${formatearMoneda(pedido.precio)}</td>
        <td class="text-end">${pedido.cantidad}</td>
        <td class="text-end">${formatearMoneda(calcularSubtotal(pedido))}</td>
      </tr>`)
    .join("");
}

function renderizarTotales() {
  totalUnidades.textContent = calcularTotalUnidades(pedidos);
  montoTotal.textContent = formatearMoneda(calcularMontoTotal(pedidos));
}

function renderizarAvisoFiltro(visibles) {
  if (precioMaximoActivo === null) {
    avisoFiltro.classList.add("d-none");
    avisoFiltro.textContent = "";
    return;
  }
  avisoFiltro.classList.remove("d-none");
  avisoFiltro.textContent =
    `Filtro aplicado: precio unitario hasta ${formatearMoneda(precioMaximoActivo)}. ` +
    `Se muestran ${visibles.length} de ${pedidos.length} pedidos. ` +
    `Los totales de abajo incluyen todos los pedidos.`;
}

function actualizarBotones() {
  btnLimpiar.disabled = pedidos.length === 0;
  btnMostrarTodos.disabled = precioMaximoActivo === null;
}

function anunciar(mensaje) {
  mensajeEstado.textContent = mensaje;
}


function actualizarVista() {
  const visibles = obtenerPedidosVisibles();
  renderizarTabla(visibles);
  renderizarTotales();
  renderizarAvisoFiltro(visibles);
  actualizarBotones();
}

function manejarAgregar(evento) {
  evento.preventDefault();

  const datos = leerFormulario();
  const errores = validarPedido(datos);

  if (Object.keys(errores).length > 0) {
    mostrarErrores(errores);
    anunciar("");
    return;
  }

  const pedido = crearPedido(datos);
  agregarPedido(pedido);

  limpiarErrores();
  formulario.reset();
  inputProducto.focus();
  actualizarVista();

  const quedaOculto = precioMaximoActivo !== null && pedido.precio > precioMaximoActivo;
  anunciar(
    `Pedido agregado: ${pedido.cantidad} × ${pedido.producto}.` +
    (quedaOculto ? " No aparece en la tabla porque supera el precio máximo del filtro." : "")
  );
}

function manejarFiltrar() {
  const mensajeError = validarPrecioMaximo(inputPrecioMaximo.value);
  mostrarErrorPrecioMaximo(mensajeError);
  if (mensajeError) {
    inputPrecioMaximo.focus();
    return;
  }

  precioMaximoActivo = Number(inputPrecioMaximo.value);
  actualizarVista();
  anunciar("");
}

function manejarMostrarTodos() {
  precioMaximoActivo = null;
  inputPrecioMaximo.value = "";
  mostrarErrorPrecioMaximo(null);
  actualizarVista();
  anunciar("");
}

function manejarLimpiar() {
  vaciarPedidos();
  precioMaximoActivo = null;
  inputPrecioMaximo.value = "";
  mostrarErrorPrecioMaximo(null);
  actualizarVista();
  anunciar("Se eliminaron todos los pedidos.");
}

formulario.addEventListener("submit", manejarAgregar);
btnFiltrar.addEventListener("click", manejarFiltrar);
btnMostrarTodos.addEventListener("click", manejarMostrarTodos);
btnLimpiar.addEventListener("click", manejarLimpiar);

Object.values(campos).forEach(({ input, error }) => {
  input.addEventListener("input", () => {
    input.classList.remove("is-invalid");
    error.textContent = "";
  });
});

actualizarVista();
