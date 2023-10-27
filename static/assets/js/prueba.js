function convertirZonaBarrio(data, nombreBarrio) {
    if (data.hasOwnProperty(nombreBarrio)) {
      var zonaBarrio = data[nombreBarrio].zonaBarrio;
      var zonaBarrioConvertida = zonaBarrio.map(function(coordenada) {
        return { lat: coordenada.lat, lng: coordenada.lng };
      });
      return zonaBarrioConvertida;
    } else {
      return null; // Retorna null si el nombre del barrio no se encuentra en el JSON
    }
  }

  var zonaBarrio;
  console.log("Aqui esta");

  fetch('/static/assets/js/barrios.json') // Ruta relativa al archivo JSON
            .then(response => response.json())
            .then(data => {
              var nombreBarrio = "San Benito"; // Reemplaza con el nombre del barrio que deseas convertir
              zonaBarrio = convertirZonaBarrio(data, nombreBarrio);
              console.log("Aqui esta"+zonaBarrio);
            })
            .catch(error => {
                console.error('Error al cargar el archivo JSON:', error);
            });
            