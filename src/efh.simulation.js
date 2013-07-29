	var Simulation = function(options) {
		this.charges = [];
		this.stage = null;
		this.layer = null;
		this.anim = null;
		this.puck = null;
		self.map = null;
		this.txt = null;

		this.options = {
			container : "efh-simulation",
		};

		merge(this.options, options);

	};

	Simulation.prototype.debug = function(text) {
		this.txt.setText(text);
	};

	Simulation.prototype.tick = function(frame) {
		var ts = frame.timeDiff / 1000;
		if (ts === 0) {
			return;
		}
		var puck = this.puck;
		var force = puck.charge.calcForceFrom( this.charges );
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
		var r = this.puck.getRadius() + 1; //plus buffer so it doesnt collide with itself
		var cx = this.puck.getX();
		var cy = this.puck.getY();
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
			x = this.puck.getX();
			y = this.puck.getY();
		}
		return (x > this.map.x+100 + this.map.width) ||
			(x < this.map.x) ||
			(y > this.map.y + this.map.height) ||
			(y < this.map.y);
	};

	Simulation.prototype.init = function( mapSource ) {
		var self = this;
		Level.load( mapSource, function(map) {

			self.stage = new Kinetic.Stage( {
				width: map.width + 100,
				height: map.height,
				container: self.options.container
			});
			self.layer = new Kinetic.Layer();
			self.stage.add(self.layer);

			self.anim = new Kinetic.Animation(function(frame) {
				self.tick( frame );
			}, self.layer);

			self.puck = new Puck(100+map.puckPosition.x, map.puckPosition.y);
			self.layer.add(self.puck.shape);

			self.goal = new Kinetic.Rect({
				x: map.goal.x + 100,
				y: map.goal.y,
				width: map.goal.width,
				height: map.goal.height,
				fill: 'green'
			});

			self.txt = new Kinetic.Text({
				x: self.stage.getWidth() - 200,
				y: 15,
				text: '',
				fontSize: 10,
				fontFamily: 'Calibri',
				fill: 'green'
			});

			var bx = 100,
				by = 0,
				bw = map.width,
				bh = map.height;
			var border = new Kinetic.Line({
				points: [bx, by, bx + bw, by, bx + bw, by + bh, bx, by + bh, bx, by],
				stroke: 'black',
				strokeWidth: 2
			});

			self.addInitialCharges(map.startingCharges);

			self.layer.add( border );
			self.layer.add( self.txt );
			self.layer.add( self.goal );
			self.layer.draw();

			if (map.background.image) {
				var bg = new Kinetic.Image({
					image: map.background.image,
					x: bx, y: by,
					width: bw, height: bh
				});

				self.layer.add( bg );
				bg.moveToBottom();

				bg.createImageHitRegion(function() {
					self.layer.draw();
				});
			}

			self.map = map;
		});

		return self;
	};

	Simulation.prototype.addInitialCharges = function( initialCharges ) {
		var x = 25, y = 25;
		for (var i = 0; i < initialCharges.length; i++) {
			this.addCharge(x, y, initialCharges[i]);
			y+=20;
		}
	};

	Simulation.prototype.start = function() {
		this.anim.start();
	};

	Simulation.prototype.stop = function() {
		this.anim.stop();
	};

	Simulation.prototype.toggle = function() {
		if(this.anim.isRunning()) {
			this.anim.stop();
		} else {
			this.anim.start();
		}
	};

	Simulation.prototype.addCharge = function(x, y, charge) {
		var dragCharge = new DragCharge(x, y, charge);
		//this.charges.push(dragCharge.charge);
		this.layer.add(dragCharge.shape);
		this.layer.draw();

		var self = this;
		dragCharge.onDragEnd = function() {
			if (! self.isOffScreen(this.getX(), this.getY())) {
				self.addToPlayingField(this);
			} else {
				self.removeFromPlayingField(this);
			}
		};
	};

	Simulation.prototype.addToPlayingField = function(dragCharge) {
		this.charges.push(dragCharge.charge);
	};

	Simulation.prototype.removeFromPlayingField = function(dragCharge) {
		var index = this.charges.indexOf( dragCharge.charge );
		if ( index > -1 ) {
			this.charges.splice( index, 1 );
		}
	};

	Simulation.prototype.reset = function() {
		this.puck.moveTo(100 + this.map.puckPosition.x, this.map.puckPosition.y);
		this.puck.velocity = EFH.Vector.ZERO;
		this.layer.draw();
	};

	Simulation.prototype.serialize = function() {
		return this.stage.toJSON();
	};

	EFH.Simulation = Simulation;