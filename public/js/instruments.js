document.addEventListener('DOMContentLoaded', function() {
    var instrumentsData = [];
    var singleInstrumentMode = false;
    var singleInstrumentAngle = null;
    var currentIndex = 0;
    var animationInterval = null;
    var playing = false;
    var speed = 2000;

    fetchInstrumentsData();

    var width = 350, height = 350;  // Increase height to better fit the larger needle
    var svg = d3.select("#gauge")
                .append("svg")
                .attr("width", width)
                .attr("height", height);
    
    var g = svg.append("g")
               .attr("transform", `translate(${width / 2}, ${height / 2})`); // Centering the gauge
    
    // Create a gradient for the arc
    var defs = svg.append("defs");
    var gradient = defs.append("linearGradient")
                       .attr("id", "gaugeGradient")
                       .attr("x1", "0%")
                       .attr("y1", "0%")
                       .attr("x2", "100%")
                       .attr("y2", "100%");
    gradient.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", "#000") // Dark color for an elegant look
            .attr("stop-opacity", 1);
    gradient.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", "#444") // Lighter gray to simulate metallic shine
            .attr("stop-opacity", 1);
    
    var arc = d3.arc()
                .innerRadius(130)
                .outerRadius(160)
                .startAngle(-Math.PI / 2)
                .endAngle(Math.PI / 2);
    
    g.append("path")
     .attr("d", arc())
     .attr("fill", "url(#gaugeGradient)")
     .attr("stroke", "gold") // Gold stroke for a luxurious touch
     .attr("stroke-width", "3")
     .attr("stroke-linecap", "round") // Rounded caps for a smoother look
     .style("filter", "url(#dropshadow)");  // Applying shadow for depth
    
    // Define a drop shadow filter
    var filter = defs.append("filter")
                     .attr("id", "dropshadow")
                     .attr("height", "130%");
    filter.append("feGaussianBlur")
          .attr("in", "SourceAlpha")
          .attr("stdDeviation", 3)
          .attr("result", "blur");
    filter.append("feOffset")
          .attr("in", "blur")
          .attr("dx", 2)
          .attr("dy", 2)
          .attr("result", "offsetBlur");
    var feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode")
           .attr("in", "offsetBlur");
    feMerge.append("feMergeNode")
           .attr("in", "SourceGraphic");
    
           var saveButton = document.getElementById('saveSessionButton');
           if (saveButton) {
               saveButton.addEventListener('click', saveSession);
           }
       
           function saveSession() {
               var sessionName = document.getElementById('sessionName').value;
               if (!sessionName) {
                   alert('Please enter a session name');
                   return;
               }
       
               var currentInstrumentData = getCurrentInstrumentData();
               fetch('/api/history', {
                   method: 'POST',
                   headers: {'Content-Type': 'application/json'},
                   body: JSON.stringify({
                       sessionLabel: sessionName,
                       instruments: currentInstrumentData
                   })
               })
               .then(response => response.json())
               .then(data => {
                   console.log('Session saved:', data);
                   alert('Session saved successfully!');
               })
               .catch(error => {
                   console.error('Failed to save session:', error);
                   alert('Failed to save session');
               });
           }
       
           function getCurrentInstrumentData() {
               return instrumentsData.map(instrument => ({
                   id: instrument.id,
                   name: instrument.name,
                   angleOfArrival: instrument.angleOfArrival,
                   distance: instrument.distance,
                   photoUrl: instrument.photoUrl
               }));
           }
       

    // Define a radial gradient for the needle tip shine
    var defs = svg.append("defs");
    var radialGradient = defs.append("radialGradient")
                             .attr("id", "needleShine")
                             .attr("cx", "50%")
                             .attr("cy", "50%")
                             .attr("r", "50%");
    radialGradient.append("stop")
                  .attr("offset", "0%")
                  .attr("stop-color", "#ffffff"); // Bright center
    radialGradient.append("stop")
                  .attr("offset", "100%")
                  .attr("stop-color", "red"); // Base color of the needle

    // Teardrop-shaped needle with increased size and using the radial gradient
    var needleLength = 140; // Adjusted for better visibility within the new dimensions
    var needleWidth = 25;  // Thinner for a more elegant look
    var needle = g.append("path")
                  .attr("d", `M0,0 L${needleWidth / 2},-${needleLength} A${needleWidth / 2},${needleWidth / 2} 0 1,1 -${needleWidth / 2},-${needleLength} Z`)
                  .attr("fill", "url(#needleShine)")
                  .attr("transform", "rotate(-90)");

    var slider = document.getElementById("angleSlider");
    slider.addEventListener("input", function() {
        updateNeedle(this.value);
    });


    function updateNeedle(angle) {
        needle.attr("transform", `rotate(${angle - 90})`);
        if (singleInstrumentMode) {
            if (parseInt(angle) === singleInstrumentAngle) {
                updateInstrumentDetails(angle);
            } else {
                clearInstrumentDetails();
            }
        } else {
            updateInstrumentDetails(angle);
        }
    }

    function updateInstrumentDetails(angle) {
        const closestInstrument = instrumentsData.reduce((prev, curr) => {
            return (Math.abs(curr.angleOfArrival - angle) < Math.abs(prev.angleOfArrival - angle) ? curr : prev);
        });

        document.getElementById('instrumentName').innerText = closestInstrument ? closestInstrument.name : 'Instrument not found';
        document.getElementById('instrumentDistance').innerText = closestInstrument ? `Distance: ${closestInstrument.distance} m` : '';
        document.getElementById('instrumentAngle').innerText = `Angle: ${angle}°`;
    }

    function clearInstrumentDetails() {
        document.getElementById('instrumentName').innerText = 'Adjust needle to exact angle';
        document.getElementById('instrumentDistance').innerText = '';
        document.getElementById('instrumentAngle').innerText = '';
    }

    var slider = document.getElementById("angleSlider");
    slider.addEventListener("input", function() {
        updateNeedle(this.value);
        if (playing) {
            pauseAnimation(); // Automatically pause if manual adjustment is made
        }
    });

    var playPauseButton = document.getElementById("playPauseButton");
    playPauseButton.addEventListener("click", togglePlay);

    function togglePlay() {
        if (!playing) {
            if (currentIndex >= instrumentsData.length) { // Check if we need to restart the animation
                currentIndex = 0;
                speed = initialSpeed;
            }
            playAnimation();
        } else {
            pauseAnimation();
        }
    }

    function playAnimation() {
        playing = true;
        document.getElementById('playPauseButton').innerText = 'Pause';
        if (!animationInterval) {
            animationInterval = setInterval(animateInstruments, speed);
        }
    }

    function pauseAnimation() {
        playing = false;
        document.getElementById('playPauseButton').innerText = 'Play';
        clearInterval(animationInterval);
        animationInterval = null;
    }

    function animateInstruments() {
        if (currentIndex < instrumentsData.length) {
            var instrument = instrumentsData[currentIndex];
            updateNeedle(instrument.angleOfArrival);
            slider.value = instrument.angleOfArrival;

            currentIndex++;
            speed = speed * 0.95; // Gradually increase speed
            resetInterval();
        } else {
            pauseAnimation();
        }
    }

    function resetInterval() {
        clearInterval(animationInterval);
        animationInterval = setInterval(animateInstruments, speed);
    }


    function fetchInstrumentsData() {
        fetch('/api/instruments')
            .then(response => response.json())
            .then(data => {
                instrumentsData = data;
                if (instrumentsData.length === 1) {
                    singleInstrumentMode = true;
                    singleInstrumentAngle = instrumentsData[0].angleOfArrival;
                    updateNeedle(singleInstrumentAngle);
                    document.getElementById('angleSlider').value = singleInstrumentAngle;
                } else if (instrumentsData.length > 1) {
                    singleInstrumentMode = false;
                    document.getElementById('angleSlider').value = 0;
                    updateNeedle(0);
                    instrumentsData = data.sort((a, b) => a.timestamp - b.timestamp);
                    playAnimation();
                }
            })
            .catch(error => console.error("Error fetching instrument data: ", error));
    }
});
