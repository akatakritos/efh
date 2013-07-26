(function(window){
	var EFH = window.EFH || {}; //namespace

	var K = 500000; //force constant

	var Vector = function(options) {
		//defaults
		this.magnitude = 0;
		this.direction = 0;

		EFH.Utils.merge(this, options);
	};

	Vector.prototype.toString = function() {
		return "Vector: " + this.magnitude + " @ " + this.direction;
	};

	Vector.prototype.add = function( that ) {
		if (that.magnitude == 0) {
			return new Vector({
				magnitude: this.magnitude,
				direction: this.direction
			});
		}
		var x = this.magnitude * Math.cos(this.direction) + that.magnitude * Math.cos(that.direction);
		var y = this.magnitude * Math.sin(this.direction) + that.magnitude * Math.sin(that.direction);

		var direction = Math.atan(y / x);
		var magnitude = Math.sqrt(x * x + y * y);
		return new Vector({
			magnitude: magnitude,
			direction : direction
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

		return new Vector({magnitude: magnitude, direction:direction});
	};

	var PointCharge = function(options) {

		this.x = 0;
		this.y = 0;
		this.charge = 1;

		EFH.Utils.merge(this, options);
	};

	var Physics = {};
	Physics.calcForce = function(onObj, pointCharges) {
		if (pointCharges.length === 0) {
			return Vector.ZERO;
		}
		var force = new Vector();
		return pointCharges.map(function( pointCharge ){
			var dx = pointCharge.x - onObj.x;
			var dy = pointCharge.y - onObj.y;
			var r  = Math.sqrt(dx*dx + dy*dy);

			var dir = Math.atan(dy / dx);

			var magnitude = K * onObj.charge * pointCharge.charge / (r * r);
			if (magnitude < 0) {
				magnitude = Math.abs(magnitude);
				dir += Math.PI;
			}

			if ( magnitude == Number.POSITIVE_INFINITY) {
				magnitude = Number.MAX_VALUE;
			}

			return new Vector({magnitude: magnitude, direction: dir});

		}).reduce(function(accumulator, v, i, arr) {
			return accumulator.add(v);
		}, force);
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