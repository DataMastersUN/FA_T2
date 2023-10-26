function initializeMap() {
    const mapOptions = {
      center: { lat: 6.244723500939937, lng: -75.57149644602691 },
      zoom: 14,
    };
  
    const map = new google.maps.Map(document.getElementById("map"), mapOptions);
  
    const streetCoordinates = [
      { lat: LATITUDE1, lng: LONGITUDE1 },
      { lat: LATITUDE2, lng: LONGITUDE2 },
      // Agrega más puntos para definir la línea de la calle
    ];
  
    const streetPath = new google.maps.Polyline({
      path: streetCoordinates,
      geodesic: true,
      strokeColor: "#FF0000", // Color de la línea
      strokeOpacity: 1.0, // Opacidad de la línea
      strokeWeight: 4, // Grosor de la línea
    });
  
    streetPath.setMap(map);
  }
  
  google.maps.event.addDomListener(window, "load", initializeMap);
  