"use strict";
//Generic class for the many buttons in the visualization.  They all differ by their functionality, which is
//determined by clickObj, the method that is executed when the user clicks on the button
var buttonWidget = function(x, y, boxWidth, boxHeight, label, clickObj, svgObject, fontSize, id, name){	
	var labelPadding = 5
	
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
//			if(getKeyByValue(name, ACTIVE_OPTIONS)){
//				d3.select(this).attr("class", "button active");
//			}
//			else
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



