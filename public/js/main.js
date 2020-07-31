setInterval(actualizaIot, INTERVALO_EN_MILIS);
      iniciaIntensidad();
      async function actualizaIot() {
        try {
          const resp = await fetch(URL_LUZ);
          if (resp.ok) {
            const json = await resp.json();
            console.log(json.fields)
            iotLuz.value = json.fields.valor && json.fields.valor.booleanValue ?
              "encendida" : "apagada";
            control(json.fields.valor && json.fields.valor.booleanValue ?
              "encendida" : "apagada")
          } else {
            iotLuz.value = "apagada";
            control("apagada")
            console.log(resp.statusText);
          }
        } catch (e) {
          console.log(e);
          iotError.value = e.message;
        }
      }
      async function iniciaIntensidad() {
        try {
          const resp = await fetch(URL_INTENSIDAD);
          if (resp.ok) {
            const json = await resp.json();
            console.log(json)
            iotIntensidad.value =
              json.fields.valor && json.fields.valor.integerValue ?
                json.fields.valor.integerValue : 0;
            focus(json.fields.valor && json.fields.valor.integerValue ?
              json.fields.valor.integerValue : 0)
          } else {
            iotIntensidad.value = 0;
            console.log(resp.statusText);
          }
        } catch (e) {
          console.log(e);
          iotError.value = e.message;
        }
      }
      async function intensidadModificada() {
        try {
          focus(iotIntensidad.value)
          var data = {
            fields: { valor: { integerValue: iotIntensidad.value } }
          };
          const resp = await fetch(URL_INTENSIDAD, {
            method: MÉTODO_CAMBIOS,
            body: JSON.stringify(data),
            headers: HEADERS_JSON,
          });
          if (!resp.ok) {
            throw new Error(resp.message);
          }
          const resp2 = await fetch(URL_AGREGA, {
            method: MÉTODO_AGREGA,
            body: JSON.stringify(data),
            headers: HEADERS_JSON,
          });
          if (!resp2.ok) {
            throw new Error(resp2.message);
          }
        } catch (e) {
          console.log(e);
          iotError.value = e.message;
        }
      }

      actualizaMp();
      async function actualizaMp() {
        firestore.collection(ENTIDAD_INTENSIDAD).doc(ID).onSnapshot(
          doc => {
            if (doc.exists) {
              mpIntensidad.value = doc.data().valor || 0;
            } else {
              mpIntensidad.value = 0;
            }
          },
          e => {
            procesaError(e);
            // muestraLuz();
          }
        );
        const docLuz = await firestore.collection(ENTIDAD_LUZ).doc(ID).get();
        mpLuz.checked = docLuz.exists && Boolean(docLuz.data().valor);
      }

      async function luzModificada() {
        try {
          await firestore.collection(ENTIDAD_LUZ).doc(ID).set({
            valor: mpLuz.checked
          });
        } catch (e) {
          procesaError(e);
        }
      }
      
let foco = document.getElementById("foco"),
  apagador = document.getElementById("mpLuz"),
  slider = document.getElementById("range");

function focus(val) {
  clean();
  if(val > 0 && apagador.checked) {
    foco.classList.add(`light-${val}`);
  }else if(val == 0 && !apagador.checked) {
    foco.classList.add(`light-${val}`);
  }else if(val == 0 && apagador.checked){
    foco.classList.add(`light-${val}`);
  }
}

function control(val) {
  if(val == "encendida") {
    apagador.checked = true
    focus(iotIntensidad.value)
  }else {
    apagador.checked = false
    /*iotIntensidad.value = 0;
    intensidadModificada()*/
    focus(0)
  }
  /*let x = val == 0 ? 10 : 0;
  apagador.value = x;
  clean();
  foco.classList.add(`light-${x}`);
  slider.value = x;*/
}

function clean() {
  for (var i = 0; i <= 10; i++) {
    foco.classList.remove(`light-${i}`);
  }
}
