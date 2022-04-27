async function drawLineChart() {
	
	// 1. Access data

	const dataset = await d3.json("./my_weather_data.json");

	// 2. Create chart dimensions

	const width = 1000;
	let dimensions = {
		width: width,
		height: width*0.4,
		margin: {
			top: 30,
			right: 10,
			bottom: 50,
			left: 50
		}
	};

	dimensions.boundedWidth = dimensions.width - dimensions.margin.left - dimensions.margin.right;
	dimensions.boundedHeight = dimensions.height - dimensions.margin.top - dimensions.margin.bottom;

	// 3. Draw canvas

	const wrapper = d3.select("#wrapper")
						.append("svg")
						.attr("height", dimensions.height)
						.attr("width", dimensions.width);
	const bounds = wrapper.append("g")
						.style("transform", `translate(${dimensions.margin.left}px,${dimensions.margin.top}px)`);


	// init static elements

	bounds.append("g")
				.attr("class", "x-axis")
				.style("transform", `translateY(${dimensions.boundedHeight}px)`)
				.append("text")
				.attr("class", "x-axis-label");

	bounds.append("g")
				.attr("class", "y-axis")
				.append("text")
				.attr("class", "y-axis-label");

	bounds.append("path")
				.attr("class", "line");

	const tooltipCircle = bounds
	    .append("circle")
	    .attr("class", "tooltip-circle")
	    .attr("r", 4)
	    .attr("stroke", "#af9358")
	    .attr("fill", "white")
	    .attr("stroke-width", 2)
	    .style("opacity", 0);

	// Accessors

	const dateParser = d3.timeParse("%Y-%m-%d"); 
	const yAccessor = d => d.temperatureMax;
	const xAccessor  = d => dateParser(d.date);

	// 4. Create scales
	
	const yScale = d3.scaleLinear()
						.domain(d3.extent(dataset, yAccessor))
						.range([dimensions.boundedHeight, 0]); 

	
	const xScale = d3.scaleTime()
						.domain(d3.extent(dataset, xAccessor))
						.range([0, dimensions.boundedWidth]);

	// 5. Draw data

	const lineGenerator = d3.line()
							.x(d => xScale(xAccessor(d)))
							.y(d => yScale(yAccessor(d)));


	const line = bounds.select(".line")
						.datum(dataset)
						.attr("d", d => lineGenerator(d))
						.attr("fill", "none")
						.attr("stroke", "#af55ff")
						.attr("stroke-width", 3)
						.attr("z-index",10);

	// 6. Draw peripherals

	const yAxisGenerator = d3.axisLeft()
							.scale(yScale); 

	const xAxisGenerator = d3.axisBottom()
							.scale(xScale);


	const yAxis = bounds.select(".y-axis")
						.call(yAxisGenerator); 

	const xAxis = bounds.select(".x-axis")
						.call(xAxisGenerator)

	const xAxisLabel = bounds.select(".x-axis-label")
								.attr("x", dimensions.boundedWidth/2)
								.attr("y", dimensions.margin.bottom - 10)
								.text("Date");

	const yAxisLabel = bounds.select(".y-axis-label")
								.attr("x", -dimensions.boundedHeight / 2)
    							.attr("y", -dimensions.margin.left +10)
    							.text("temperatureMax");



	console.log(dataset);

	// 7. Set up interactions

	bounds.select(".line")
			.on("mouseenter", onMouseEnter)
			.on("mouseleave", onMouseLeave); 



	const tooltip = d3.select("#tooltip"); 


	function onMouseEnter(e, d){
		
		currentX =d3.pointer(e)[0]; 
		currentDate =  xScale.invert(currentX);

		const getDistanceFromCurrentDate = d => Math.abs(currentDate - xAccessor(d));

		closestDateIndex = d3.scan(d, (a, b) => getDistanceFromCurrentDate(a) - getDistanceFromCurrentDate(b));  
		closestPoint = d[closestDateIndex];  


		closestX = xAccessor(closestPoint); 
		closestY = yAccessor(closestPoint); 


		const formatDate = d3.timeFormat("%Y-%m-%d");
		tooltip.select("#date")
				.text(formatDate(closestX));

		tooltip.select("#value")
				.text(closestY);

		
		const x = xScale(closestX) + dimensions.margin.left; 
		const y = yScale(closestY) + dimensions.margin.top; 

		tooltip.style("transform", `translate(`
					+ `calc(-50% + ${x}px),`
					+ `calc(-100% + ${y}px)`
					+ `)`);

		tooltip.style("opacity", 1);

		tooltipCircle.attr("cx", xScale(closestX))
				      .attr("cy", yScale(closestY))
				      .style("opacity", 1);


	}; 

	function onMouseLeave(){
		tooltip.style("opacity", 0); 
		tooltipCircle.style("opacity", 0);
	};

}

drawLineChart();