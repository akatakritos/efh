	
	var Physics = {};

	

	Physics.calcPosition = function(p, v, a, t) {
		return {
			x : p.x + (v.xComponent() * t + a.xComponent() * (t*t)),
			y : p.y + (v.yComponent() * t + a.yComponent() * (t*t))
		};
	};

	Physics.calcVelocity = function(v, a, t) {
		return v.add( a.mult(t) );
	};

	EFH.Physics = Physics;
