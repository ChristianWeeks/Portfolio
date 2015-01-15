d3.selection.prototype.moveToFront = function() {
	return this.each(function(){
		this.parentNode.appendChild(this);
	});
};

//Generic class for the many buttons in the visualization.  They all differ by their functionality, which is
//determined by clickObj, the method that is executed when the user clicks on the button
buttonWidget = function(x, y, boxWidth, boxHeight, label, clickObj, svgObject, fontSize){
	//very light blue
	var fillColor = '#BBF'
	//slightly darker blue on the edges and text
	var strokeColor = '#99F'

	var activeFill = '#F7F';
	var activeStroke = '#F5F';
	var labelPadding = 5
	
	//isActive keeps track of if the button's clickObj is currently active.  Used to show the user what is currently in effect
	
	isActive = false;
	function setIsActive(bool){
		isActive = false;
	}
	
	var currFill = fillColor;
	var currStroke = strokeColor;

	//button label
	this.label = svgObject.append("text")
		.attr("x", x + boxWidth / 2)
		.attr("y", y + boxHeight / 2)
		.attr("text-anchor", "middle")
		.attr("alignment-baseline", "middle")
		.style("font-size", fontSize)
		.style("fill", "#22F")
		.text(label);
	
	//Bounding box over the text
	this.boundingRectangle = svgObject.append("rect")
		.attr("x", x)
		.attr("y", y)
		.attr("width", boxWidth)
		.attr("height", boxHeight)
		.style("fill-opacity", .6)
		.style("stroke-opacity", .6)
		.style("fill", currFill)
		.style("stroke", currFill)
		.style("stroke-width", 4)
		.on("click", clickObj)
		.on("mouseover", function(d){ 
			d3.select(this).style("stroke-opacity", 1)
				.style("stroke-width", 5)
				.style("stroke", '#F99')
				.style("fill", '#FBB');})
		.on("mouseout", function(d){ 
			d3.select(this).style("stroke-opacity", .6)
				.style("stroke-width", 4)
				.style("fill", currFill)
				.style("stroke", currStroke);})
/*		.on("click", function(d){
			isActive = !isActive;
			if(isActive){
				currFill = activeFill;
				currStroke = activeStroke;
			}
			else{
				currFill = fillColor;
				currStroke= strokeColor;
			}
			d3.select(this).style("fill", currFill)
				.style("stroke", currStroke);
			for(var i = 0; i < monthButtons.length; i++){
			//	monthButtons[i].isActive = false;
			//	d3.select(monthButtons[i].boundingRectangle).style("fill", fillColor).style("stroke", strokeColor);
			}
			//clickObj();
		});*/

		

}


graphByUser = function(){
	graph.setTitleX("User");
	graph.setXAttr("Users");
	graph.setData(userDataObj);
}

graphByComputer = function(){
	graph.setTitleX("Machine");
	graph.setXAttr("computers");
	graph.setData(computerDataObj);
}

sortByValue = function(){
	graph.sortBy("value");
	graph.sortAnim();
}
sortByName= function(){
	graph.sortBy("name");
	graph.sortAnim();
}


activateTimeView = function(){
	
	graph.timeView = !graph.timeView
	graph.setYAttr(graph.yAttr);
}

function setGraphAttr(attrData){
	var setGraphAttrClosure = function(){
		graph.setTitleY(attrData["attrStr"]);
		graph.setYAttr(attrData["attr"], graph.draw);
	}
	return setGraphAttrClosure;
}

function readMonthJson(month){
	var readMonthJsonClosure = function(){
		readDataByMonth(month);
	}
	return readMonthJsonClosure;
}


