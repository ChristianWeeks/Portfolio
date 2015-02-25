"use strict";

function main(){
	var mainWidth = 900;
	var mainHeight = 700;
	var topBarHeight = 80;
	var xPadding = 150;
	var yPadding = 150;
	var chartWidth = mainWidth - xPadding; 
	var chartHeight = mainHeight - yPadding; 
	var MAIN_GRAPH = null;
	var yearButtons = new Array(10);
	
	//dynamically resizing the side bar.
	d3.select("#sideBar1").style("height", (mainHeight/2) + "px");
	
	//This is our primary SVG that will hold the graph
	var mainSvg = d3.select("#selfChart").append("svg")
		.style("height", mainHeight)
		.style("width", "100%")
		.style("height", "100%")
		.attr("id", "mainCanvas")
		.attr("viewBox", "0 0 " + mainWidth + " " + mainHeight)
		.attr("preserveAspectRatio", "xMidYMid");

	//top bar contains buttons for loading different years of data and will contain later features
	var topBar = d3.select("#topButtonsBar").append("svg")
		.style("height", topBarHeight)
		.style("width", "100%")
		.attr("id", "topBar")
		.attr("viewBox", "0 0 " + mainWidth + " " + topBarHeight)
		.attr("preserveAspectRatio", "xMidYMid");

	//Creates the year filter buttons for the top bar
	//Configure the senator data into a format that can be properly bounded to and represented by the graph
	function configureData(data){
		var graphData = new Array(data.length);
		for(var i = 0; i < data.length; i++){
			graphData[i] = {
				//store all of the imported datum for display purposes
				datum: data[i],
				//store data directly relevant to the graph in the first level
				name: data[i].name,
				id: data[i].party,
				//temporary random() while votePos is being calculated for all years
				x: data[i].votePos ? data[i].votePos : Math.random()*6 - 3, 
				y: data[i].speechPos,
				r: 5, 
				shape: "circle",
			};
		}
		//sort array to get vote ranking / percentage
		graphData.sort(function(a, b){return a.x > b.x});
		for(var i = 0; i < graphData.length; i++){
			console.log(graphData[i].name);
			graphData[i].votePercent = i / graphData.length;
		}
		console.log("BLAA:HFOWEIAHFW:F");
		//sort for speech ranking / percentage
		graphData.sort(function(a, b){return a.y > b.y});
		for(var i = 0; i < graphData.length; i++){
			console.log(graphData[i].name);
	//		console.log(graphData[i].y);
			graphData[i].speechPercent = i / graphData.length;
			graphData[i].speechVoteDelta = Math.abs(graphData[i].x - graphData[i].y);
		}
		return graphData;
	}

	//read in the data from a single year.  Even though this is in the "main()" namespace, it is effectively our MAIN function
	function readDataCSV(year){
		var fileName = !year ? "data/Wordshoal_and_RC_positions.csv" : "data/EstimatesSenate1"+year+".csv";
		d3.csv(fileName, function(d){
			return {
				//NOTE: The original CSV file headers contain periods in them (e.g., theta.est).
				name: d.name ? d.name : d["member.name"],
				speaker: d.speaker,
				state: d.state,
				party: d.party,
				votePos: +d["ideal.est"],
				speechPos: +d["theta.est"],
			//	thetaCilb: +d.thetacilb,
			//	thetaCiub: +d.thetaciub	
				};
			},
			function(error, senateData){

				if(error) console.error(error);

				var graphData = configureData(senateData);
				//generate the graph if this is the first call.  Else, just redraw the points
				if(!MAIN_GRAPH){
					MAIN_GRAPH = new graphObject(xPadding * 2 / 3, mainHeight-(yPadding / 2) - 30, mainWidth - xPadding, mainHeight-yPadding, mainSvg);
					MAIN_GRAPH.setTitleY("Speech Position");
					MAIN_GRAPH.setTitleX("Vote Position");
				}
				//remove all of the previous svgs when loading a new year
				else
					MAIN_GRAPH.destroyAll();	
				MAIN_GRAPH.setData(graphData);	
			});
	}

	//draws the timeline at the top.
	function createYearButtons(){
		var yearButtonData = new Array(10);
		var i = 0;
		for(var year = 4; year< 14; i++, year++){
			yearButtonData[i] = {"year": "2" + pad(year, 3), "val": ""+pad(year,2), "id": i};
		}
		timeline(yearButtonData, 0, 60, topBar, readYearCSV());
	}
	
	//closure that returns an individual function for each button on the timeline, so that year's click feature loads the proper data
	function readYearCSV(){
		var readYearCSVClosure = function(d, i){
			readDataCSV(d.val);
		}
		return readYearCSVClosure;
	}
	createYearButtons();
	readDataCSV();
}
main();
