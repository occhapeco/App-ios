//criação da infowindow
var infowindow = new google.maps.InfoWindow();
var markers = [];
var poder = true; // somente utilizada quando a empresa for criar um ponto para selecionar o local
var map;

function inicializar_map()
{
  map = new google.maps.Map(document.getElementById('map'), {
        zoom: 2,
        center: new google.maps.LatLng(0.234035, -24.178513),
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        mapTypeControl : false,
        draggable:true,
        streetViewControlOptions: {
            position: google.maps.ControlPosition.BOTTOM_CENTER
        },
        zoomControlOptions: {
            position: google.maps.ControlPosition.LEFT_BOTTOM
        },
        styles: [
          {
            "stylers": [
              { "visibility": "on" },
              { "weight": 1 },
              { "hue": "#64B5F6" },
              { "gamma": 0.75 }
            ]
          },
          {
            featureType: 'landscape',
            elementType: 'geometry',
            stylers: [
              { hue: '#00ff00' }
            ]
          },
          {
            featureType: 'poi.park',
            elementType: 'geometry',
            stylers: [
              { hue: '#00ff00' }
            ]
          }
        ]
  });


  //responsivo
  google.maps.event.addDomListener(window, "resize", function() {
     var center = map.getCenter();
     google.maps.event.trigger(map, "resize");
     map.setCenter(center);
  });

  //cria o input para pesquisar no mapa
  var input = document.getElementById('pac-input');
  var searchBox = new google.maps.places.SearchBox(input);
  //map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

  // Bias the SearchBox results towards current map's viewport.
  map.addListener('bounds_changed', function() {
    searchBox.setBounds(map.getBounds());
  });

  searchBox.addListener('places_changed', function() {
    var places = searchBox.getPlaces();

    if (places.length == 0) {
      return;
    }

    // Encontra o lugar pesquisado
    var bounds = new google.maps.LatLngBounds();
    places.forEach(function(place) {
      var icon = {
        url: place.icon,
        size: new google.maps.Size(71, 71),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(17, 34),
        scaledSize: new google.maps.Size(25, 25)
      };

      //coloca o lugar em uma variável para dar fit no mapa
      if (place.geometry.viewport) {
        bounds.union(place.geometry.viewport);
      } else {
        bounds.extend(place.geometry.location);
      }
    });
    map.fitBounds(bounds);
  });

}

//local dos ícones utilizados
var icons = {
        mark1: {
          icon: 'mapa/images/mark1.png'
        },
        mark2: {
          icon: 'mapa/images/mark2.png'
        }
};

//função que adiciona marcadores
function addMarker(feature) {
  var marker = new google.maps.Marker({
    position: feature.position,
    icon: icons[feature.type].icon,
    map: map,
    draggable:feature.draggable, // se pode ser arrastado
    info: feature.info //conteudo do marcador
  });

  google.maps.event.addListener(marker, 'click', function () {
    infowindow.setContent(this.info); //conteúdo do marcador
    infowindow.open(map, this);
  });

  if (feature.draggable == true) {

    document.getElementById('lat').value = marker.position.lat();
    document.getElementById('long').value = marker.position.lng();

    google.maps.event.addListener(marker,'dragend', function() {
        document.getElementById('lat').value = marker.position.lat();
        document.getElementById('long').value = marker.position.lng();
    });
  }

  markers.push(marker);
}

//cluster de marcadores
var options = {
          imagePath: 'mapa/images/m'
};

var ds = new google.maps.DirectionsRenderer;
function calculateAndDisplayRoute(lati,longi) {

  var directionsService = new google.maps.DirectionsService;
  var directionsDisplay = new google.maps.DirectionsRenderer(); 
  ds.setMap(null);
  realiza_rota();
  directionsDisplay.setMap(map);

  directionsDisplay.setPanel(document.getElementById("rightpanel"));

  document.getElementById("rightpanel").style.height = 'calc(40% - 56px)';
  document.getElementById("rightpanel").style.zIndex = '9999999999999';
  document.getElementById("rightpanel").style.overflow = 'auto';
  document.getElementById("map").style.height = '60%';
  infowindow.close();

  setMapOnAll(false);

  directionsService.route({
    origin: new google.maps.LatLng(localStorage.getItem("lat_padrao"), localStorage.getItem("long_padrao")),
    destination: new google.maps.LatLng(lati,longi),
    travelMode: google.maps.TravelMode.DRIVING
  }, function(response, status) {
    if (status === google.maps.DirectionsStatus.OK) {
      directionsDisplay.setDirections(response);
    } else {
      myApp.alert('Não foi possível criar a rota que você requisitou.');
    }
  });
  ds = directionsDisplay;
}

function setMapOnAll(mapi) {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setVisible(mapi);
  }
}

var geocoder = new google.maps.Geocoder();

