mapboxgl.accessToken = "pk.eyJ1IjoiY29sbGVjdGl2ZXJlc2lsaWVuY2V0aCIsImEiOiJjbHdnamZreW4wNWJjMmpwYzd1MGg2bG44In0.eyNi49TGa5IMo83m17ksbQ";
const map = new mapboxgl.Map({
    container: "map", // Container ID
    style: "mapbox://styles/collectiveresilienceth/clws13p7i00ys01pcc4yh10c3/draft", // Map style to use
    attributionControl: false, // Hide Mapbox Bottom Right Message
    center: [100.523186, 13.736717], // Starting position [lng, lat]
    zoom: 11, // Starting zoom level
    projection: "globe",
});

map.on('load', function () {
    // Add the first GeoJSON source and layer
    map.addSource('points', {
        'type': 'geojson',
        'data': 'data/data.geojson'
    });

    map.addLayer({
        'id': 'points-layer',
        'type': 'symbol',
        'source': 'points',
        'layout': {
            'icon-image': ['get', 'mapbox icon'], // Custom icon
            'icon-size': 1.0, // Adjust the size of the icon if necessary
            'icon-allow-overlap': true // Allows icons to overlap
        }
    });

    // Add the second GeoJSON source and layer
    map.addSource('budget-points', {
        'type': 'geojson',
        'data': 'data/data-budget.geojson'
    });

    map.addLayer({
        'id': 'budget-points-layer',
        'type': 'symbol',
        'source': 'budget-points',
        'layout': {
            'icon-image': ['get', 'mapbox icon'], // Custom icon
            'icon-size': 0.5, // Adjust the size of the icon if necessary
            'icon-allow-overlap': true // Allows icons to overlap
        }
    });
});