console.log("Hello world");

async function drawLineChart() {
	console.log("drawLineChart");
	const data = await d3.json("./my_weather_data.json");
	//console.log(data);

	const dateParser = d3.timeParse("%Y-%m-%d"); 

	const yAccessor = d => d.temperatureMax;
	const y2Accessor = d=> d.temperatureLow;

	function xAccessor(d){
		return dateParser(d.date); 
	}

	let dimensions = {
		width: window.innerWidth*0.9,
		height: 400, 
		margin: {
			top: 15, 
			right: 15, 
			bottom: 40, 
			left: 60
		} 
	}; 	

	dimensions.boundedWidth = dimensions.width - dimensions.margin.left - dimensions.margin.right; 
	dimensions.boundedHeight = dimensions.height - dimensions.margin.top - dimensions.margin.bottom; 

	const wrapper = d3.select("#wrapper"); 
	const svg = wrapper.append("svg");
	svg.attr("width", dimensions.width); 
	svg.attr("height", dimensions.height);

	const bounds = svg.append("g").style("transform", `translate(${dimensions.margin.left}px, ${dimensions.margin.top}px)`);

	const yScale = d3.scaleLinear()
						.domain(d3.extent(data, yAccessor))
						.range([dimensions.boundedHeight, 0]); 

	const limitTemperatureVal= yScale(32); 
	const limitTemperature = bounds.append("rect")
									.attr("x", 0)
									.attr("width", dimensions.boundedWidth)
									.attr("y", limitTemperatureVal)
									.attr("height", dimensions.boundedHeight - limitTemperatureVal)
									.attr("fill", "#eeeeee");


	const xScale = d3.scaleTime()
						.domain(d3.extent(data, xAccessor))
						.range([0, dimensions.boundedWidth]);


	const lineGenerator = d3.line()
							.x(d => xScale(xAccessor(d)))
							.y(d => yScale(yAccessor(d)));

	const lineGenerator2 = d3.line()
							.x(d => xScale(xAccessor(d)))
							.y(d => yScale(y2Accessor(d))); 

	const line = bounds.append("path")
						.attr("d", lineGenerator(data))
						.attr("fill", "none")
						.attr("stroke", "#af9999")
						.attr("stroke-width", 2); 

	const line2 = bounds.append("path")
						.attr("d", lineGenerator2(data))
						.attr("fill", "none")
						.attr("stroke", "#ef5599")
						.attr("stroke-width", 2);

	const yAxisGenerator = d3.axisLeft()
							.scale(yScale); 

	const xAxisGenerator = d3.axisBottom()
							.scale(xScale);

	const yAxis = bounds.append("g")
						.call(yAxisGenerator); 

	const xAxis = bounds.append("g")
						.call(xAxisGenerator)
						.style("transform", `translateY(${dimensions.boundedHeight}px)`);


	console.log(data);
	

	const medians = wrapper.append("p")
						.html("Median(TemperatureMax): " + d3.median(data, yAccessor) + 
							"<br>Median(TemperatureLow): " + d3.median(data, y2Accessor) )
						.style("transform", `translate(${dimensions.margin.left}px, ${dimensions.margin.top}px)`);


	const variances = wrapper.append("p")
						.html("Variance(TemperatureMax): " + d3.variance(data, yAccessor).toPrecision(5)  +
						 "<br>Variance(TemperatureLow): " + d3.variance(data, y2Accessor).toPrecision(5))
						.style("transform", `translate(${dimensions.margin.left}px, ${dimensions.margin.top}px)`);

	const deviations = wrapper.append("p")
						.html("Std. deviation(TemperatureMax): " + d3.deviation(data, yAccessor).toPrecision(4)  +
						 "<br>Std. deviation(TemperatureLow): " + d3.deviation(data, y2Accessor).toPrecision(4))
						.style("transform", `translate(${dimensions.margin.left}px, ${dimensions.margin.top}px)`);

}

drawLineChart();