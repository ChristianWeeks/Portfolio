var svgWidth = 800;
var svgHeight = 800;
var svg = d3.select("#nvChart").append("svg")
	.style("height", svgHeight)
	.style("width", svgWidth)
	.attr("id", "mainCanvas")
	//.attr("viewBox", "0 0 " + svgWidth + " " + svgHeight)
	.attr("preserveAspectRatio", "xMidYMid");

function main(){
	console.log("HELLO!");

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
			nv.addGraph(function(){
				var chart = nv.models.scatterChart()
					.showDistX(true)
					.showDistY(true)
					.transitionDuration(200)
					.color(["Red", "Blue", "#888"]);
				chart.tooltipContent(function(key){
					console.log(key);
					return "<h3>" + key + "</h3>";
				});
				chart.xAxis.tickFormat(d3.format('.02f'));
				chart.yAxis.tickFormat(d3.format('.02f'));
				//data must be an array, can't be an associative Array / object
				var chartData = configureSenateData(senateData);

				//an error here means you didn't properly format the array.
				d3.select("#mainCanvas").datum(chartData).call(chart);

				nv.utils.windowResize(chart.update);
				return chart;
			});

		});

}

function configureSenateData(senateData){
	var partyColor;
	var datumTemp = {};
		
	var chartArray = [
		{key: "R", values: []}, 
		{key: "D", values: []},
		{key: "I", values: []}
	];
	
	var chartObj = {
		"R": [],
		"D": [],
		"I": []
	};
	for(var i = 0; i < senateData.length; i++){
		
		datumTemp = {
			datum: senateData[i],
			id: senateData[i].party,
			x: Math.random(), 
			y: senateData[i].speechPos,
			size: 20,
			r: Math.random(), 
			shape: "circle",
		};

		chartObj[senateData[i].party].push(datumTemp);	
			
	}
	chartArray[0].values = chartObj["R"];
	chartArray[1].values = chartObj["D"];
	chartArray[2].values = chartObj["I"];
	return chartArray;
}

main();
