//The graph object draws the graph and interpolates its axis boundaries based on the data it is fed
graphObject = function(x, y, width, newHeight, svg){
	//standard graph values
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = newHeight;
	this.svgPointer = svg;
	this.x_step;
	this.y_step;
	//yLen is the number of steps on the y axis, including 0
	this.yLen = 7;
	this.xLen = 5;
	this.yMax = 1.5;
	this.yMin = -1.5;
	this.xMax = 1;
	this.xMin = 0;

	this.topPadding = 30 
	this.currentlyViewedData = null;
	this.timeView = false;
	this.daysInMonth = 0;

	//scales used to color code the bars.
	//default scale used for unordered / categorical colors	
	this.defaultColorScale = d3.scale.category20b();
	//queue scale colors bars / lines by their queue.  Only works if computers are the current X attribute
	this.queueColorScale = d3.scale.category10();

	//Contains the names of all the queues
	this.allQueues = [];
	
	this.yAttr = false;
	this.xAttr = false;

	//pointer to all data that is currently being graphed
	this.data = null;

	//initializing all svg containers
	this.bars = null;
	this.yTickMarks = null;
	this.yGridLines = null;
	this.yTickLabels = null;
	this.xTickMarks = null;
	this.xTickLabels = null;
	this.popups = null;
	this.title = null;
	this.linePlot = null;
	this.linePlotCircles = null;
}

//maps from canvas space to graph space
graphObject.prototype.mapYValToGraph = function(yVal){
	return this.y - (yVal * (this.height - this.topPadding) / (this.yMax - this.yMin));
}
graphObject.prototype.mapXValToGraph = function(xVal){
	return this.x + (xVal * (this.width) / (this.xMax - this.xMin));
}

//sets the y axis
graphObject.prototype.setAxes = function(){

	this.yAxisData = new Array(this.yLen);
	this.y_val_step = (this.yMax - this.yMin) / (this.yLen - 1);
	for(var i = 0; i < this.yLen; i++){
		this.yAxisData[i] = {"value": ((i*this.y_val_step + this.yMin).toFixed(2)), "loc": this.mapYValToGraph(i*this.y_val_step)} ;
	}
	this.xAxisData = new Array(this.xLen);
	this.x_val_step = (this.xMax - this.xMin) / (this.xLen - 1);
	for(var i = 0; i < this.xLen; i++){
		this.xAxisData[i] = {"value": ((i*this.x_val_step + this.xMin).toFixed(2)), "loc": this.mapXValToGraph(i*this.x_val_step)} ;
	}
}

graphObject.prototype.setTitleY = function(titleStr){
	this.titleY = titleStr;
}

graphObject.prototype.setTitleX = function(titleStr){
	this.titleX = titleStr;
}

graphObject.prototype.setXAttr = function(xAttr){
	this.xAttr = xAttr;
}

graphObject.prototype.setTimeView = function(flag){

		this.timeView = flag;
}

//changes the value that is currently displayed (total tasks, seconds / task, delay / task, etc.) by modifying
//the data object that will ALWAYS be graphed
graphObject.prototype.setYAttr = function (){
	this.destroyAll();
	//add 1 to the length so that the final value isn't on the very edge of the graph
	var count = 0;
	//calculating the maximum value in the new set
	this.yMax = 1.5;
	this.yMin = -1.5;
	var queueIndex = 0;

	this.setAxes();
	this.firstTimeData = null;
	for (i in this.data){
		var currPartyColor;
		if(this.data[i].id == "R")
			currPartyColor = "red";
		else if(this.data[i].id == "D")
			currPartyColor = "blue";
		else
			currPartyColor = "#888";
		this.currentlyViewedData[i] = {
			"id": this.data[i].id,
			"name": this.data[i].name,
			//index and sortedOrder are used to sort the xData without altering the original order of the data.  Transitions would not be possible
			//without this
			"y": this.mapYValToGraph(this.data[i].y -this.yMin),
			"x": this.mapXValToGraph(this.data[i].x),
			"color": currPartyColor,
			//These fields store the addresses of the svg elements that represent this data.  Storing them is necessary so that each
			//mousing over one element will highlight both of them.
			"svgLabel": null,
			"svgPopup": null,
		};
		//	console.log(this.mapYValToGraph(this.data[i].y));
		//	console.log(this.mapXValToGraph(this.data[i].x));
		//setting the timeView setting to true so that the line point positions will be calculated relative to yMaxTime instead of the default yMax 
	}
	this.draw()
		//setTimeout(this.draw(), 5000);

}
	
//assigns the data that will be currently displayed
graphObject.prototype.setData = function(dataObject){
	//removing previous svg elements
	this.destroyAll();

	this.data = dataObject;
	//allocating space for the new x-axis values
	this.currentlyViewedData = new Array(this.xLen);
	if(this.yAttr == false){
		this.yAttr = "speechPos"
	}
	this.setYAttr();
}

//Removes all svg elements from the graph
graphObject.prototype.destroyAll = function(){
	if(this.bars != null){
		this.bars.transition().duration(10000)
			.attr("opacity", 1)
			.attr("yTop", this.y)
			.each("end", this.destroyElement(this.bars));
	}
	//this.destroyElement(this.bars);
	this.destroyElement(this.yTickMarks);
	this.destroyElement(this.yGridLines);
	this.destroyElement(this.yTickLabels);
	this.destroyElement(this.xTickMarks);
	this.destroyElement(this.xTickLabels);
	this.destroyElement(this.popups);
	this.destroyElement(this.title);
	this.destroyElement(this.yAxisLabel);
	this.destroyElement(this.xAxisLabel);
	this.destroyElement(this.linePlot);
	this.destroyElement(this.xTickTimeLabels);
	this.destroyElement(this.xColorLegend);
	d3.selectAll("#QLegend").remove();

}

//Destroys an element
graphObject.prototype.destroyElement = function(svgElement){
	if(svgElement != null)
		svgElement.remove();
}



graphObject.prototype.draw = function(){
	
	this.mouseOver = elementMouseOverClosure();
	this.mouseOut = elementMouseOutClosure();
//	this.pathMouseOver = pathMouseOverClosure();
//	this.pathMouseOut = pathMouseOutClosure();
	this.drawXLabels();
	//Drawing items first whose behavior is dependent on whether time view is active or not
	this.drawPopups();
	this.drawPoints();
	this.drawXTicksBar();
	//	this.drawPopupTime();
//	this.drawXTicksTime();
//	this.shiftXTicksToLegend();
//	this.drawXColorLegend();
	

	//BarGraph xTicks are drawn even in time view because they will shift down to act as a legend for the new line graph
	//These draw functions are independent of whether it is time view or bar view
	this.drawAxesLabels();
	this.drawAxes();
	this.drawYTicks();




	//Draw Axes Lines - these comes last so they are always on top

}


//------------------------------------------------------------------------------------------------------
//DRAW METHODS - Everything below handles the brunt of the D3 code and draws everything to the canvas
//------------------------------------------------------------------------------------------------------

//Creates the the bars in the bar graph view
graphObject.prototype.drawPoints= function(){
	 this.bars = this.svgPointer.selectAll("Bars")
		.data(this.currentlyViewedData)
		.enter()
		.append("circle")	
		.attr("id", function(d){ return d.id;})
		.style("fill", function(d) {return d.color})
		.style("stroke", function(d) {return d.color})
		.style("stroke-width", 0)
		.attr({
			cx: function(d) { d.svgBar = this;return d.x;},
			cy: function(d) {return d.y;},
			r: 8,//function(d) {return d.r;},
		})
		.on("mouseover", this.mouseOver)
		.on("mouseout", this.mouseOut);
}

//Creates the labels for the axes and the main title
graphObject.prototype.drawAxesLabels = function(){
	//main title
	this.title = this.svgPointer.append("text")
		.style("fill", "black")
		.style("font-weight", "bold")
		.style("font-size", 40)
		.attr("text-anchor", "middle")
		.attr({
			x: this.x + this.width/2,
			y: this.y - this.height
		})
		.text(this.titleY + " by " + this.titleX);
	//label for the y axis
	this.yAxisLabel = this.svgPointer.append("text")
		.style("fill", "black")
		.style("font-weight", "bold")
		.style("font-size", 24)
		.attr("text-anchor", "middle")
		.attr({
			x: this.x / 2,
			y: this.y - this.height / 2
		})
		.attr("transform", "rotate(-90 " + (this.x/2) + ", " + (this.y - this.height / 2) + ")")
		.text(this.titleY);
	//label for the x axis
	this.xAxisLabel = this.svgPointer.append("text")
		.style("fill", "black")
		.style("font-weight", "bold")
		.style("font-size", 30)
		.attr("text-anchor", "middle")
		.attr({
			x: this.x  + this.width / 2,
			y: svgHeight - 10 
		})
		.text(this.titleX);		
	
}

//creates the black lines that make the x and y axes
graphObject.prototype.drawAxes = function() {
	 this.x_axis = this.svgPointer.append("line")
		.attr({
			x1: this.x,
			y1: this.y,
			x2: this.x + this.width,
			y2: this.y,
			stroke: '#000'
		});
	 this.y_axis = this.svgPointer.append("line")
		.attr({
			x1: this.x,
			y1: this.y,
			x2: this.x,
			y2: this.y - this.height,
			stroke: '#000'
		});
}

//creates the text boxes that pop up when users mouse over a bar.  The text displays the exact value of that bar.
graphObject.prototype.drawPopups = function(){
	this.popups  = this.svgPointer.selectAll("popUps")
		.data(this.currentlyViewedData)
		.enter()
		.append("text")
		.attr("id", "popup")
		.style("fill", "black")
		.style("opacity", 0)
		.attr("text-anchor", "middle")
		.attr("alignment-baseline", "middle")
		.attr({
			x: function(d){ d.svgPopup = this; return d.x;},
			y: function(d){ return d.y - 15;}
		})
		.text(function(d){ return d.name});
}

//Creates the tick marks along the y-axis based on the total number of y values.  Also creates grid lines
graphObject.prototype.drawYTicks = function(){
	//drawing the tick marks, labels, and grid lines for the Y axis	
	 this.yTickMarks = this.svgPointer.selectAll("yTickMarks")
		.data(this.yAxisData)
		.enter()
		.append("line")
		.attr({
			y1: function(d, i) { return d.loc},
			x1: this.x,
			y2: function(d, i) { return d.loc},
			x2: this.x - 10,
			stroke: '#000'
		})
	 this.yGridLines = this.svgPointer.selectAll("yGridLines")
		.data(this.yAxisData)
		.enter()
		.append("line")
		.attr({
			y1: function(d, i) { return d.loc},
			x1: this.x,
			y2: function(d, i) { return d.loc},
			x2: this.x + this.width,
			stroke: '#DDD'
		});
	 this.yTickLabels = this.svgPointer.selectAll("yTickLabels")
		.data(this.yAxisData)
		.enter()
		.append("text")
		.attr("text-anchor", "end")
		.attr("alignment-baseline", "middle")
		.style("fill", "black")
		.attr({
			//align: "right",
			//valign: "center",
			x: this.x - 12,
			y: function(d){ return d.loc}
		})
		.text(function(d){ return d.value;});
}

//Creates the tick marks for the x-axis based on the total number of x values.  Does not create vertical grid lines.
graphObject.prototype.drawXTicksBar = function() {

	//Drawing the tick marks and labels for the x axis
	 this.xTickMarks = this.svgPointer.selectAll("xTickMarksBar")
		.data(this.xAxisData)
		.enter()
		.append("line")
		.attr({
			x1: function(d, i) { return d.loc},
			y1: this.y,
			x2: function(d, i) { return d.loc},
			y2: this.y + 10,
			stroke: '#000'
		});
}

//Creates a label for each value or category on the x-axis.
graphObject.prototype.drawXLabels = function(){
	 this.xTickLabels = this.svgPointer.selectAll("xDataLabel")
		.data(this.xAxisData)
		.enter()
		.append("text")
		.attr("id", "xDataLabel")
		.attr("text-anchor", "end")
		.style("opacity", 1)
//		.attr("transform", function(d) { 
//			d.svgLabel = this; 
//			return "rotate(-45 " + d.x + "," + .y + ")"})
		.style("fill", "black")
		.attr({
			x: function(d) { return d.loc},
			y: this.y + 20,
		})
		.text(function(d) { return d.value});
}



//draws tick marks for the time view, as the x axis now represents time instead of categorical users / computers
graphObject.prototype.drawXTicksTime = function() {

	//Drawing the tick marks and labels for the x axis
	 this.xTickMarks = this.svgPointer.selectAll("xTickMarks")
		.data(this.firstTimeData)
		.enter()
		.append("line")
		.attr({
			x1: function(d, i) { return d.x},
			y1: this.y,
			x2: function(d, i) { return d.x},
			y2: this.y + 10,
			stroke: '#000'
		});
	 this.xTickTimeLabels= this.svgPointer.selectAll("xLabels")
		.data(this.firstTimeData)
		.enter()
		.append("text")
		.attr("id", "xLabel")
		.attr("text-anchor", "middle")
		.style("opacity", 1)
//		.attr("transform", function(d) { 
//			d.svgLabel = this; 
//			return "rotate(-45 " + d.x + "," + (graph.y + 20) + ")"})
		.style("fill", "black")
		.attr({
			x: function(d) { return d.x},
			y: this.y + 25,
		})
		.text(function(d) { return d.day;})
		.on("mouseover", this.mouseOver)
		.on("mouseout", this.mouseOut);

}

//Closure needed to have multiple svg-elements activate (highlight) when any one of them is highlighted
//Ex. Mousing over the label, line plot, or color legend for any single computer / user will cause the label to increase its font
//and the line to turn black and increase its stroke width.
function elementMouseOverClosure(){
	var elementMouseOver = function(d, i){
		d3.select(d.svgPopup).transition().style("opacity", 1);
		d3.select(d.svgBar).transition().style("stroke-width", 8);
	}
	return elementMouseOver;
}

//Closure handling mouse out that reverts effects of the mouse-over closure
function elementMouseOutClosure(){
	var elementMouseOut = function(d, i){
		d3.select(d.svgPopup).transition().style("opacity", 0);
		d3.select(d.svgBar).transition().style("stroke-width", 0);
		
	}
	return elementMouseOut;
}

/*function pathMouseOverClosure(){
	var PathMouseOver = function (d, i){
		d3.select(d.svgLabel).transition().style("font-weight", "bold").style("font-size", 22);
	//	d3.select(d.svgPopup).transition().style("opacity", 0);
		d3.select(d.svgLinePlot).transition().style("stroke-weight", 6);
	}
	return PathMouseOver;
}
function pathMouseOutClosure(){
	var PathMouseOut = function (d, i){
		d3.select(d.svgLabel).transition().style("font-weight", "normal").style("font-size", 16);
	//	d3.select(d.svgPopup).transition().style("opacity", 0);
		d3.select(d.svgLinePlot).transition().style("stroke-weight", 2);
	}
	return PathMouseOut;
}*/
