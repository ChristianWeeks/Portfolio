//------------------------------------------------------------------------------------------------
//GLOBALS
//------------------------------------------------------------------------------------------------
var svgWidth = 1400;
var svgHeight = 900;
var yPadding = 350;
var xPadding = 300;
var graphWidth = svgWidth - xPadding;
var graphHeight = svgHeight - yPadding;
var monthButtonSize = 50
var currMonth = null;
//Creating the primary SVG canvas
var svg = d3.select("body").append("svg")
	.style("width", svgWidth)
	.style("height", svgHeight)
	.attr("viewBox", "0 0 " + svgWidth + " " + svgHeight)
	.attr("preserveAspectRatio", "xMidYMid");
//------------------------------------------------------------------------------------------------
//BUTTONS
//------------------------------------------------------------------------------------------------

//attribute buttons will make their corresponding attribute the currently graphed attribute
var attributeButtonData = [
	{"attrStr": "Total Tasks", "attr": "totalTasks"},
	{"attrStr": "Total Runtime", "attr": "totalRunTime"},
	{"attrStr": "Total Delay", "attr": "totalDelay"},
	{"attrStr": "Seconds Per Task", "attr": "secondsPerTask"},
	{"attrStr": "Delay Per Task", "attr": "delayPerTask"}
	];
var attributeButtons = new Array(attributeButtonData.length);
svg.append("text")
	.attr("x", xPadding / 2 + graphWidth + 10)
	.attr("y", yPadding - 20)
	.attr("fill", "black")
	.attr("font-size", 18)
	.text("Graph Attribute:");
for(var i = 0; i < attributeButtonData.length; i++){
	attributeButtons[i] = new buttonWidget((xPadding / 2) + graphWidth + 10, yPadding + i*40, 120, 30, attributeButtonData[i]["attrStr"], setGraphAttr(attributeButtonData[i]), svg, 16);
}

//Month Buttons will read in the log files from the corresponding month
var monthButtonData = [
	{"monthStr": "Jan", "numStr": "01"}, 
	{"monthStr": "Feb", "numStr": "02"},
	{"monthStr": "Mar", "numStr": "03"},
	{"monthStr": "Apr", "numStr": "04"}, 
	{"monthStr": "May", "numStr": "05"}, 
	{"monthStr": "Jun", "numStr": "06"}, 
	{"monthStr": "Jul", "numStr": "07"}, 
	{"monthStr": "Aug", "numStr": "08"}, 
	{"monthStr": "Sep", "numStr": "09"}, 
	{"monthStr": "Oct", "numStr": "10"} 
	];
var monthButtons = new Array(10);
for(var i = 0; i < 10; i++){
	monthButtons[i] = new buttonWidget(xPadding + 120 + 60 * i, 10, monthButtonSize, monthButtonSize, monthButtonData[i]["monthStr"], readMonthJson(monthButtonData[i]["numStr"]), svg, 24);
}


//Data Pool Buttons allow the user to switch between viewing data relative to the machines and the users
svg.append("text")
	.attr("x", xPadding / 2)
	.attr("y", 20)
	.attr("fill", "black")
	.attr("font-size", 18)
	.text("Data Pool:", svg, 24);
var displayComputers = new buttonWidget(xPadding / 2, 30, 90, 30, "Machines", graphByComputer, svg, 20);
var displayUsers = new buttonWidget(xPadding / 2, 70,  90, 30, "Users", graphByUser, svg, 20);

//Sort buttons allow the user to sort alphabetically or by the currently graphed attribute value
svg.append("text")
	.attr("x", xPadding / 2 + 150 )
	.attr("y", 20)
	.attr("fill", "black")
	.attr("font-size", 18)
	.text("Sort By:", svg, 24);
var sortByValueButton = new buttonWidget(xPadding / 2 + 150, 30, 90, 30, "Value", sortByValue, svg, 20);
var sortByAlphabetButton = new buttonWidget(xPadding / 2 + 150, 70, 90, 30, "Name", sortByName, svg, 20);

//TimeView button lets the user switch between having computers / users on the x axis, and having time on the x axis
var timeViewButton = new buttonWidget(1050, 50, 150, monthButtonSize, "TimeView", activateTimeView, svg, 24);
userData = null;
taskData = null;
computerData = null;
graph = null;

//for month strings to print in the graph
var monthMap = {
	"01" : "January",
	"02" : "February",
	"03" : "March",
	"04" : "April",
	"05" : "May",
	"06" : "June",
	"07" : "July",
	"08" : "August",
	"09" : "September",
	"10" : "October"};

function main(){
	readDataByMonth("10");
}
function readDataByMonth(month){
	//first we read in the data
	d3.json("logs/2014-"+month+"_tasks.json", function(error, taskData){
		if(error)
			console.log("Error reading task json data: " + error);
		d3.json("logs/2014-"+month+"_computers.json", function(error, computerData){
			if(error)
				console.log("Error reading computer json data: " + error);
			d3.json("logs/2014-"+month+"_users.json", function(error, userData){
				if(error)
					console.log("Error reading user json data: " + error);
				//Assigning our new data to objects so we can manipulate them
				userDataObj = userData;
				computerDataObj = computerData;
				taskdataObj = taskData;	
				//destroying all previous svg elements
				if (graph != null){
					graph.destroyAll()
				}
				graph = new graphObject(xPadding / 2, svgHeight-(yPadding / 2) - 30, svgWidth - xPadding, svgHeight-yPadding, svg);
				graph.currMonth = month
				graph.setTitleY("Total Tasks");
				graph.setTitleX("Machine");
				graph.setXAttr("computers");
				graph.setData(computerData);

				//Setting up all of the buttons

					
			})

		});

	});
}

//Utility function
Object.size = function(obj) {
	var size = 0, key;
	for (key in obj) {
		if(obj.hasOwnProperty(key)) size++;
	}
	return size;
};

d3.selection.prototype.moveToFront = function() {
	return this.each(function(){
		this.parentNode.appendChild(this);
	});
};
main();

