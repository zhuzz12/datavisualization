async function drawBar(){
	const dataset = await d3.json("./forviz.json"); 

	const humidityAccessor = d => d; 
	const yAccessor = d => d.length;

	const width = 800;
	let dimensions = {
		width : width, 
		height: width * 0.6, 
		margin: {
			top: 30, 
			right: 30, 
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
							.attr("fill", "#0080FF");


	let xAxisGen = d3.axisBottom().scale(xScaler);
	let yAxisGen = d3.axisLeft().scale(yScaler);

	const axisX = bounds.append("g").call(xAxisGen).style("transform",`translateY(${dimensions.boundedHeight}px)`); 
	//const axisY = bounds.append("g").call(yAxisGen); 

	const mean = d3.mean(dataset, humidityAccessor); 
	console.log(mean);

	const meanLine = bounds.append("line")
							.attr("x1", xScaler(mean))
							.attr("x2", xScaler(mean))
							.attr("y1", -20)
							.attr("y2", dimensions.boundedHeight)
							.attr("stroke", "black")
							.attr("stroke-dasharray", "10px 4px"); 

	const meanLabel = bounds.append("text")
							.attr("x", xScaler(mean))
							.attr("y", dimensions.boundedHeight + 30)
							.text("Mean")
							.attr("fill", "maroon")
							.attr("font-size", "12px")
							.attr("text-anchor", "middle");

	const barText = binGroups.filter(yAccessor)
							.append("text")
							.attr("x", d => xScaler(d.x0) + (xScaler(d.x1) - xScaler(d.x0))/2)
							.attr("y", d => yScaler(yAccessor(d)) - 5)
							.text(yAccessor)
							.attr("fill","darkgrey")
  							.attr("font-size","12px")
      						.attr("text-anchor","middle");
}

drawBar(); 