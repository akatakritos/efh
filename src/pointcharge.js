var PointCharge = function(options) {

	this.x = 0;
	this.y = 0;
	this.charge = 1;

	merge(this, options);
};

PointCharge.prototype.calcForceAgainst = function(otherCharge) {
	var dx = otherCharge.x - this.x;
	var dy = otherCharge.y - this.y;
	var r  = Math.sqrt(dx*dx + dy*dy);

	var dir = Math.atan2(dy, dx);

	var magnitude = K * this.charge * otherCharge.charge / (r * r);

	if ( magnitude == Number.POSITIVE_INFINITY) {
		magnitude = Number.MAX_VALUE;
	}

	return new Vector({magnitude: magnitude, direction: dir}).standardize();
};
