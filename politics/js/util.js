//Random utility functions

//Moves an svg object to the front so it is not occluded by other svg items
d3.selection.prototype.moveToFront = function() {
	return this.each(function(){
		this.parentNode.appendChild(this);
	});
};

//Padding function taken from StackOverflow question 10073699
function pad(n, width, z) {
	z = z || '0';
	n = n + '';
	return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}
