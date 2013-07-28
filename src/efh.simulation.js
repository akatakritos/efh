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

		this.charge = charge;
		this.shape = shape;
	};

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
	}

	var Simulation = function(options) {
		this.charges = [];
		this.stage = null;
		this.layer = null;
		this.anim = null;
		this.puck = null;
		this.goal = null;
		this.txt = null;

		this.options = {
			container : "efh-simulation",
			width : 100,
			height: 100,
			initialPositives : 3,
			initialNegatives : 3
		};

		merge(this.options, options);

		this.options.puck = {
			x : 0,
			y: 0
		};

		merge(this.options.puck, options.puck);

		this.options.playingField = {
			x : 100,
			y : 0,
			width: this.options.width-100,
			height: this.options.height
		};
		merge(this.options.playingField, options.playingField);

		this.init();
	};

	Simulation.prototype.debug = function(text) {
		this.txt.setText(text);
	};

	Simulation.prototype.tick = function(frame) {
		var ts = frame.timeDiff / 1000;
		if (ts == 0) {
			return;
		}
		var puck = this.puck;
		var force = EFH.Physics.calcForce(puck.charge, this.charges);
		var newPosition = EFH.Physics.calcPosition(puck.charge, puck.velocity, force, ts);
		puck.velocity = EFH.Physics.calcVelocity(puck.velocity, force, ts);

		puck.moveTo(newPosition.x, newPosition.y);

		if (this.isOffScreen()) {
			this.stop();
		}

		var shape = this.isCollision();
		if (shape !== false) {
			console.log(shape);
			this.stop();
			if (shape == this.goal) {
				alert("You win!");
			}
		}

		this.debug("FPS: " + frame.frameRate + "\nForce: " + force.toString() + "\nPosition: (" + newPosition.x.toFixed(2) + "," + newPosition.y.toFixed(2) + ")");
	};

	Simulation.prototype.isCollision = function() {
		var pointsToCheck = 8;
		var angle = 0;
		var r = this.puck.shape.getRadius() + 1; //plus buffer so it doesnt collide with itself
		var cx = this.puck.shape.getX();
		var cy = this.puck.shape.getY();
		for ( var i = 0; i < pointsToCheck; i++) {
			var x = cx + r * Math.cos(angle);
			var y = cy + r * Math.sin(angle);
			var obj = this.stage.getIntersection(x, y);

			if (obj && obj.shape && obj.shape !== this.puck.shape) {
				return obj.shape;
			}

			angle += (2*Math.PI) / pointsToCheck;
		}

		return false;
	};

	Simulation.prototype.isOffScreen = function(x, y) {
		if (typeof x === 'undefined') {
			x = this.puck.shape.getX(), y = this.puck.shape.getY();
		}
		return (x > this.options.playingField.x + this.options.playingField.width) ||
			(x < this.options.playingField.x) ||
			(y > this.options.playingField.y + this.options.playingField.heightt) ||
			(y < this.options.playingField.y);
	};

	Simulation.prototype.init = function() {
		this.stage = new Kinetic.Stage( {
			width: this.options.width,
			height: this.options.height,
			container: this.options.container
		});
		this.layer = new Kinetic.Layer();
		this.stage.add(this.layer);
		var self = this;

		this.anim = new Kinetic.Animation(function(frame) {
			self.tick( frame );
		}, this.layer);

		this.puck = new Puck(this.options.puck.x, this.options.puck.y);
		this.layer.add(this.puck.shape);

		this.goal = new Kinetic.Rect({
			x: this.options.playingField.x + this.options.playingField.width - 25,
			y: this.options.playingField.y + this.options.playingField.height / 2 - 50,
			width: 25,
			height: 100,
			fill: 'green'
		});

		this.txt = new Kinetic.Text({
			x: this.stage.getWidth() - 200,
			y: 15,
			text: '',
			fontSize: 10,
			fontFamily: 'Calibri',
			fill: 'green'
		});

		// var border = new Kinetic.Rect({
		// 	x: this.options.playingField.x,
		// 	y : this.options.playingField.y,
		// 	width: this.options.playingField.width,
		// 	height: this.options.playingField.height,
		// 	fill: null,
		// 	stroke: 'black',
		// 	strokeWidth: 2
		// });
		var bx = this.options.playingField.x,
			by = this.options.playingField.y,
			bw = this.options.playingField.width,
			bh = this.options.playingField.height;
		var border = new Kinetic.Line({
			points: [bx, by, bx + bw, by, bx + bw, by + bh, bx, by + bh, bx, by],
			stroke: 'black',
			strokeWidth: 2
		});

		this.addInitialCharges();

		this.layer.add( border );
		this.layer.add( this.txt );
		this.layer.add( this.goal );
		this.layer.draw();
	};

	Simulation.prototype.addInitialCharges = function() {
		var x = 25, y = 25
		for (var i = 0; i < this.options.initialPositives; i++) {
			this.addCharge(x, y, 1);
			y+=20;
		}

		for (var i = 0; i < this.options.initialNegatives; i++) {
			this.addCharge(x, y, -1);
			y+=20;
		}
	}

	Simulation.prototype.start = function() {
		this.anim.start();
	};

	Simulation.prototype.stop = function() {
		this.anim.stop();
	};

	Simulation.prototype.toggle = function() {
		this.anim.isRunning() ? this.anim.stop() : this.anim.start();
	};

	Simulation.prototype.addCharge = function(x, y, charge) {
		var dragCharge = new DragCharge(x, y, charge);
		//this.charges.push(dragCharge.charge);
		this.layer.add(dragCharge.shape);
		this.layer.draw();

		var self = this;
		dragCharge.onDragEnd = function() {
			if (! self.isOffScreen(this.shape.getX(), this.shape.getY())) {
				self.addToPlayingField(this);
			}
		}
	};

	Simulation.prototype.addToPlayingField = function(dragCharge) {
		this.charges.push(dragCharge.charge);
	};

	Simulation.prototype.reset = function() {
		this.puck.moveTo(this.options.puck.x, this.options.puck.y);
		this.puck.velocity = EFH.Vector.ZERO;
		this.layer.draw();
	}

	EFH.Simulation = Simulation;