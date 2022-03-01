async function drawBar(){
	const dataset = await d3.json("./my_weather_data.json"); 

	const humidityAccessor = d => d.humidity; 
	const yAccessor = d => d.length;

	const width = 600;
	let dimensions = {
		width : width, 
		height: width * 0.6, 
		margin: {
			top: 30, 
			right: 10, 
			bottom: 50, 
			left: 50
		}
	}; 

	dimensions.boundedWidth = dimensions.width - dimensions.margin.left - dimensions.margin.right; 
	dimensions.boundedHeight = dimensions.height - dimensions.margin.top - dimensions.margin.bottom; 

	const wrapper = d3.select("#wrapper").append("svg")
										.attr("width", dimensions.width)
										.attr("height", dimensions.height);

	const bounds = wrapper.append("g")	
						.style("transform", `translate(${dimensions.margin.left}px,${dimensions.margin.top}px)`);

	const xScaler = d3.scaleLinear()
					.domain(d3.extent(dataset, humidityAccessor))
					.range([0, dimensions.boundedWidth])
					.nice();

	const binsGen = d3.bin()
					.domain(xScaler.domain())
					.value(humidityAccessor)
					.thresholds(12); 


	const bins = binsGen(dataset); 
	console.log(bins); 

	const yScaler = d3.scaleLinear()
					.domain([0, d3.max(bins, yAccessor)])
					.range([dimensions.boundedHeight, 0]); 

	const binGroup = bounds.append("g"); 
	const binGroups = binGroup.selectAll("g")
								.data(bins)
								.enter()
								.append("g");

	const barPadding = 1; 
	const barRect = binGroups.append("rect")
							.attr("x", d=>xScaler(d.x0) + barPadding/2)
							.attr("y", d=> yScaler(yAccessor(d)))
							.attr("width", d=> d3.max([0, xScaler(d.x1) - xScaler(d.x0) - barPadding]))
							.attr("height", d=> dimensions.boundedHeight - yScaler(yAccessor(d)))
							.attr("fill", "#1111EE");

	//const barText = binGroups.append

	let xAxisGen = d3.axisBottom().scale(xScaler);
	let yAxisGen = d3.axisLeft().scale(yScaler);

	const axisX = binGroups.append("g").call(xAxisGen).style("transform",`translateY(${dimensions.boundedHeight}px)`); 
	const axisY = binGroups.append("g").call(yAxisGen); //style("transform", `translateX(${dimensions.margin.left/2}px)`);

}

drawBar(); 