// Function to calculate distance between two points (Haversine formula)
function calculateDistance(coord1, coord2) {
    var R = 6371; // Radius of the Earth in km
    var dLat = (coord2[1] - coord1[1]) * Math.PI / 180;
    var dLon = (coord2[0] - coord1[0]) * Math.PI / 180;
    var a =
        0.5 - Math.cos(dLat) / 2 +
        Math.cos(coord1[1] * Math.PI / 180) * Math.cos(coord2[1] * Math.PI / 180) *
        (1 - Math.cos(dLon)) / 2;

    return R * 2 * Math.asin(Math.sqrt(a));
}

// Function to create a circle
function createCircle(center, radiusInKm) {
    const points = 64;
    const coords = {
        latitude: center[1],
        longitude: center[0]
    };
    const km = radiusInKm;

    const ret = [];
    const distanceX = km / (111.32 * Math.cos(coords.latitude * Math.PI / 180));
    const distanceY = km / 110.574;

    let theta, x, y;
    for (let i = 0; i < points; i++) {
        theta = (i / points) * (2 * Math.PI);
        x = distanceX * Math.cos(theta);
        y = distanceY * Math.sin(theta);

        ret.push([coords.longitude + x, coords.latitude + y]);
    }
    ret.push(ret[0]);

    return {
        'type': 'Feature',
        'geometry': {
            'type': 'Polygon',
            'coordinates': [ret]
        }
    };
}

let radiusCircleLayer = null;

function onClick(e) {
    var coordinates = e.lngLat.toArray();
    var features = map.queryRenderedFeatures({ layers: ['points-layer', 'budget-points-layer'] });
    var radius = 3; // Radius in km

    var pointsWithinRadius = features.filter(function (feature) {
        var distance = calculateDistance(coordinates, feature.geometry.coordinates);
        return distance <= radius;
    });

    var pointsLayerPoints = pointsWithinRadius.filter(feature => feature.layer.id === 'points-layer');
    var budgetPointsLayerPoints = pointsWithinRadius.filter(feature => feature.layer.id === 'budget-points-layer');

    // Categorize points based on 'mapbox icon'
    var categorizedPoints = {};
    budgetPointsLayerPoints.forEach(function (feature) {
        var icon = feature.properties['mapbox icon'];
        if (!categorizedPoints[icon]) {
            categorizedPoints[icon] = [];
        }
        categorizedPoints[icon].push(feature);
    });

    // Remove existing radius circle layer if it exists
    if (radiusCircleLayer) {
        map.removeLayer('radius-circle-layer');
        map.removeSource('radius-circle');
    }

    // Add radius circle layer
    const circleGeoJSON = createCircle(coordinates, radius);

    map.addSource('radius-circle', {
        'type': 'geojson',
        'data': circleGeoJSON
    });

    map.addLayer({
        'id': 'radius-circle-layer',
        'type': 'fill',
        'source': 'radius-circle',
        'paint': {
            'fill-color': 'rgba(0, 0, 255, 0.1)',
            'fill-outline-color': 'rgba(0, 0, 255, 0.5)'
        }
    });

    radiusCircleLayer = 'radius-circle-layer';

    var infoContent = `
        <div class="popup-content">
            <h3>ข้อมูลโครงการในรัศมี 3 กม.</h3>
            <p><strong>ชื่อ Name:</strong> ${e.features[0].properties['Name'] || e.features[0].properties['Name (ชื่อ)']}</p>
            <p><strong>เขต District:</strong> ${e.features[0].properties['District (เขต)'] || e.features[0].properties['เขต']}</p>
            <p><strong>สถานะ Status:</strong> ${e.features[0].properties['Status (สถานะดำเนินการ)'] || e.features[0].properties['สถานะโครงการ']}</p>
            <p><strong>จุดเสี่ยงอื่นๆ Other Floods within 3 km:</strong> ${pointsLayerPoints.length}</p>
            <div class="dropdown">
                <button onclick="toggleDropdown('otherFloodsList')">จุดเสี่ยงอื่นๆ Other Floods: ${pointsLayerPoints.length} <span class="toggle-arrow">&#9654;</span></button>
                <ul id="otherFloodsList">`;
    pointsLayerPoints.forEach(function (feature) {
        infoContent += `<li>
                            <a href="#" onclick="alert('You clicked: ${feature.properties['Name'] || feature.properties['Name (ชื่อ)']}')">
                                ${feature.properties['Name'] || feature.properties['Name (ชื่อ)']}
                            </a>
                         </li>`;
    });
    var infoContent = `
    <div class="popup-content">
        <div style="text-align: right; color: gray;">
            รัศมี: 3 KM
        </div>
        <p><strong>ชื่อ Name:</strong><br>${e.features[0].properties['Name'] || e.features[0].properties['Name (ชื่อ)']}</p>
        <p><strong>เขต District:</strong><br>${e.features[0].properties['District (เขต)'] || e.features[0].properties['เขต']}</p>
        <p><strong>สถานะ Status:</strong><br>${e.features[0].properties['Status (สถานะดำเนินการ)'] || e.features[0].properties['สถานะโครงการ']}</p>
        <div class="dropdown">
            <button class="color-flood" onclick="toggleDropdown('otherFloodsList')"><strong>จุดเสี่ยงอื่นๆ Other Floods: ${pointsLayerPoints.length} </strong><span class="toggle-arrow">&#9654;</span></button>
            <ul id="otherFloodsList">`;

    pointsLayerPoints.forEach(function (feature) {
        infoContent += `<li>
                    <a href="#" onclick="alert('You clicked: ${feature.properties['Name'] || feature.properties['Name (ชื่อ)']}')">
                        ${feature.properties['Name'] || feature.properties['Name (ชื่อ)']}
                    </a>
                 </li>`;
    });
    infoContent += `</ul>
        </div>
        <div class="dropdown">
            <button class="color-project" onclick="toggleDropdown('projectsList')">
                <strong>โครงการที่เกี่ยวข้อง Projects:${budgetPointsLayerPoints.length}</strong> 
                <span class="toggle-arrow">&#9654;</span>
            </button>
            <ul id="projectsList">`;

    for (var icon in categorizedPoints) {
        if (categorizedPoints.hasOwnProperty(icon)) {
            infoContent += `<li>
                        <div class="dropdown">
                            <button onclick="toggleDropdown('${icon}List')">
                                ${icon} (${categorizedPoints[icon].length}) <span class="toggle-arrow">&#9654;</span>
                            </button>
                            <ul id="${icon}List">`;
            categorizedPoints[icon].forEach(function (feature) {
                infoContent += `<li>
                            <a href="#" onclick="alert('You clicked: ${feature.properties['Name'] || feature.properties['Name (ชื่อ)']}')">
                                ${feature.properties['Name'] || feature.properties['Name (ชื่อ)']}
                            </a>
                         </li>`;
            });
            infoContent += `</ul>
                         </div>
                       </li>`;
        }
    }
    infoContent += `</div>`;

    document.getElementById('info').innerHTML = infoContent;

}

// Function to toggle dropdown
window.toggleDropdown = function (id) {
    const element = document.getElementById(id);
    const arrow = element.previousElementSibling.querySelector('.toggle-arrow');
    if (element.style.display === 'none') {
        element.style.display = 'block';
        arrow.classList.add('open');
    } else {
        element.style.display = 'none';
        arrow.classList.remove('open');
    }
}

// Add click events for both layers
map.on('click', 'points-layer', onClick);
map.on('click', 'budget-points-layer', onClick);

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
