async function drawLines() {

    const dataset = await d3.json("./my_weather_data.json"); 
 
    const width = 600;
    let dimensions = {
      width: width,
      height: width * 0.6,
      margin: {
        top: 20,
        right: 30,
        bottom: 20,
        left: 30,
      }
    }; 

    dimensions.boundedWidth = dimensions.width
      - dimensions.margin.left
      - dimensions.margin.right;
    dimensions.boundedHeight = dimensions.height
      - dimensions.margin.top
      - dimensions.margin.bottom; 

    // 3. Draw canvas

    const wrapper = d3.select("#wrapper")
      .append("svg")
        .attr("width", dimensions.width)
        .attr("height", dimensions.height);

    const bounds = wrapper.append("g")
        .style("transform", `translate(${dimensions.margin.left}px,${dimensions.margin.top}px)`);

    // init static elements
    bounds.append("path")
        .attr("class", "line"); 
    bounds.append("g")
        .attr("class", "y-axis")
        //style("transform", `translateX(${dimensions.margin.left}px)`)
        //.append("text")
        //.attr("class", "y-axis-label")
        //.attr("x", dimensions.boundedWidth / 2)
        //.attr("y", dimensions.margin.bottom - 10);

    const drawLineChart = metric => {
        const dateParser = d3.timeParse("%Y-%m-%d");
        
        //Accessor
        const yAccessor = d => d[metric];
        const xAccessor = d => dateParser(d.date); 

        const updateTransition = d3.transition().duration(600);

        /*
        const xScaler = d3.scaleLinear()
            .domain(d3.extent(dataset, metricAccessor))
            .range([0, dimensions.boundedWidth])
            .nice(); 
        
        
        
        const binsGen = d3.bin()
            .domain(xScaler.domain())
            .value(metricAccessor)
            .thresholds(12);

        const bins = binsGen(dataset);
        console.log(bins);
        */ 

        const xScaler = d3.scaleTime()
                            .domain(d3.extent(dataset, xAccessor))
                            .range([0, dimensions.boundedWidth]);

        const yScaler = d3.scaleLinear()
            .domain(d3.extent(dataset, yAccessor))
            .range([dimensions.boundedHeight, 0]); 

        const lineGenerator = d3.line()
                                .x(d => xScaler(xAccessor(d)))
                                .y(d => yScaler(yAccessor(d)));
        
        
        let line = bounds.select(".line")
                            .transition(updateTransition)
                            .attr("d", lineGenerator(dataset))
                            .attr("fill", "none")
                            .attr("stroke", "#af9999")
                            .attr("stroke-width", 2); 

        
        const yAxisGenerator = d3.axisLeft()
							    .scale(yScaler);
        

        const xAxisGenerator = d3.axisBottom()
                                    .scale(xScaler);

        const yAxis = bounds.select(".y-axis")
                            .transition(updateTransition)
                            .call(yAxisGenerator); 

        const xAxis = bounds.append("g")
                            .call(xAxisGenerator)
                            .style("transform", `translateY(${dimensions.boundedHeight}px)`);

        
        

        /*
        const oldLine = line.exit(); 
        oldLine.remove(); 
    
        const newLine = line.enter().append("path")
                                    .attr("class", "line"); 
        
        line = newLine.merge(line); 

        */ 
        
        
        
        
        /*
        let binGroups = bounds.select(".bins").selectAll(".bin").data(bins); 

        const oldBinGroups = binGroups.exit(); 
        oldBinGroups.selectAll("rect")
            .style("fill", "orangered")
            .transition(exitTransition)
            .attr("y", dimensions.boundedHeight)
            .attr('height', 0); 
        oldBinGroups.selectAll("text")
            .transition(exitTransition)
            .attr("y", dimensions.boundedHeight); 

        oldBinGroups.transition(exitTransition).remove(); 

        const newBinGroups = binGroups.enter().append("g")
            .attr("class", "bin"); 

        newBinGroups.append("rect"); 
        newBinGroups.append("text"); 

        binGroups = newBinGroups.merge(binGroups); 

        const barPadding = 1; 

        const barRect = binGroups.select("rect")
            .transition(updateTransition)
            .attr("x", d => xScaler(d.x0) + barPadding / 2)
            .attr("y", d => yScaler(yAccessor(d)))
            .attr("width", d => d3.max([0, xScaler(d.x1) - xScaler(d.x0) - barPadding]))
            .attr("height", d => dimensions.boundedHeight - yScaler(yAccessor(d)))
            .transition()
            .style("fill","cornflowerblue"); 


        const barText = binGroups.select("text")
            .transition(updateTransition)
            .attr("x", d => xScaler(d.x0) + (xScaler(d.x1) - xScaler(d.x0)) / 2)
            .attr("y", d => yScaler(yAccessor(d)) - 5)
            .text(d => yAccessor(d) || ""); 
        */

        /*
        const mean = d3.mean(dataset, metricAccessor);
        console.log(mean);
        const meanLine = bounds.selectAll(".mean")
            .transition(updateTransition)
            .attr("x1", xScaler(mean))
            .attr("x2", xScaler(mean))
            .attr("y1", -15)
            .attr("y2", dimensions.boundedHeight); 
        */ 

        /*
        const xAxisGen = d3.axisBottom()
            .scale(xScaler);
        const xAxis = bounds.select("x-axis")
            .transition(updateTransition)
            .call(xAxisGen)
            .style("transform", `translateY(${dimensions.boundedHeight}px)`);
        */


    }

 
    const metrics = [
        "windSpeed",
        "moonPhase",
        "dewPoint",
        "humidity",
        "uvIndex",
        "windBearing",
        "temperatureMin",
        "temperatureMax"
    ]; 
    let mIndex = 0; 

    drawLineChart(metrics[mIndex]);
    const button = d3.select("body")
        .append("button")
        .text("Change Metric"); 

    button.node().addEventListener("click", onClick); 

    function onClick() {
        mIndex = (mIndex + 1) % metrics.length; 
        drawLineChart(metrics[mIndex]); 
        console.log(mIndex); 
    }; 

}

drawLines(); 
