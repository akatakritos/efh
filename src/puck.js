	var Puck = function(x, y) {
		this.charge = new EFH.PointCharge({x: x, y: y, charge: 1});
		this.velocity = EFH.Vector.ZERO;
		this.shape = new Kinetic.Circle({
			x : x,
			y : y,
			radius: 20,
			fill: 'black'
		});
	};

	Puck.prototype.moveTo = function(x, y) {
		this.charge.x = x;
		this.charge.y = y;
		this.shape.setPosition(x, y);
	};
