d3.selection.prototype.moveToFront = function() {
	return this.each(function(){
		this.parentNode.appendChild(this);
	});
};

//Generic class for the many buttons in the visualization.  They all differ by their functionality, which is
//determined by clickObj, the method that is executed when the user clicks on the button
buttonWidget = function(x, y, boxWidth, boxHeight, label, clickObj, svgObject, fontSize, id, name){
	
	var labelPadding = 5
	
	//isActive keeps track of if the button's clickObj is currently active.  Used to show the user what is currently in effect	
	isActive = false;
	function setIsActive(bool){
		isActive = false;
	}
	

	//button label
	this.label = svgObject.append("text")
		.attr("x", x + boxWidth / 2)
		.attr("y", y + boxHeight / 2)
		.attr("text-anchor", "middle")
		.attr("alignment-baseline", "middle")
		.style("font-size", fontSize)
		.style("fill", "black")
		.text(label);
	
	//Bounding box over the text
	this.boundingRectangle = svgObject.append("rect")
		.attr("x", x)
		.attr("y", y)
		.attr("width", boxWidth)
		.attr("height", boxHeight)
		.attr("class", "button neutral")
		.attr("id", id)
		.attr("name", name)
		.on("click", clickObj)
		.on("mouseover", function(d){ 
			d3.select(this).attr("class", "button mouseOver")})
		.on("mouseout", function(d){ 
			if(getKeyByValue(name, ACTIVE_OPTIONS)){
				d3.select(this).attr("class", "button active");
			}
			else
				d3.select(this).attr("class", "button neutral");
		});
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
	d3.selectAll("#dataSet").attr("class", "button neutral");
	d3.selectAll("[name='users']").attr("class", "button active");
	ACTIVE_OPTIONS["dataSet"] = "users";
	graph.setTitleX("User");
	graph.setXAttr("Users");
	graph.setData(userDataObj);
}

graphByComputer = function(){
	d3.selectAll("#dataSet").attr("class", "button neutral");
	d3.selectAll("[name='computers']").attr("class", "button active");
	ACTIVE_OPTIONS["dataSet"] = "computers";
	graph.setTitleX("Machine");
	graph.setXAttr("computers");
	graph.setData(computerDataObj);
}

sortByValue = function(){	
	d3.selectAll("#sortButton").attr("class", "button neutral");
	d3.selectAll("[name='sortByVal']").attr("class", "button active");
	ACTIVE_OPTIONS["sort"] = "sortByVal";
	graph.sortBy("value");
	graph.sortAnim();
}
sortByName= function(){
	d3.selectAll("#sortButton").attr("class", "button neutral");
	d3.selectAll("[name='sortByName']").attr("class", "button active");
	ACTIVE_OPTIONS["sort"] = "sortByName";
	graph.sortBy("name");
	graph.sortAnim();
}


activateTimeView = function(){
	if(graph.timeView)
		ACTIVE_OPTIONS["timeview"] = false;
	else
		ACTIVE_OPTIONS["timeview"] = "timeview";
	graph.timeView = !graph.timeView
	graph.setYAttr(graph.yAttr);
}

function setGraphAttr(attrData){
	var setGraphAttrClosure = function(){
		d3.selectAll("#attrButton").attr("class", "button neutral");
		d3.selectAll("[name='" + attrData["attr"] + "']").attr("class", "button active");
		ACTIVE_OPTIONS["attr"] = attrData["attr"];
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


