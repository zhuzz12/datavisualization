async function drawMap () {

	// 1. Prepare datasets

	const stateShapes = await d3.json("./russia-states.json");
	const dataset = await d3.csv("./russia-population-by-adm-units.csv");

	// 2. Accessors

	const stateNameAccessor = d => d.properties["gn_name"]; 

	const metric = "Population (2022 est)";

	let metricDataByState = {};

	dataset.forEach(d => {
		metricDataByState[d["Name"]] = +d[metric] || 0; 
	});

	console.log(metricDataByState);
	console.log(stateShapes);

	// 3. Set dimensions

	let dimensions = {
		width: window.innerWidth * 0.9,
		height: window.innerWidth * 0.5, 
		margin: {
			top: 10, 
			right: 10, 
			bottom: 10, 
			left: 10
		}
	};

	dimensions.boundedWidth = dimensions.width - dimensions.margin.left - dimensions.margin.right;
	dimensions.boundedHeight = dimensions.height - dimensions.margin.top - dimensions.margin.bottom; 

	const projection = d3.geoMercator()
							.center([105, 61])
							.scale(dimensions.boundedHeight/2)
							.translate([dimensions.width/2, dimensions.height/2]); 

	const pathGenerator = d3.geoPath(projection);


	const wrapper = d3.select("#wrapper")
						.append("svg")
						.attr("width", dimensions.width)
						.attr("height", dimensions.height);

	const bounds = wrapper.append("g")
							.style("transform", `translate(${dimensions.margin.left}px, ${dimensions.margin.top}px)`); 




	const  metricValues = Object.values(metricDataByState); 
	const metricValueExtent = d3.extent(metricValues); 

	// 4. Define Scales 

	const colorScale = d3.scaleLinear()
							.domain([d3.min(metricValueExtent), 2000000, d3.max(metricValueExtent)])
							.range([ "#e6c877", "indigo", "darkgreen"]); 

	// 5. Draw map 

	const states = bounds.selectAll(".state")
							.data(stateShapes.features)
							.join("path")
							.attr("class", "state")
							.attr("d", pathGenerator)
							.attr("fill", d => {
								const metricValue = metricDataByState[stateNameAccessor(d)]; 
								if (typeof metricValue == "undefined") return "#e2e6e9"; 
								return colorScale(metricValue);
							}); 
	
	const legendGroup = wrapper.append("g")
								.attr("transform", `translate(${200}, ${dimensions.width <800 ? (dimensions.boundedHeight-30) : (dimensions.boundedHeight *0.1) })`); 

	const legendTitle = legendGroup.append("text")
									.attr("y", -23)
									.attr("class", "legend-title")
									.text("Population in Federal units of Russia");
	const legendByLine = legendGroup.append("text")
									.attr("y", -9)
									.attr("class", "legend-byline")
									.text("(2022 est)");

	const defs = wrapper.append("defs");
	const legendGradientId = "legend-gradient"; 
	const gradient = defs.append("linearGradient")
						.attr("id", legendGradientId)
						.selectAll("stop")
						.data(colorScale.range())
						.join("stop")
						.attr("stop-color", d => d)
						.attr("offset", (d, i) => `${i*100/2}%`);

	const legendWidth = 120; 
	const legendHeight = 16; 
	const legendGradient = legendGroup.append("rect")
										.attr("x", -legendWidth/2)
										.attr("height", legendHeight)
										.attr("width", legendWidth)
										.attr("fill", `url(#${legendGradientId})`);

	const legendValueRight = legendGroup.append("text")
										.attr("class", "legend-value")
										.attr("x", (legendWidth / 2) + 65)
										.attr("y", legendHeight / 2)
										.text(`${d3.format(",.0f")(d3.max(metricValueExtent))}`)
										.style("text-anchor", "end");  

	const legendValueLeft = legendGroup.append("text")
											.attr("class", "legend-value")
											.attr("x", -(legendWidth / 2) -5)
											.attr("y", legendHeight / 2)
											.text(`${d3.format(",.0f")(d3.min(metricValueExtent))}`)
											.style("text-anchor", "end");  

	states.on("mouseenter", onMouseEnter)
				.on("mouseleave", onMouseLeave);

	const tooltip = d3.select("#tooltip");

	function onMouseEnter(e, datum){
		const metricValue = metricDataByState[stateNameAccessor(datum)]; 

		tooltip.select("#state")
				.text(stateNameAccessor(datum));

		tooltip.select("#value")
				.text(`${metric}: ${d3.format(",.0f")(metricValue || 0)}`);

		const [centerX, centerY] = pathGenerator.centroid(datum);

		const x = centerX + dimensions.margin.left; 
		const y = centerY + dimensions.margin.top; 

		tooltip.style("transform", `translate(${x}px, ${y}px)`);
		tooltip.style("opacity", 1); 

	};

	function onMouseLeave(){
		tooltip.style("opacity", 0);
	};


}; 

drawMap(); 	