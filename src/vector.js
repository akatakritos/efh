var Vector = function(options) {
	//defaults
	this.magnitude = 0;
	this.direction = 0;

	merge(this, options);
};

Vector.prototype.toString = function() {
	return "Vector: " + this.magnitude.toFixed(2) + " @ " + (180*this.direction/Math.PI).toFixed(2);
};

Vector.prototype.add = function( that ) {
	if (that.magnitude === 0) {
		return new Vector({
			magnitude: this.magnitude,
			direction: this.direction
		});
	}
	var x = this.xComponent() + that.xComponent();
	var y = this.yComponent() + that.yComponent();

	var dir = Math.atan2(y, x);
	var magnitude = Math.sqrt((x * x) + (y * y));
	return new Vector({
		magnitude: magnitude,
		direction : dir
	}).standardize();
};

Vector.prototype.mult = function (scalar) {
	return new Vector({
		magnitude: this.magnitude * scalar,
		direction: this.direction
	}).standardize();
};

Vector.prototype.xComponent = function() {
	return this.magnitude * Math.cos( this.direction );
};

Vector.prototype.yComponent = function() {
	return this.magnitude * Math.sin( this.direction );
};

Vector.ZERO = new Vector({magnitude: 0, direction: 0});

Vector.prototype.standardize = function() {
	var direction = this.direction;
	var magnitude = this.magnitude;

	//standardize magnitude to be positive
	if( magnitude < 0 ) {
		magnitude = Math.abs( magnitude );
		direction += Math.PI;
	}

	//normalize direction to between 0 and 2pi
	var delta = direction < 0 ? 2*Math.PI : (-2*Math.PI);
	while (direction < 0 || direction > 2*Math.PI) {
		direction += delta;
	}

	var result = new Vector({magnitude: magnitude, direction:direction});
	result.nonstandard = this;
	return result;
};

EFH.Vector = Vector;