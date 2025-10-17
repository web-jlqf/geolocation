// Mínimo e imperativo: siempre carga 'CDMX.json' y dibuja todos los marcadores.
window.addEventListener('DOMContentLoaded', function () {
  var map = L.map('map').setView([19.432608, -99.133209], 11);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap'
  }).addTo(map);

  var cluster = L.markerClusterGroup();
  var msg = document.getElementById('msg');

  fetch('CDMX.json')
    .then(function (res) { return res.json(); })
    .then(function (data) {
      var rows;
      if (Array.isArray(data)) 
          rows = data;
      else 
          if (data && Array.isArray(data.CDMX)) 
              rows = data.CDMX;
          else 
              rows = [];

      var bounds = L.latLngBounds();
      var count = 0;

      for (var i = 0; i < rows.length; i++) {
        var r = rows[i];

        // Lat/Lon tolerantes a claves distintas y comas decimales
        var latRaw = r.latitud || r.Latitud || r.latitude || r.Latitude || '';
        var lonRaw = r.longitud || r.Longitud || r.longitude || r.Longitude || '';

        var lat = Number(String(latRaw).replace(',', '.'));
        var lon = Number(String(lonRaw).replace(',', '.'));
        if (!isFinite(lat) || !isFinite(lon)) 
            continue;

        var id  = r.id || r.ID || r.Id || '';
        var prog = r.programa || r.Programa || r.program || r.Program || '';
        var alc;
        for (var k in r) {
          if (!Object.prototype.hasOwnProperty.call(r,k)) 
              continue;
          var low = k.toLowerCase();
          if (low.indexOf('alcald') !== -1) { 
              alc = r[k]; 
              break; 
          }
        }

        var marker = L.marker([lat, lon]).bindPopup(
          '<div style="min-width:220px">' +
            '<strong>' + (prog || '(sin programa)') + '</strong>' +
            '<div><small>ID:</small> ' + id + '</div>' +
            '<div><small>Alcaldía:</small> ' + (alc || '(desconocida)') + '</div>' +
            '<div><small>Coordenadas:</small> ' + lat.toFixed(6) + ', ' + lon.toFixed(6) + '</div>' +
          '</div>'
        );

        cluster.addLayer(marker);
        bounds.extend([lat, lon]);
        count++;
      }

      map.addLayer(cluster);
      if (count > 0) 
          map.fitBounds(bounds.pad(0.08));
      msg.textContent = 'Se cargaron ' + count + ' marcadore(s).';
    })
    .catch(function (err) {
      console.error(err);
      msg.textContent = 'Error al cargar CDMX.json: ' + err.message;
    });
});
