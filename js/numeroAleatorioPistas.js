const numeroAleatorio = Math.floor(Math.random() * 25) + 1;
const numeroIntentos = 3;
let intentos = 1;

function obtenerPista(numero) {
  if (numeroAleatorio > numero) {
    return `El número oculto es más alto que ${numero}.`;
  }
  return `El número oculto es más bajo que ${numero}.`;
}

function generarNumeroAleatorio() {
  let mensaje;
  const parrafo = document.querySelector("#idParrafo");

  if (intentos <= numeroIntentos) {
    let respuesta = prompt(
      "¿Que número se ha generado (Intento " + intentos + ")?"
    );

    let numero = parseInt(respuesta, 10);
    if (Number.isNaN(numero) || numero < 1 || numero > 25) {
      parrafo.innerHTML = `Escriba un número entero del 1 al 25. Este intento no se contó.`;
      return;
    }

    if (numero === numeroAleatorio) {
      mensaje = `¡Es sorprendente, pudiste adivinar el numero oculto (${numeroAleatorio})!
        Refresque la página para volver a jugar.`;
    } else if (intentos === numeroIntentos) {
      mensaje = `${obtenerPista(numero)} Su numero de intentos ha terminado.
          El numero oculto era: ${numeroAleatorio}. Refresque la página para volver a jugar.`;
    } else {
      mensaje = `${obtenerPista(numero)} Vuelve a intentar. Quedan ${
        numeroIntentos - intentos
      } intentos`;
    }

    intentos++;
  } else {
    mensaje = `Su numero de intentos ha terminado.
      El numero oculto era: ${numeroAleatorio}. Refresque la página para volver a jugar.`;
  }

  parrafo.innerHTML = mensaje;
}
