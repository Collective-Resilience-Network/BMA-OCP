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
        'data': 'data.geojson'
    });

    map.addLayer({
        'id': 'points-layer',
        'type': 'symbol',
        'source': 'points',
        'layout': {
            'icon-image': ['get', 'mapbox icon'] , // replace 'custom-icon' with your icon's name
            'icon-size': 1.0, // Adjust the size of the icon if necessary
            'icon-allow-overlap': true // Optional: allows icons to overlap
        }
    });


    // Add the second GeoJSON source and layer
    map.addSource('budget-points', {
        'type': 'geojson',
        'data': 'data-budget.geojson'
    });

    map.addLayer({
        'id': 'budget-points-layer',
        'type': 'symbol',
        'source': 'budget-points',
        'layout': {
            'icon-image': ['get', 'mapbox icon'], // replace 'custom-icon' with your icon's name
            'icon-size': 0.5, // Adjust the size of the icon if necessary
            'icon-allow-overlap': true // Optional: allows icons to overlap
        }
    });

    // Add click event for the first layer
    map.on('click', 'points-layer', function (e) {
        var coordinates = e.features[0].geometry.coordinates.slice();
        var description = e.features[0].properties['Name (ชื่อ)'];

        console.log(description);

        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        new mapboxgl.Popup()
            .setLngLat(coordinates)
            .setHTML(description)
            .addTo(map);
    });

    // Add click event for the second layer
    map.on('click', 'budget-points-layer', function (e) {
        var coordinates = e.features[0].geometry.coordinates.slice();
        var description = e.features[0].properties['Name'];
        var icon = e.features[0].properties['mapbox-icon']; 

        console.log(description);

        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        new mapboxgl.Popup()
            .setLngLat(coordinates)
            .setHTML(description)
            .addTo(map);
    });

    // Add mouse enter and leave events for both layers
    map.on('mouseenter', 'points-layer', function () {
        map.getCanvas().style.cursor = 'pointer';
    });

    map.on('mouseleave', 'points-layer', function () {
        map.getCanvas().style.cursor = '';
    });

    map.on('mouseenter', 'budget-points-layer', function () {
        map.getCanvas().style.cursor = 'pointer';
    });

    map.on('mouseleave', 'budget-points-layer', function () {
        map.getCanvas().style.cursor = '';
    });
});
