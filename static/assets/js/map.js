function initMap() {
  // Coordenadas del centro de la zona que deseas encerrar con el polígono.
  var centroZona = { lat: 6.254957677980789, lng: -75.57373184222013 };

  // Opciones del mapa.
  var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 15,
    center: centroZona,
    styles: [
      {
        featureType: 'poi',
        elementType: 'labels',
        stylers: [{ visibility: 'off' }]
      },
      {
        featureType: 'road',
        elementType: 'labels',
        stylers: [{ visibility: 'off' }]
      },
      {
        featureType: 'administrative.locality',
        elementType: 'labels',
        stylers: [{ visibility: 'off' }]
      },
      {
        featureType: 'administrative.neighborhood',
        elementType: 'labels.text',
        stylers: [
          {
        visibility: 'off'
          }
        ]
      }
    ]
  });

  function encontrarAtributo(datos, nombreBarrio, atributo) {
    for (var i = 0; i < datos.length; i++) {
        if (datos[i].Barrio === nombreBarrio) {
            return datos[i][atributo];
        }
    }
    return 'Sin registro'; // Si no se encuentra el atributo para el barrio
}

  function asignarColor(cluster) {
    switch (cluster) {
      case 1:
        return '#FF0000'; // Rojo para el cluster 1
      case 2:
        return '#00FF00'; // Verde para el cluster 2
      case 3:
        return '#0000FF'; // Azul para el cluster 3
      case 4:
        return '#FFD700'; // Amarillo para el cluster 4
      case 5:
        return '#FF1493'; // Rosa para el cluster 5
      default:
        return '#808080'; // Color predeterminado (gris) para otros clusters o si no se encuentra el cluster
    }
  }

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
  
  fetch('/static/assets/js/barrios-cluster.json') // Ruta relativa al archivo "barrios-cluster.json"
  .then(response => response.json())
  .then(clusterData => {
    // Ahora, clusterData contiene los datos del archivo "barrios-cluster.json"
    fetch('/static/assets/js/barrios.json') // Ruta relativa al archivo "barrios.json"
      .then(response => response.json())
      .then(data => {
        fetch('/static/assets/js/accident.json') // Ruta relativa al archivo "accidentes.json"
          .then(response => response.json())  
          .then(accidentes => {

          for (var nombreBarrio in data) {
            if (data.hasOwnProperty(nombreBarrio)) {
              var zonaBarrio = convertirZonaBarrio(data, nombreBarrio);
              var cluster = encontrarAtributo(clusterData, nombreBarrio, "Cluster");
              var color = asignarColor(cluster);

              // Crea el polígono en el mapa con el color correspondiente
              var poligono = new google.maps.Polygon({
                paths: zonaBarrio,
                strokeColor: color, // Color del borde
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: color, // Color del relleno
                fillOpacity: 0.35
              });

              // Agrega el polígono al mapa.
              poligono.setMap(map);

              poligono.addListener('click', function(event) {
                var nombreBarrio = obtenerNombreDelBarrio(data, event.latLng);
                var cluster = encontrarAtributo(clusterData, nombreBarrio, "Cluster");
                var acc = encontrarAtributo(accidentes, nombreBarrio, "Con heridos");
                var dead = encontrarAtributo(accidentes, nombreBarrio, "Con muertos");
                var accdnt = encontrarAtributo(accidentes, nombreBarrio, "Total de accidentes");
                
                var nivel;
                if (cluster == 1 || cluster == 2 ) nivel = "Baja";
                else if (cluster == 3 || cluster == 4 || cluster == 5) nivel = "Alta";
                else nivel = "Sin registro";

                var infoWindow = new google.maps.InfoWindow({
                  content: 'Barrio: ' + nombreBarrio + '<br>Cluster: ' + cluster + 
                  '<br>Heridos: ' + acc + '<br>Muertos: ' + dead + '<br>Total accidentes: ' +
                  accdnt + '<br>Accidentalidad: ' + nivel
                });

                // Abre la ventana de información en las coordenadas del evento
                infoWindow.setPosition(event.latLng);
                infoWindow.open(map);
              });

              function obtenerNombreDelBarrio(data, latLng) {
                for (var nombreBarrio in data) {
                  if (data.hasOwnProperty(nombreBarrio)) {
                    var zonaBarrio = convertirZonaBarrio(data, nombreBarrio);
                    if (estaDentroDelPoligono(zonaBarrio, latLng)) {
                      return nombreBarrio;
                    }
                  }
                }
                return null;
              }
              
              function estaDentroDelPoligono(zonaBarrio, latLng) {
                var latLngObj = new google.maps.LatLng(latLng.lat(), latLng.lng());
                var polygon = new google.maps.Polygon({ paths: zonaBarrio });
                var dentroDelPoligono = google.maps.geometry.poly.containsLocation(latLngObj, polygon);
                return dentroDelPoligono;
              }
              

            }
          }
        }) 
        .catch(error => {
          console.error('Error al cargar el archivo "barrios.json":', error);
        });

      })
      .catch(error => {
        console.error('Error al cargar el archivo "barrios.json":', error);
      });
  })
  .catch(error => {
    console.error('Error al cargar el archivo "barrios-cluster.json":', error);
  });
}