async function scatterPlot(){
	console.log("scatterPlot");

	// 1. Access data

	const dataset= await d3.json("my_weather_data.json"); 

	// 2. Create chart dimensions

	let dimensions = {
		width : window.innerWidth  *0.6, 
		height: 400, 
		margin: {
			top: 30, 
			right: 30, 
			bottom: 50, 
			left: 30
		}
	};

	dimensions.boundedWidth = dimensions.width - dimensions.margin.left - dimensions.margin.right; 
	dimensions.boundedHeight = dimensions.height - dimensions.margin.top - dimensions.margin.bottom; 

	// 3. Draw canvas

	let wrapper = d3.select("#wrapper")
					.append("svg")
					.attr("width", dimensions.width) 
					.attr("height", dimensions.height);

	let bounds = wrapper.append("g") 
						.style("transform", `translate(${dimensions.margin.left}px,${dimensions.margin.top}px)`);

	// init static elements

	bounds.append("g")
			.attr("class", "dots"); 

	bounds.append("g")
			.attr("class", "x-axis")
			.style("transform", `translateY(${dimensions.boundedHeight}px`)
			.append("text")
			.attr("class", "x-axis-label"); 

	bounds.append("g")
			.attr("class", "y-axis")
			.style("transform", `translateX(${dimensions.margin.left}px)`)
			.append("text")
			.attr("class", "y-axis-label");

	// Accessors

	const xAccessor = d => d.humidity; 
	const yAccessor = d => d.dewPoint; 
	const rAccessor = d => d.temperatureMax; 


	// 4. Create scales

	let xScale = d3.scaleLinear()
					.domain(d3.extent(dataset, xAccessor))
					.range([dimensions.margin.left, dimensions.boundedWidth]);

	let yScale = d3.scaleLinear()
					.domain(d3.extent(dataset, yAccessor))
					.range([dimensions.boundedHeight, dimensions.margin.top]); 

	let rScale = d3.scaleLinear()
					.domain(d3.extent(dataset, rAccessor))
					.range([dimensions.boundedHeight*0.01, dimensions.boundedHeight*0.03])


	// 5. Draw data

	let dotsContainer = bounds.select(".dots")
								.selectAll(".dot")
								.data(dataset);

	dotsContainer.exit()
					.remove();

	dotsContainer = dotsContainer.enter()
					.append("circle")
					.attr("class", "dot")
					.attr("cx",d=>xScale(xAccessor(d)))
					.attr("cy", d=>yScale(yAccessor(d)))
					.attr("r", d=>rScale(rAccessor(d)));
					
	// 6. Draw peripherals

	let xAxisGen = d3.axisBottom().scale(xScale);
	let yAxisGen = d3.axisLeft().scale(yScale);

	const axisX = bounds.select(".x-axis").call(xAxisGen); 
	const axisY = bounds.select(".y-axis").call(yAxisGen);

	const axisXLabel = bounds.select(".x-axis-label")
							.attr("x", dimensions.boundedWidth/2)
							.attr("y", dimensions.margin.bottom -10)
							.text("Humidity"); 

	const axisYLabel = bounds.select(".y-axis-label")
							.attr("x", -dimensions.boundedHeight / 2)
							.attr("y", -dimensions.margin.left )
							.text("DewPoint");

	// 7. Set up interactions

	dotsContainer.on("mouseenter", onMouseEnter)
				.on("mouseleave", onMouseLeave);

	const tooltip = d3.select("#tooltip"); 

	function onMouseEnter(e, datum) {

		tooltip.select("#humidity")
				.text(xAccessor(datum));

		tooltip.select("#dewPoint")
				.text(yAccessor(datum));

		tooltip.select("#temperatureMax")
				.text(rAccessor(datum));


		const x = xScale(xAccessor(datum)) + dimensions.margin.left; 
		const y = yScale(yAccessor(datum)) + dimensions.margin.top; 

		tooltip.style("transform", `translate(`
					+ `calc(-50% + ${x}px),`
					+ `calc(-110% + ${y}px)`
					+ `)`);

		tooltip.style("opacity", 1);					

	}

	function onMouseLeave() {
		tooltip.style("opacity", 0); 
	}

}

scatterPlot();