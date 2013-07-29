var DragCharge = function(x, y, chargeValue) {
	var self = this;
	var charge = new EFH.PointCharge({x:x, y:y, charge: chargeValue});
	var shape = new Kinetic.Circle({
		x: x,
		y: y,
		radius: 20,
		stroke: 'black',
		fill: chargeValue >= 0 ? 'red' : 'blue',
		strokeWidth: 1,
		draggable: true,
		name: "draggablepoint"
	});

	shape.on("dragend", function() {
		charge.x = this.getX();
		charge.y = this.getY();

		if ( typeof(self.onDragEnd) === 'function' ) {
			self.onDragEnd();
		}
	});

	shape.on("mousedown touchstart", function() {
		shape.moveToTop();
	});

	this.charge = charge;
	this.shape = shape;
};