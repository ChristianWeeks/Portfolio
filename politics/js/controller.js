var svgWidth = 900;
var svgHeight = 700;
var xPadding = 150;
var yPadding = 150;
var chartWidth = svgWidth - xPadding; 
var chartHeight = svgHeight - yPadding; 
var MAIN_GRAPH = null;
d3.select("#sideBar1").style("height", (svgHeight/2) + "px");
var svg = d3.select("#selfChart").append("svg")
	.style("height", svgHeight)
	.style("width", "100%")
	.attr("id", "mainCanvas")
	.attr("viewBox", "0 0 " + svgWidth + " " + svgHeight)
	.attr("preserveAspectRatio", "xMidYMid");

function configureData(data){
	var graphData = new Array(data.length);
	for(var i = 0; i < data.length; i++){
		graphData[i] = {
			datum: data[i],
			name: data[i].memberName,
			id: data[i].party,
			x: Math.random(), 
			y: data[i].speechPos,
			r: Math.random(), 
			shape: "circle",
		};
	}
	return graphData;
}

function main(){
	"use strict";
	d3.csv("data/EstimatesSenate113.csv", function(d){
		return {
			memberName: d.membername,
			speaker: d.speaker,
			lastName: d.lastname,
			state: d.state,
			party: d.party,
			memberID: +d.memberID,
			speechPos: +d.thetaest,
			thetaCilb: +d.thetacilb,
			thetaCiub: +d.thetaciub	
			};
		},
		function(error, senateData){
			if(error)
				console.error(error);

			var graphData = configureData(senateData);
			MAIN_GRAPH = new graphObject(xPadding * 2 / 3, svgHeight-(yPadding / 2) - 30, svgWidth - xPadding, svgHeight-yPadding, svg);
			MAIN_GRAPH.setTitleY("Speech Position");
			MAIN_GRAPH.setTitleX("Vote Position");
			MAIN_GRAPH.setData(graphData);

	
		});
}
	

d3.selection.prototype.moveToFront = function() {
	return this.each(function(){
		this.parentNode.appendChild(this);
	});
};
main();
