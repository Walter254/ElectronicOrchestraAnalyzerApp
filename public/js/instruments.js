document.addEventListener('DOMContentLoaded', function() {
    var instrumentsData = [];
    fetchInstrumentsData();

    var width = 350, height = 200; 
    var svg = d3.select("#gauge")
                .append("svg")
                .attr("width", width)
                .attr("height", height);

    var g = svg.append("g")
               .attr("transform", `translate(${width / 2}, ${height - 10})`);

    var arc = d3.arc()
                .innerRadius(130) 
                .outerRadius(160)
                .startAngle(-Math.PI / 2)
                .endAngle(Math.PI / 2);

    g.append("path")
    .attr("d", arc())
    .attr("fill", "blue")
    .attr("fill-opacity",0.75)
    .attr("stroke", "black")
    .attr("stroke-width", "2")
    .attr("stroke-linecap", "butt");
     
    

    var needle = g.append("line")
                  .attr("x1", 0)
                  .attr("y1", 0)
                  .attr("x2", 0)
                  .attr("y2", -140) 
                  .attr("stroke", "red") 
                  .attr("stroke-width", 3);

    var slider = document.getElementById("angleSlider");
    slider.addEventListener("input", function() {
        updateNeedle(this.value);
    });

    function updateNeedle(angle) {
        var rad = (angle - 90) * (Math.PI / 180);
        needle.attr("transform", `rotate(${angle - 90})`);
        updateInstrumentDetails(angle);
    }

    function updateInstrumentDetails(angle) {
    const closestInstrument = instrumentsData.reduce((prev, curr) => {
        return (Math.abs(curr.angleOfArrival - angle) < Math.abs(prev.angleOfArrival - angle) ? curr : prev);
    });

    document.getElementById('instrumentName').innerText = closestInstrument ? closestInstrument.name : 'Instrument not found';
    document.getElementById('instrumentDistance').innerText = closestInstrument ? `Distance: ${closestInstrument.distance} m` : '';
    document.getElementById('instrumentAngle').innerText = `Angle: ${angle}°`;
}

    function fetchInstrumentsData() {
        fetch('/api/instruments')
            .then(response => response.json())
            .then(data => {
                instrumentsData = data;
            })
            .catch(error => console.error("Error fetching instrument data: ", error));
    }
});
