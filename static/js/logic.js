var myMap = L.map("map", {
    center: [39.83, -95.71], // US centroid
    zoom: 4.49
});

// Add tile layer.
L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/streets-v11",
    accessToken: API_KEY
}).addTo(myMap);


var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson"

d3.json(queryUrl).then(function(quake) {
    
    var eq = quake.features;


    // Figure out the breaks for the choropleth like scheme using quartiles:
    //-Start

    // First get Array of all earthquake depths
    var allDepth = eq.map(feature => feature.geometry.coordinates[2]);
    var allDepth_sorted = allDepth.sort((a,b) => a-b); //Sort ascending
          
    // Make array of quantiles.
    my_quants = [0, 0.25, 0.50, 0.75, 1]
    
    // Make empty array that will store the breaks for each quantile.
    my_breaks = []
    
    my_quants.forEach(function(quant){
        my_breaks.push(d3.quantile(allDepth_sorted, quant));
    })

    // For book-keeping purposes.
    console.log("Quartiles for earthquake depth: " + my_breaks);
    //-End


    // Now make the point layer representing earthquake locations and magnitude (as relative size) and depth as color
    //-Start
    
    // Loop with index to grab geometry and corresponding magnitude
    for (var i = 0; i < eq.length; i++){
        
        var lat = eq[i].geometry.coordinates[1];
        var lon = eq[i].geometry.coordinates[0];
        var depth = eq[i].geometry.coordinates[2];
        var mag = eq[i].properties.mag;

        var color = ""; // based on depth (in km)

        if (depth >= 12.4){
            color = "red";
        } else if (depth >= 7.1) {
            color  = "orange";
        } else if (depth > 3.1) {
            color = "yellow";
        } else if (depth >= -3.4) {
            color = "green";
        }

        L.circleMarker([lat, lon], {
                stroke: true,
                fillOpacity: 0.75,
                color: "black",
                fillColor: color,
                radius: mag * 2,
                weight: 0.5
        }).addTo(myMap);
    };
    //-End


    // Make legend:
    //-Start
    var legend = L.control({position: "bottomleft"});
    
    legend.onAdd = function() {
        var div = L.DomUtil.create('div', 'info legend');
            var my_colors = ['green', 'yellow', 'orange', 'red'];
            var categories = ['-3.4 to 3.1','3.1 to 7.1','7.1 to 12.4','12.4 to 635.0'];
        div.innerHTML += '<h4>Depth (in km)</h4>'
        for (var j = 0; j < my_colors.length; j++) {
            div.innerHTML +=
                '<i class = "circle" style = "background:' + my_colors[j] + '"></i> ' + (categories[j] ? categories[j] + '<br>' : '+');
        }  
    return div;
    };
    legend.addTo(myMap);
    //-End
});

