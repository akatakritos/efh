var Game = function( options ) {
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

Game.prototype.init = function( mapSource ) {
	var self = this;
	Level.load( mapSource, function(map) {

		self.stage = new Kinetic.Stage( {
			width: map.width + 100,
			height: map.height,
			container: self.options.container
		});
		self.layer = new Kinetic.Layer();
		self.stage.add(self.layer);

		self.puck = new Puck(100+map.puckPosition.x, map.puckPosition.y);

		
		self.anim = self.createAnimation();

		
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

Game.prototype.debug = function(text) {
	this.txt.setText(text);
};

Game.prototype.isCollision = function(x, y, radius) {
	var pointsToCheck = 8;
	var angle = 0;
	var r = radius + 1; //plus buffer so it doesnt collide with itself
	var cx = x;
	var cy = y;
	for ( var i = 0; i < pointsToCheck; i++) {
		var px = cx + r * Math.cos(angle);
		var py = cy + r * Math.sin(angle);
		var obj = this.stage.getIntersection(px, py);

		if (obj && obj.shape && obj.shape !== this.puck.shape) {
			return obj.shape;
		}

		angle += (2*Math.PI) / pointsToCheck;
	}

	return false;
};

Game.prototype.checkState = function( state, frame ) {
	var object = this.isCollision(state.position.x, state.position.y, this.puck.getRadius());
	if ( object ) {
		this.render( state, frame.frameRate );
		this.handleCollision( object );
		return;
	}

	if (this.isOffScreen(state.position.x, state.position.y)) {
		handleCollision( "screen" );
	}
};

Game.prototype.isOffScreen = function(x, y) {
	if (typeof x === 'undefined') {
		x = this.puck.getX();
		y = this.puck.getY();
	}
	return (x > 100 + this.map.width) ||
		(x < 100) ||
		(y > this.map.height) ||
		(y < 0);
};

Game.prototype.createAnimation = function() {
	var self = this;
	var currentState = {
		position: {x: self.puck.getX(), y: self.puck.getY() },
		velocity: self.puck.velocity,
		acceleration: EFH.Vector.ZERO,
		charge : self.puck.charge
	};

	var simulation = new EFH.Simulation( currentState, function( state, frame ) {
		self.checkState( state, frame );
	});

	var a =  new Kinetic.Animation(function(frame) {
		if (frame.timeDiff === 0){
			return;
		}
		var state = simulation.handleFrameRequest( frame );

		//render!
		self.render( state, frame.frameRate );

	}, self.layer);
	a.simulation = simulation;

	return a;
};

Game.prototype.render = function( state, fps ) {
	this.puck.velocity = state.velocity;
	this.puck.moveTo( state.position.x, state.position.y );
	this.debug("FPS: " + fps);
};

Game.prototype.handleCollision = function( shape ) {
	this.stop();
	if (shape !== false) {
		console.log(shape);
		if (shape == this.goal) {
			alert("You win!");
		}
	}
};

Game.prototype.addInitialCharges = function( initialCharges ) {
	var x = 25, y = 25;
	for (var i = 0; i < initialCharges.length; i++) {
		this.addCharge(x, y, initialCharges[i]);
		y+=20;
	}
};

Game.prototype.start = function() {
	this.anim.start();
};

Game.prototype.stop = function() {
	this.anim.stop();
};

Game.prototype.toggle = function() {
	if(this.anim.isRunning()) {
		this.anim.stop();
	} else {
		this.anim.start();
	}
};

Game.prototype.addCharge = function(x, y, charge) {
	var dragCharge = new DragCharge(x, y, charge);
	//this.charges.push(dragCharge.charge);
	this.layer.add(dragCharge.shape);
	this.layer.draw();

	var self = this;
	dragCharge.onDragEnd = function() {
		if (! self.isOffScreen(this.getX(), this.getY())) {
			self.anim.simulation.addToPlayingField(this.charge);
		} else {
			self.anim.simulation.removeFromPlayingField(this.charge);
		}
	};
};

Game.prototype.reset = function() {
	this.puck.moveTo(100 + this.map.puckPosition.x, this.map.puckPosition.y);
	this.puck.velocity = EFH.Vector.ZERO;
	this.layer.draw();
	this.anim.simulation.reset();
};

Game.prototype.serialize = function() {
	return this.stage.toJSON();
};

EFH.Game = Game;