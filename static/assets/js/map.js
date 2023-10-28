function initMap() {
  // Coordenadas del centro de la zona que deseas encerrar con el polígono.
  var centroZona = { lat: 6.254957677980789, lng: -75.57373184222013 };

  // Opciones del mapa.
  var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 14,
    center: centroZona
  });

  function encontrarCluster(clusterData, nombreBarrio) {
    for (var i = 0; i < clusterData.length; i++) {
      if (clusterData[i].Barrio === nombreBarrio) {
        return clusterData[i].Cluster;
      }
    }
    return null; // Si no se encuentra el cluster para el barrio
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
        for (var nombreBarrio in data) {
          if (data.hasOwnProperty(nombreBarrio)) {
            var zonaBarrio = convertirZonaBarrio(data, nombreBarrio);

            // Encuentra el valor del cluster para el barrio actual
            var cluster = encontrarCluster(clusterData, nombreBarrio);

            // Asigna un color según el valor del cluster
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
              var cluster = obtenerClusterDelBarrio(clusterData, nombreBarrio);

              var infoWindow = new google.maps.InfoWindow({
                content: 'Barrio: ' + nombreBarrio + '<br>Cluster: ' + cluster + 
                '<br>Accidentes: ' + 'null' + '<br>Muertos: ' + 'null'
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
            
            function obtenerClusterDelBarrio(data, nombreBarrio) {
              if (data.hasOwnProperty(nombreBarrio)) {
                return data[nombreBarrio].Cluster;
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
    console.error('Error al cargar el archivo "barrios-cluster.json":', error);
  });
}