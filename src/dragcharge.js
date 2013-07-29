var DragCharge = function(x, y, chargeValue) {
	var self = this;
	var charge = new EFH.PointCharge({x:x, y:y, charge: chargeValue});
	var shape = new Kinetic.Image({
		x: x - 20,
		y: y - 20,
		image : chargeValue >= 0 ? this.images.positive : this.images.negative,
		draggable: true,
		name: "draggablepoint"
	});

	shape.createImageHitRegion();

	shape.on("dragend", function() {
		charge.x = this.getX() + 20;
		charge.y = this.getY() + 20;

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

DragCharge.prototype.getX = function() {
	return this.charge.x;
};

DragCharge.prototype.getY = function() {
	return this.charge.y;
};

DragCharge.prototype.getRadius = function() {
	return 20;
};

DragCharge.prototype.images = (function(){
	if (typeof Image === 'undefined') {
		return { positive: null, negative: null };
	}
	var positive = new Image();
	var negative = new Image();
	positive.src = "img/positive.png";
	negative.src = "img/negative.png";

	return {positive : positive, negative: negative};
})();
