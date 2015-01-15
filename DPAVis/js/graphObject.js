var barWidth = 30;
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
	this.yLen = 6;
	this.yMax = 0;
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
	if(this.timeView)
		return this.y - (yVal * (this.height - this.topPadding) / this.yMaxTime);
	return this.y - (yVal * (this.height - this.topPadding) / this.yMax);
}

//sets the y axis
graphObject.prototype.setYAxis = function(){

	this.yAxisData = new Array(this.yLen);
	if(this.timeView)
		this.y_val_step = this.yMaxTime / (this.yLen - 1);
	else
		this.y_val_step = this.yMax / (this.yLen - 1);	
	for(var i = 0; i < this.yLen; i++){
		this.yAxisData[i] = {"value": (i*this.y_val_step).toFixed(), "loc": this.mapYValToGraph(i*this.y_val_step)} ;
	}

	//x axis data is contained in the same structure that contains all of the values to be graphed,
	//since each user / computer / day has its own tick mark
	//
}

graphObject.prototype.setTitleY = function(titleStr){
	this.titleY = titleStr;
}

graphObject.prototype.setTitleX = function(titleStr, xAttr){
	this.titleX = titleStr;
}

graphObject.prototype.setXAttr = function(xAttr){
	this.xAttr = xAttr;
}

graphObject.prototype.setTimeView = function(flag){

		this.timeView = flag;
}

graphObject.prototype.colorByQueue = function(flag) {

	if(flag == true && this.xAttr == "computers"){
		var count = 0
		for(i in this.currentlyViewedData){
			this.currentlyViewedData[count]["color"] = this.queueColorScale(this.allQueues[this.currentlyViewedData[count]["QName"]]);
			count +=1;
		}
	
		//Recoloring the bars or timeline
	d3.selectAll("#bar").data(this.currentlyViewedData).transition().duration(1000)
		.style("fill", function(d){ return d.Qcolor})
		.style("stroke", function(d){ return d.Qcolor});

		//making the legend visible
	}

}


//changes the value that is currently displayed (total tasks, seconds / task, delay / task, etc.) by modifying
//the data object that will ALWAYS be graphed
graphObject.prototype.setYAttr = function (attrString, drawFunction){
	this.destroyAll();
	this.yAttr = attrString;
	//add 1 to the length so that the final value isn't on the very edge of the graph
	this.x_step = this.width / (this.xLen + 1); 
	this.time_step = this.width / (this.daysInMonth + 1)
	this.barWidth = this.x_step - 10
	var count = 0;
	//calculating the maximum value in the new set
	this.yMax = 0;
	this.yMaxTime = 0;
	for(i in this.data){
		//calculating max value for bar view
		if (this.data[i][this.yAttr] > this.yMax){
			this.yMax = this.data[i][this.yAttr];
		}
		//calculating maximum value for time view
		for(var j = 0; j < this.daysInMonth; j++){
			if(this.yMaxTime < this.data[i]["dayBins"][j][this.yAttr]){
				this.yMaxTime = this.data[i]["dayBins"][j][this.yAttr];
			}
		}	
	}
	var queueIndex = 0;

	this.setYAxis();
	this.firstTimeData = null;
	for (i in this.data){
		if (!(this.data[i]["QName"] in this.allQueues)){
			this.allQueues[this.data[i]["QName"]] = queueIndex;
			queueIndex += 1;
		}

		this.currentlyViewedData[count] = {
			"name": i,
			"QName": this.data[i]["QName"],
			"Qcolor": this.queueColorScale(this.allQueues[this.data[i]["QName"]]),
			//index and sortedOrder are used to sort the xData without altering the original order of the data.  Transitions would not be possible
			//without this
			"index": count,
			"xStart": this.x,
			"step": this.x_step,
			"sortedOrder": count,
			"value": this.data[i][this.yAttr],
			"yBot": this.y,
			"width": this.barWidth,
			"yTop": this.mapYValToGraph(this.data[i][this.yAttr]),
			"xPos": this.x + (this.x_step / 2 )+ (count * this.x_step),
			"color": this.defaultColorScale(count % 20),
			//These fields store the addresses of the svg elements that represent this data.  Storing them is necessary so that each
			//mousing over one element will highlight both of them.
			"svgBar": null,
			"svgLabel": null,
			"svgPopup": null,
			"svgLinePlot": null,
			//time series will contain all of the points for
			"timeSeries": new Array(this.daysInMonth)
		};
		currObj = this.currentlyViewedData[count]["timeSeries"];
		//setting the timeView setting to true so that the line point positions will be calculated relative to yMaxTime instead of the default yMax 
		var timeFlag = false;
		if (this.timeView == true)
			timeFlag = true;
		this.timeView = true;
		for (var j = 0; j < this.daysInMonth; j++){
			currObj[j] = {
				"day": j + 1,
				"value": this.data[i]["dayBins"][j][this.yAttr],
				"xPos": this.x + (this.time_step / 2) + (j * this.time_step),
				"yPos": this.mapYValToGraph(this.data[i]["dayBins"][j][this.yAttr])
			};
			
			console.log(this.yAttr);
			console.log(this.mapYValToGraph(this.data[i]["dayBins"][j][this.yAttr]))
			console.log(this.data[i]["dayBins"][j][this.yAttr])
			//This will be used later to instantly access time data
			if (this.firstTimeData == null){
				this.firstTimeData = currObj;
			}
		}
		//resetting the timeview to whatever value it was before the swap
		this.timeView = timeFlag;
		count++;

	}
	this.sortBy("name");
	this.draw()
		//setTimeout(this.draw(), 5000);

}


//sorts the current bar data by the specified value
graphObject.prototype.sortBy = function(attribute){
	var sortable = [];
	//The sort functions for alphabetic and value aren't the same
	if(attribute == "name"){
		for (var i in this.currentlyViewedData){
			sortable.push([i, this.currentlyViewedData[i]["name"]]);
			sortable.sort(function(a, b) { 
				if(a[1] > b[1]) return -1;
				if(a[1] < b[1]) return 1
				return 0;
			});
		}

	}
	else{
		for (var i in this.currentlyViewedData){
			sortable.push([i, this.currentlyViewedData[i][attribute]]);
			sortable.sort(function(a, b) { return a[1] - b[1]});
		}
	}
	for(var i = 0; i < sortable.length; i++){
		this.currentlyViewedData[sortable[i][0]]["sortedOrder"] = i;
		
		sortable[i][sortable[i][0]] = i;
		
	}
}

//Handles animation when users sort values
graphObject.prototype.sortAnim = function() {
	//Animating bars, labels, and legends to their new positions
	d3.selectAll("#bar").data(this.currentlyViewedData).transition().duration(2000)
		.attr("x", function(d) { return d.xStart - (d.width / 2) + (d.step / 2) + d.sortedOrder * d.step;});

	d3.selectAll("#popup").data(this.currentlyViewedData).transition().duration(2000)
		.attr("x", function(d) { return d.xStart + (d.step / 2) + d.sortedOrder * d.step;});

	d3.selectAll("#xColorLegend").data(this.currentlyViewedData).transition().duration(2000)
		.attr("x", function(d) { return d.xStart + (d.step / 2) + d.sortedOrder * d.step;});

	d3.selectAll("#xDataLabel").data(this.currentlyViewedData).transition().duration(2000)
		.style("opacity", 1)
		.attr("x", function(d) { return d.xStart + (d.step / 2) + d.sortedOrder * d.step;})
		.attr("transform", function(d) { 
			var yOffset = 20;
			if(graph.timeView)
				yOffset = 50;	
			var newX = (d.xStart +  + (d.step / 2) + d.sortedOrder * d.step);
			d.xPos = newX
			return "rotate(-45 " + d.xPos + "," + (d.yBot + yOffset) + ")" ;});

}
	
//assigns the data that will be currently displayed
graphObject.prototype.setData = function(dataObject){
	//removing previous svg elements
	this.destroyAll();

	this.data = dataObject;
	this.xLen = Object.size(this.data);
	for (i in this.data){
		this.daysInMonth = this.data[i]["dayBins"].length;
		break;
	}

	//allocating space for the new x-axis values
	this.currentlyViewedData = new Array(this.xLen);
	if(this.yAttr == false){
		this.yAttr = "totalTasks"
	}
	this.setYAttr(this.yAttr, this.draw);
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
	if(this.timeView == false){
		this.drawBars();
		this.drawPopupsBar();
		this.drawXTicksBar();
	}
	else{
		this.drawLinePlot();
	//	this.drawPopupTime();
		this.drawXTicksTime();
		this.shiftXTicksToLegend();
		this.drawXColorLegend();
	}

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
graphObject.prototype.drawBars = function(){
	 this.bars = this.svgPointer.selectAll("Bars")
		.data(this.currentlyViewedData)
		.enter()
		.append("rect")	
		.attr("id", "bar")
		.style("fill", function(d) { 
			if(graph.xAttr == "computers")
				return d.Qcolor
			else
				return d.color})
		.style("stroke", function(d) {
			
			if(graph.xAttr == "computers")
				return d.Qcolor
			else
				return d.color})
		.style("stroke-width", 0)
		.attr({
			x: function(d) { 
				d.svgBar = this;
				return d.xPos - (d.width / 2);},
			y: function(d) {return d.yTop;},
			height: function(d){ return d.yBot - d.yTop}, 
			width: this.barWidth 
		})
		.on("mouseover", this.mouseOver)
		.on("mouseout", this.mouseOut);
}

//Creates the lines for each computer or user in the time view
graphObject.prototype.drawLinePlot = function(){
	this.linePlot = this.svgPointer.selectAll("linePlot")
		.data(this.currentlyViewedData)
		.enter()
		.append("path")
		.attr("id", "linePlot")
		.style("fill", "none")
		.style("stroke", function(d) {
			d.svgLinePlot = this;
			if(graph.xAttr == "computers")
				return d.Qcolor
			else
				return d.color})
		.style("stroke-width", 2)
		.attr("d", function(d) {
			//formatting a proper svg path string from the preprocessed data
			var lineString = "M " + d["timeSeries"][0]["xPos"] + " " + d["timeSeries"][0]["yPos"];
			for (var k = 1; k < d["timeSeries"].length; k++){
				lineString += "L " + d["timeSeries"][k]["xPos"] + " " + d["timeSeries"][k]["yPos"];
			}
			return lineString;	
		});
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
		.text(this.titleY + " by " + this.titleX + " in " + monthMap[this.currMonth]);
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
	if(this.timeView == false){
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
	else{
		this.xAxisLabel = this.svgPointer.append("text")
			.style("fill", "black")
			.style("font-weight", "bold")
			.style("font-size", 30)
			.attr("text-anchor", "middle")
			.attr({
				x: this.x  + this.width / 2,
				y: svgHeight - 10 
			})
			.text("Day of " + monthMap[this.currMonth]);
	}
	
	//Draw the color legend for the Queues
	var QCount = 0	
	for(i in this.allQueues){
		this.svgPointer.append("text")
			.attr("id", "QLegend")
			.attr("opacity", function(d) { 
				if (graph.xAttr == "computers")
					return 1;
				else
					return 0;})
			.attr("fill", this.queueColorScale(this.allQueues[i]))
			.attr("font-size", 24)
			.attr("x", this.width + this.x)
			.attr("y", 100 + 30*QCount)
			.text(i);
		QCount++;
	}

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
graphObject.prototype.drawPopupsBar = function(){
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
			x: function(d){ d.svgPopup = this; return d.xPos;},
			y: function(d){ return d.yTop - 10;}
		})
		.text(function(d){ return d.value});

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
		.data(this.currentlyViewedData)
		.enter()
		.append("line")
		.attr({
			x1: function(d, i) { return d.xPos},
			y1: this.y,
			x2: function(d, i) { return d.xPos},
			y2: this.y + 10,
			stroke: '#000'
		});
}

//Creates a label for each value or category on the x-axis.
graphObject.prototype.drawXLabels = function(){
	 this.xTickLabels = this.svgPointer.selectAll("xDataLabel")
		.data(this.currentlyViewedData)
		.enter()
		.append("text")
		.attr("id", "xDataLabel")
		.attr("text-anchor", "end")
		.style("opacity", 1)
		.attr("transform", function(d) { 
			d.svgLabel = this; 
			return "rotate(-45 " + d.xPos + "," + (d.yBot + 20) + ")"})
		.style("fill", "black")
		.attr({
			x: function(d) { return d.xPos},
			y: this.y + 20,
		})
		.text(function(d) { return d.name})
		.on("mouseover", this.mouseOver)
		.on("mouseout", this.mouseOut);
}

//Handles the transition between the barview and timeview by shifting all of the labels drawn by graphObject.drawXLabels() down to make room for color legends.
graphObject.prototype.shiftXTicksToLegend = function() {
	d3.selectAll("#xDataLabel").transition()
		.attr("y", function(d) { return graph.y + 50})
		.attr("transform", function(d) { return "rotate(-45 " + d.xPos + "," + (graph.y + 50) + ")"});
}

//Draws a color legend for each computer / user in the time view.
graphObject.prototype.drawXColorLegend = function(){
	this.xColorLegend = this.svgPointer.selectAll("xColorLegend")
		.data(this.currentlyViewedData)
		.enter()
		.append("rect")
		.attr("id", "xColorLegend")
		.attr("width", function(d) { return d.step - 2 })
		.attr("height", 10)
		.attr("x", function(d) { return d.xPos - ((d.step - 2) / 2);})
		.attr("y", graph.y + 30)
		.style("fill", function(d) {
			if (graph.xAttr == "computers")
				return d.Qcolor;
			return d.color;
			})
		.on("mouseover", this.mouseOver)
		.on("mouseout", this.mouseOut);
}

//draws tick marks for the time view, as the x axis now represents time instead of categorical users / computers
graphObject.prototype.drawXTicksTime = function() {

	//Drawing the tick marks and labels for the x axis
	 this.xTickMarks = this.svgPointer.selectAll("xTickMarks")
		.data(this.firstTimeData)
		.enter()
		.append("line")
		.attr({
			x1: function(d, i) { return d.xPos},
			y1: this.y,
			x2: function(d, i) { return d.xPos},
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
//			return "rotate(-45 " + d.xPos + "," + (graph.y + 20) + ")"})
		.style("fill", "black")
		.attr({
			x: function(d) { return d.xPos},
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
		if(graph.timeView){
			d3.select(d.svgLinePlot).moveToFront().transition().style("stroke-width", 6).style("stroke", "black");
		}
		else{
			d3.select(d.svgPopup).transition().style("opacity", 1);
			d3.select(d.svgBar).transition().style("stroke-width", 8);
		}
		d3.select(d.svgLabel).transition().style("font-weight", "bold").style("font-size", 22);
	}
	return elementMouseOver;
}

//Closure handling mouse out that reverts effects of the mouse-over closure
function elementMouseOutClosure(){
	var elementMouseOut = function(d, i){
		if(graph.timeView){
			d3.select(d.svgLinePlot).transition().style("stroke-width", 2).style("stroke", function(d){
			if (graph.xAttr == "computers")
				return d.Qcolor;
			return d.color;
			});
		}
		else{
			d3.select(d.svgPopup).transition().style("opacity", 0);
			d3.select(d.svgBar).transition().style("stroke-width", 0);
		}
		d3.select(d.svgLabel).transition().style("font-weight", "normal").style("font-size", 16);
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
