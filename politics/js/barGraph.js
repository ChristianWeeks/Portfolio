"use strict";
//The graph object draws the graph and interpolates its axis boundaries based on the data it is fed

var graphObject = function(x, y, width, newHeight, svg){
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
	this.yMax = 1;
	this.yMin = -1;
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
	this.points = null;
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
	yVal -= this.yMin;
	return this.y - (yVal * (this.height - this.topPadding) / (this.yMax - this.yMin));
}
graphObject.prototype.mapXValToGraph = function(xVal){
	xVal -= this.xMin;
	return this.x + (xVal * (this.width) / (this.xMax - this.xMin));
}

//sets the y axis
graphObject.prototype.setAxes = function(){

	this.yAxisData = new Array(this.yLen);
	this.y_val_step = (this.yMax - this.yMin) / (this.yLen - 1);
	for(var i = 0; i < this.yLen; i++){
		this.yAxisData[i] = {"value": ((i*this.y_val_step + this.yMin).toFixed(2)), "loc": this.mapYValToGraph(i*this.y_val_step + this.yMin)} ;
	}
	this.xAxisData = new Array(this.xLen);
	this.x_val_step = (this.xMax - this.xMin) / (this.xLen - 1);
	for(var i = 0; i < this.xLen; i++){
		this.xAxisData[i] = {"value": ((i*this.x_val_step + this.xMin).toFixed(2)), "x": this.mapXValToGraph(i*this.x_val_step + this.xMin), "y": this.y} ;
	}
	return this;
}

graphObject.prototype.setTitleY = function(titleStr){
	this.titleY = titleStr;
	return this;
}

graphObject.prototype.setTitleX = function(titleStr){
	this.titleX = titleStr;
	return this;
}
//changes the value that is currently displayed (total tasks, seconds / task, delay / task, etc.) by modifying
//the data object that will ALWAYS be graphed
graphObject.prototype.setYAttr = function (){
	this.destroyAll();
	//add 1 to the length so that the final value isn't on the very edge of the graph
	var count = 0;
	//calculating the maximum value in the new set
	var queueIndex = 0;

	this.setAxes();
	this.firstTimeData = null;
	this.x_step = this.width / (this.data.length + 1);
	this.barWidth = this.x_step;
	for (var i in this.data){
		console.log(this.data[i].delta);
		var cssClass;
		if(this.data[i].id == "R")
			cssClass = "rep";
		else if(this.data[i].id == "D")
			cssClass = "dem";
		else
			cssClass = "ind";
		this.currentlyViewedData[i] = {
			"data": this.data[i],
			"id": this.data[i].id,
			"name": this.data[i].name,
			"xVal": this.data[i].x,
			"yVal": this.data[i].y,
			"width": this.barWidth,
			"yTop": (this.data[i].delta > 0) ? this.mapYValToGraph(this.data[i].delta) : this.mapYValToGraph(0),
			"yBot": (this.data[i].delta <= 0) ? this.mapYValToGraph(this.data[i].delta) : this.mapYValToGraph(0),
			"x": this.x + (this.x_step / 2) + (count * this.x_step),
			"cssClass": cssClass,
			//These fields store the addresses of the svg elements that represent this data.  Storing them is necessary so that each
			//mousing over one element will highlight both of them.
			"svgLabel": null,
			"svgPopup": null,
		};
		//	console.log(this.mapYValToGraph(this.data[i].y));
		//	console.log(this.mapXValToGraph(this.data[i].x));
		count++;
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
/*	if(this.points != null){
		this.points.transition().duration(10000)
			.attr("opacity", 1)
			.attr("yTop", this.y)
			.each("end", this.destroyElement(this.points));
	}*/
	this.destroyElement(this.bars);
	this.destroyElement(this.points);
	this.destroyElement(this.yTickMarks);
	this.destroyElement(this.yGridLines);
	this.destroyElement(this.yTickLabels);
	this.destroyElement(this.xTickMarks);
	this.destroyElement(this.xTickLabels);
	this.destroyElement(this.title);
	this.destroyElement(this.yAxisLabel);
	this.destroyElement(this.xAxisLabel);
	this.destroyElement(this.axesLegends);
	this.destroyElement(this.x_axis);
	this.destroyElement(this.y_axis);

};

graphObject.prototype.destroyPoints = function(){
	this.destroyElement(this.points);
};
//Destroys an element
graphObject.prototype.destroyElement = function(svgElement){
	if(svgElement != null) svgElement.remove();
};



graphObject.prototype.draw = function(){
	
	this.mouseOver = elementMouseOverClosure(this.x, this.y);
	this.mouseOut = elementMouseOutClosure();
//	this.pathMouseOver = pathMouseOverClosure();
//	this.pathMouseOut = pathMouseOutClosure();
	//Drawing items first whose behavior is dependent on whether time view is active or not
//	this.drawPopups();
	//this.drawPoints();
	this.drawBars();

	//BarGraph xTicks are drawn even in time view because they will shift down to act as a legend for the new line graph
	//These draw functions are independent of whether it is time view or bar view
	this.drawAxesLabels();
	this.drawAxesLegends();
	this.drawAxes();
}


//------------------------------------------------------------------------------------------------------
//DRAW METHODS - Everything below handles the brunt of the D3 code and draws everything to the canvas
//------------------------------------------------------------------------------------------------------
//Creates the the bars in the bar graph view
graphObject.prototype.drawBars = function(){
	 this.bars = this.svgPointer.selectAll("Bars")
		.data(this.currentlyViewedData)
		.enter()
		.append("rect")	
		.attr("id", "bar")
		.attr("class", function(d){return d.cssClass})
		.attr({
			x: function(d) { 
				console.log(d);
				d.svgBar = this;
				return d.x - (d.width / 2);},
			y: function(d) {return d.yTop;},
			height: function(d){ return d.yBot - d.yTop}, 
			width: function(d){return d.width} 
		})
		.on("mouseover", this.mouseOver)
		.on("mouseout", this.mouseOut);
}

//Creates the points 
graphObject.prototype.drawPoints= function(){
	 this.points = this.svgPointer.selectAll("Points")
		.data(this.currentlyViewedData)
		.enter()
		.append("circle")	
		.attr("class", function(d){return d.cssClass;})
		.attr("id", function(d){ return d.id;})

	//	.style("fill", function(d) {return d.color})
	//	.style("stroke", function(d) {return d.color})
	//	.style("stroke-width", 0)
		.attr({
			cx: function(d) { d.svgPoint = this;
				return d.x;},
			cy: function(d) {return d.y;},
			r: 7,//function(d) {return d.r;},
		})
		.on("mouseover", this.mouseOver)
		.on("mouseout", this.mouseOut);
}

//Creates the labels for the axes and the main title
graphObject.prototype.drawAxesLabels = function(){
	//main title
	this.title = this.svgPointer.append("text")
		.attr("class", "axisTitle")
		.style("font-size", 40)
		.attr("text-anchor", "middle")
		.attr({
			x: this.x + this.width/2,
			y: this.y - this.height
		})
		.text(this.titleY + " by " + this.titleX);
	//label for the y axis
	this.yAxisLabel = this.svgPointer.append("text")
		.attr("class", "axisTitle")
		.attr("text-anchor", "middle")
		.attr({
			x: this.x/3,
			y: this.y - this.height / 2
		})
		.attr("transform", "rotate(-90 " + (this.x/3) + ", " + (this.y - this.height / 2) + ")")
		.text(this.titleY);
	//label for the x axis
	this.xAxisLabel = this.svgPointer.append("text")
		.attr("class", "axisTitle")
		.attr("text-anchor", "middle")
		.attr("alignment-baseline", "middle")
		.attr({
			x: this.x  + this.width / 2,
			y: this.y  + 60 
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
	//Creates the tick marks for the x-axis based on the total number of x values.  Does not create vertical grid lines.
	//Drawing the tick marks and labels for the x axis
	 this.xTickMarks = this.svgPointer.selectAll("xTickMarksBar")
		.data(this.xAxisData)
		.enter()
		.append("line")
		.attr({
			x1: function(d, i) { return d.x},
			y1: this.y,
			x2: function(d, i) { return d.x},
			y2: this.y + 10,
			stroke: '#000'
		});

	 this.xTickLabels = this.svgPointer.selectAll("xDataLabel")
		.data(this.xAxisData)
		.enter()
		.append("text")
		.attr("id", "xDataLabel")
		.attr("text-anchor", "end")
		.style("opacity", 1)
		.attr("transform", function(d) { 
			d.svgLabel = this; 
			return "rotate(-45 " + d.x + "," + d.y + ")"})
		.style("fill", "black")
		.attr({
			x: function(d) { return d.x - 10},
			y: this.y + 20,
		})
		.text(function(d) { return d.value});
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
			x: this.x - 12,
			y: function(d){ return d.loc}
		})
		.text(function(d){ return d.value;});
	 this.y_axis = this.svgPointer.append("line")
		.attr({
			x1: this.x,
			y1: this.y,
			x2: this.x,
			y2: this.y - this.height,
			stroke: '#000'
		});
}

graphObject.prototype.drawAxesLegends = function() {
	var xLabelPadding = 55;
	var yLabelPadding = 55;
	var textData = [
		{
		text: "Liberal Rhetoric", 
		x: this.x - yLabelPadding,
		y: this.y - this.height/8,
		cssClass: "demText",
		align: "vertical"},
		{
		text: "Conservative Rhetoric",
		x: this.x - yLabelPadding,
		y: this.y - this.height*7/8,
		cssClass: "repText",
		align: "vertical"},
		{
		text: "Liberal Voter",
		x: this.x + this.width/8,
		y: this.y + xLabelPadding,
		cssClass: "demText",
		align: "horizontal"},
		{
		text: "Conservative Voter",
		x: this.x + this.width*7/8 ,
		y: this.y + xLabelPadding,
		cssClass: "repText",
		align: "horizontal"},
	];

	this.axesLegends = this.svgPointer.selectAll("axesLegend")
		.data(textData)
		.enter()
		.append("text")
		.attr("text-anchor", "middle")
		.attr("alignment-baseline", "middle")
		.attr({ 
			class: function(d){return d.cssClass;},
			x: function(d){return d.x;},
			y: function(d){return d.y;},
			transform: function(d){
				if (d.align == "vertical")
					return "rotate(-90 " + d.x + " " + d.y + ")";
				return "rotate(0 0 0)";
			},
			id: "axesLegend"})
		.text(function(d){return d.text});
	console.log("HELLO");
		
	return this;
}

//Closure needed to have multiple svg-elements activate (highlight) when any one of them is highlighted
//Ex. Mousing over the label, line plot, or color legend for any single computer / user will cause the label to increase its font
//and the line to turn black and increase its stroke width.
function elementMouseOverClosure(graphX, graphY){
	var elementMouseOver = function(d, i){
		//draw lines extending to x and y axes
		d.svgXTrace = d3.select("#mainCanvas").append("line").attr({
			x1: d.x,
			y1: d.y,
			x2: d.x,
			y2: graphY,
			class: d.cssClass
		})
		.style("opacity", 0);
		d.svgYTrace = d3.select("#mainCanvas").append("line").attr({
			x1: d.x,
			y1: d.y,
			x2: graphX,
			y2: d.y,
			class: d.cssClass
		})
		.style("opacity", 0);

		//highlight the nodes
		d3.select(d.svgPopup).moveToFront();
		d3.select(d.svgPoint).moveToFront();
		d3.select(d.svgPopup).transition().style("opacity", 1);
		d3.select(d.svgPoint).transition().attr("r", 15);
		d.svgXTrace.transition().style("opacity",1);
		d.svgYTrace.transition().style("opacity",1);

		//fill in the information bar at the side
		var sideBarTop = d3.select("#sideBar1").attr("class", d.cssClass +"Box sideBox");
		document.getElementById("sideBar1").innerHTML = "<h3>" + d.name + "</h3><h2>Years in Office</h2><h3>" + d.id + "</h3>" + "<h3>IMAGE GOES HERE</h3>";
		document.getElementById("sideBar2").innerHTML = "<h3>Vote: " + d.xVal.toFixed(2) + " %: " + Math.floor(100*d.data.votePercent) + "%</h3>" +
		   "<h3>Speech: " + d.yVal.toFixed(2) + " %: " + Math.floor(100*d.data.speechPercent) + "%</h3>" +"<h3>Delta: " + d.data.delta.toFixed(3) + "</h3>" + 
			+"<h2>Personal information</h2><h2>Wikipedia Link</h2><p>???Vote History???</p><p>???Speech History???</p>";
	}
	return elementMouseOver;
}

//Closure handling mouse out that reverts effects of the mouse-over closure
function elementMouseOutClosure(){
	var elementMouseOut = function(d, i){
		d3.select(d.svgPopup).transition().style("opacity", 0);
		d3.select(d.svgPoint).transition().attr("r", 8);
		d.svgXTrace.transition().style("opacity",0);
		d.svgYTrace.transition().style("opacity",0);
		d.svgXTrace.remove();
		d.svgYTrace.remove();
		
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
