	var K = 1000000; //force constant
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
