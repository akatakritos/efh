(function(window){
	var EFH = window.EFH || {}; //namespace

	var K = 1000000; //force constant

	var Vector = function(options) {
		//defaults
		this.magnitude = 0;
		this.direction = 0;

		EFH.Utils.merge(this, options);
	};

	Vector.prototype.toString = function() {
		return "Vector: " + this.magnitude.toFixed(2) + " @ " + (180*this.direction/Math.PI).toFixed(2);
	};

	Vector.prototype.add = function( that ) {
		if (that.magnitude == 0) {
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

	var PointCharge = function(options) {

		this.x = 0;
		this.y = 0;
		this.charge = 1;

		EFH.Utils.merge(this, options);
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

	var Physics = {};
	Physics.calcForce = function(onObj, pointCharges) {
		if (pointCharges.length === 0) {
			return Vector.ZERO;
		}

		return pointCharges.map(function( pointCharge ){

			return pointCharge.calcForceAgainst( onObj );

		}).reduce(function(accumulator, v, i, arr) {
			return accumulator.add(v);
		}, Vector.ZERO).standardize();
	};

	Physics.calcPosition = function(p, v, a, t) {
		return {
			x : p.x + (v.xComponent() * t + a.xComponent() * (t*t)),
			y : p.y + (v.yComponent() * t + a.yComponent() * (t*t))
		};
	};

	Physics.calcVelocity = function(v, a, t) {
		return v.add( a.mult(t) );
	};

	EFH.Vector = Vector;
	EFH.PointCharge = PointCharge;
	EFH.Physics = Physics;
	EFH.Physics.K = K;

	if ( ! window.EFH ) {
		window.EFH = EFH;
	}
})(typeof(window) === 'undefined' ? global : window);