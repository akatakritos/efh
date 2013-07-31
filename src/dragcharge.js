var DRAGCHARGE_RADIUS = 20;
/**
 * Represents a draggable charge on the screen. Basically wraps Kinetic.Image
 * and EFH.PointCharge so that they can be kept in sync
 * @param  {Number} x           x position of DragCharge
 * @param  {Number} y           y position of DragCharge
 * @param  {Number} chargeValue Value of charge (usually 1.0)
 * @return {DragCharge}
 */
var DragCharge = function(x, y, chargeValue) {
	var self = this;
	var charge = new EFH.PointCharge({x:x, y:y, charge: chargeValue});
	var shape = new Kinetic.Image({
		x: x - DRAGCHARGE_RADIUS,
		y: y - DRAGCHARGE_RADIUS,
		image : chargeValue >= 0 ? Assets.images.positive : Assets.images.negative,
		draggable: true,
		name: "draggablepoint"
	});

	/* Tells Kinetic that the transparent pixels are not hittable */
	shape.createImageHitRegion();

	shape.on("dragend", function() {
		/**
		 * Since the PointCharge x and y are the center of the charge, but
		 * the Kinetic.Image x and y are the upper left corner, we need to
		 * translate the point
		 */
		charge.x = this.getX() + DRAGCHARGE_RADIUS;
		charge.y = this.getY() + DRAGCHARGE_RADIUS;

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

/**
 * Gets the x coordinate of the center of the charge. Use for physics and
 * not for display.
 * @return {Number} x coordinate
 */
DragCharge.prototype.getX = function() {
	return this.charge.x;
};

/**
 * Gets the y coordinate of the center of the charge. Use for physics and
 * not for display.
 * @return {Number} y coordinate
 */
DragCharge.prototype.getY = function() {
	return this.charge.y;
};

/**
 * Gets the radius of the DragCharge
 * @return {Number} Radius in pixels
 */
DragCharge.prototype.getRadius = function() {
	return DRAGCHARGE_RADIUS;
};
