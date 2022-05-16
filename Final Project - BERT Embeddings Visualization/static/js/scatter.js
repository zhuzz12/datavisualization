function buttonClick() {
  var req = new XMLHttpRequest();
  var result = document.getElementById('result');
  req.onreadystatechange = function()
  {
    if(this.readyState == 4 && this.status == 200) {
      //result.innerHTML = this.responsesText;
      console.log(this.responseText);
      scatterPlot(this.responseText);
    } else {
      console.log("error"); 
    }
  };

  req.open('POST', '/visualize', true);
  req.setRequestHeader('content-type', 'application/x-www-form-urlencoded;charset=UTF-8');
  req.send("vis_text=" + document.getElementById('vis_text').value);
}

async function drawLayout() {

    // 1. Dimensions

    const width = window.innerWidth  *0.6;
    let dimensions = {
      width: width,
      height: width * 0.5,
      margin: {
        top: 20,
        right: 30,
        bottom: 20,
        left: 30,
      }
    }; 

    dimensions.boundedWidth = dimensions.width - dimensions.margin.left - dimensions.margin.right;
    dimensions.boundedHeight = dimensions.height - dimensions.margin.top - dimensions.margin.bottom; 


    let dimensionsBottom = {
      width: width , 
      height: width * 0.25, 
      margin: {
        top: 30, 
        right: 30, 
        bottom: 20, 
        left: 30
      }
    };

    dimensionsBottom.boundedWidth = dimensionsBottom.width - dimensionsBottom.margin.left - dimensionsBottom.margin.right; 
    dimensionsBottom.boundedHeight = dimensionsBottom.height - dimensionsBottom.margin.top - dimensionsBottom.margin.bottom; 


    // 2. Draw canvas

    let wrapperRight = d3.select("#wrapper-right")
                    .append("svg")
                    .attr("width", dimensions.width)
                    .attr("height", dimensions.height);

    let bounds = wrapperRight.append("g")
                            .style("transform", `translate(${dimensions.margin.left}px,${dimensions.margin.top}px)`);

    let wrapperBottom = d3.select("#wrapper-right")
                          .append("svg")
                          .attr("width", dimensionsBottom.width)
                          .attr("height", dimensionsBottom.height)
                          .style("opacity", 0);
    let boundsBottom = wrapperBottom.append("g")
                                    .style("transform", `translate(${dimensionsBottom.margin.left}px,${dimensionsBottom.margin.top}px)`); 
                          
    // initiate static elements

    bounds.append("g")
          .attr("class", "circles")

    bounds.append("g")
        .attr("class", "y-axis");

    bounds.append("g")
        .attr("class", "x-axis");

    // static elements for bottom bar chart 
    boundsBottom.append("g")
                .attr("class", "bins");
    
    boundsBottom.append("g")
                .attr("class", "y-axis-bottom");

    wrapperBottom.append("text")
                  .text("Top-5 words by cosine similarity:")
                  .attr("x", 20)
                  .attr("y", 15);

    const drawScatter = data => {
      const dataset = JSON.parse(data); 

      console.log(dataset);
      // 3. Accessors 

      const xAccessor = d => d["x"];
      const yAccessor = d => d["y"]; 
      const wordAccessor = d => d["word"]; 
      const contextAccessor = d => d["context"];

      // transitions

      const exitTransition= d3.transition().duration(400); 
      const updateTransition = exitTransition.transition().duration(400); 



      // 4. Scalers

      const xScaler = d3.scaleLinear()
                        .domain(d3.extent(dataset, xAccessor))
                        .range([0, dimensions.boundedWidth]); 

      const yScaler = d3.scaleLinear()
                        .domain(d3.extent(dataset, yAccessor))
                        .range([dimensions.boundedHeight, 0]);

      let circles = bounds.select(".circles")
                          .selectAll(".circle")
                          .data(dataset); 

      // remove previous
      oldCircles = circles.exit();

      oldCircles.selectAll("circle")
                .style("fill", "orangered")
                .transition(exitTransition)
                .attr("cy", dimensions.boundedHeight)
                .attr("r", "0");

      oldCircles.selectAll("text")
                .transition(exitTransition)
                .attr("y", dimensions.boundedHeight);

      oldCircles.transition(exitTransition).remove();

      // add new circles
      newCircles = circles.enter()
                          .append("g")
                          .attr("class", "circle");

      newCircles.append("circle"); 
      newCircles.append("text");

      circles = newCircles.merge(circles);

      const circle = circles.select("circle")
                            .transition(updateTransition)
                            .attr("cx", d => xScaler(xAccessor(d)))
                            .attr("cy", d => yScaler(yAccessor(d)))
                            .attr("r", "5px")
                            .style("fill", "#AA1111")
                            .style("z-index", 1)


      const circleText = circles.select("text")
                                .transition(updateTransition)
                                .attr("x", d => xScaler(xAccessor(d))-20)
                                .attr("y", d => yScaler(yAccessor(d)) -10)
                                .text(d => wordAccessor(d) || "")
                                .style("z-index", 10);

      const xAxisGenerator = d3.axisBottom().scale(xScaler);
      const yAxisGenerator = d3.axisLeft().scale(yScaler);

      const xAxis = bounds.select(".x-axis").transition(updateTransition).call(xAxisGenerator).style("transform",`translateY(${dimensions.boundedHeight}px)`); 
      const yAxis = bounds.select(".y-axis").transition(updateTransition).call(yAxisGenerator);


      // 5. Add interactions

      circles.select("circle")
            .on("mouseenter", onMouseEnter)
            .on("mouseleave", onMouseLeave); 

      const tooltip = d3.select("#tooltip"); 

        function onMouseEnter(e, datum){
          const similarity = datum["similarity"];

          const simWordAccessor = d => d[0]["sim_word"];
          const simScoreAccessor = d => d[0]["cos_similarity"];
          const orderAccessor = d => d["order"]; 

          const exitTransition2 = d3.transition().duration(200); 
          const updateTransition2 = exitTransition2.transition().duration(200); 
    

          tooltip.select("#word")
              .text(wordAccessor(datum)); 

          tooltip.select("#context")
              .text(contextAccessor(datum)); 

          const x =  xScaler(xAccessor(datum)) + dimensions.margin.left + dimensions.boundedWidth*0.67; 

          const y = yScaler(yAccessor(datum)) + dimensions.margin.top; 


          tooltip.style("transform", `translate(`
                + `calc(-50% + ${x}px),`
                + `calc(-25% + ${y}px)`
                + `)`);

          tooltip.style("opacity", 1);

          const xScale = d3.scaleLinear()
                          .domain([0,5])
                          .range([0, dimensionsBottom.boundedWidth])
                          .nice();

          const binsGenerator = d3.bin()
                                  .domain([0,5])
                                  .value(orderAccessor)
                                  .thresholds(5);

          const bins = binsGenerator(similarity);
          console.log(bins);

          const yScale = d3.scaleLinear()
                          .domain([0, 1])
                          .range([dimensionsBottom.boundedHeight,0])
                          .nice();
          
          	// 5. Draw data

            const barPadding =  25;

            let binGroups = boundsBottom.select(".bins")
                                  .selectAll(".bin")
                                  .data(bins);
            oldBinGroups = binGroups.exit(); 

            oldBinGroups.selectAll("rect")
                        .style("fill", "orangered")
                        .transition(exitTransition2)
                        .attr("y", dimensionsBottom.boundedHeight)
                        .attr('height', 0); 

            oldBinGroups.selectAll(".scores")
                        .transition(exitTransition2)
                        .attr("y", dimensionsBottom.boundedHeight)
            

            oldBinGroups.transition(exitTransition2).remove();

            const newBinGroups = binGroups.enter()
                                          .append("g")
                                          .attr("class", "bin");
            newBinGroups.append("rect");
            newBinGroups.append("text")
                        .attr("class", "scores");

            newBinGroups.append("text")
                        .attr("class", "words");

            // update binGroups to include new points
            binGroups = newBinGroups.merge(binGroups);
            
            const barRects = binGroups.select("rect")
                          .transition(updateTransition2)
                          .attr("x", d => xScale(d.x0)+barPadding)
                          .attr("y", d => yScale(simScoreAccessor(d)))
                          .attr("height", d => dimensionsBottom.boundedHeight - yScale(simScoreAccessor(d)))	
                          .attr("width", d => d3.max([0, xScale(d.x1)-xScale(d.x0)-barPadding]))
                          .transition();

            const formatSimScore = d3.format(".2f");
            
            const barScore = binGroups
                                    .select(".scores")
                                    .transition(updateTransition2)
                                    .attr("x", d => xScale(d.x0) + (xScale(d.x1) - xScale(d.x0))/2)
                                    .attr("y", d => yScale(simScoreAccessor(d)) - 5)
                                    .text(d => formatSimScore(simScoreAccessor(d)))
                                    .attr("fill","darkgrey")
                                    .attr("font-size","12px");

            const barWord = binGroups.select(".words")
                                        .transition(updateTransition2)
                                        .attr("x", d => xScale(d.x0) + (xScale(d.x1) - xScale(d.x0))/2)
                                        .attr("y", dimensionsBottom.boundedHeight +10)
                                        .text(d => simWordAccessor(d))
                                        .attr("fill","black")
                                        .attr("font-size","12px")
            
            wrapperBottom.style("opacity", 1);
        }

          function onMouseLeave(){  
            tooltip.style("opacity", 0);
            wrapperBottom.style("opacity", 0);
          }


    };

    // 4. Inputs

    const textArea = d3.select("#wrapper-left")
                        .append("textarea")
                        .attr("placeholder", "Enter the text to be visualized")
                        .style("width", `${dimensions.boundedWidth*0.5}px`)
                        .style("height", `${dimensions.boundedWidth*0.5}px`);

    const button = d3.select("#wrapper-left")
                      .append("button")
                      .text("Visualize");


    button.node().addEventListener("click", onClick); 

    function onClick() {
      var req = new XMLHttpRequest();
      var text = textArea.property("value");
      console.log(text);
      req.onreadystatechange = function()
      {
        if(this.readyState == 4 && this.status == 200) {
          const result = this.responseText;
          drawScatter(result);
        } else {
          console.log("error"); 
        }
      };
      
      req.open('POST', '/visualize', true);
      req.setRequestHeader('content-type', 'application/x-www-form-urlencoded;charset=UTF-8');
      req.send("vis_text=" + text);
    }; 


}


drawLayout(); 