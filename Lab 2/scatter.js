async function scatterPlot(){
	console.log("scatterPlot");
	console.log("Im workin");

	const data = await d3.json("./forviz.json"); 

	const xAccessor = d => d[0]; 
	const yAccessor = d => d[1]; 

	let dimensions = {
		width : window.innerWidth  *0.5, 
		height: 300, 
		margin: {
			top: 30, 
			right: 30, 
			bottom: 30, 
			left: 30
		}
	};



	dimensions.boundedWidth = dimensions.width - dimensions.margin.left - dimensions.margin.right; 
	dimensions.boundedHeight = dimensions.height - dimensions.margin.top - dimensions.margin.bottom; 

	let wrapper = d3.select("#wrapper").append("svg");
	wrapper.attr("width", dimensions.width); 
	wrapper.attr("height", dimensions.height);

	let container = wrapper.append("g"); 
	container.append("transform", `translate(${dimensions.margin.left}px,${dimensions.margin.top}px)`);

	let xScale = d3.scaleLinear()
					.domain(d3.extent(data, xAccessor))
					.range([dimensions.margin.left, dimensions.boundedWidth]);

	let yScale = d3.scaleLinear()
					.domain(d3.extent(data, yAccessor))
					.range([dimensions.boundedHeight, dimensions.margin.top]); 

	let viz = container.selectAll("circle")
						.data(data)
						.enter()
						.append("circle")
						.attr("cx",d=>xScale(xAccessor(d)))
						.attr("cy", d=>yScale(yAccessor(d)))
						.attr("r", "5px")
						.style("fill", "#AA1111");


	let xAxisGen = d3.axisBottom().scale(xScale);
	let yAxisGen = d3.axisLeft().scale(yScale);

	const axisX = container.append("g").call(xAxisGen).style("transform",`translateY(${dimensions.boundedHeight}px)`); 
	const axisY = container.append("g").call(yAxisGen).style("transform", `translateX(${dimensions.margin.left}px)`);

	console.log(data); 	
	console.log("Im workin");
}

scatterPlot();