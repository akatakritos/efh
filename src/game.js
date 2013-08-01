/**
 * The Electric Field Hockey game class. Handles all interactions and display
 * rendering.
 * @param  {Object}  options  options object
 * @return {Game}
 */
var Game = function( options ) {
	this.stage = null; //Kinetic.Stage - canvas where rendering takes place
	this.layer = null; //Kinetic.Layer - container for all interaction objects
	this.puckLayer = null;
	this.anim = null;  //Kinetic.Animation - animation class
	this.puck = null;  //EFH.Puck - represents the moving hockey puck
	this.map = null;   //EFH.Level - a game configuration
	this.txt = null;   //Kinetic.Text - output for debugging

	this.options = {
		container : "efh-simulation",
	};

	merge(this.options, options);
};

/**
 * Inits the Game by loading from a Level configuration
 * @param  {object}  mapSource   Level
 * @return {chain}
 */
Game.prototype.init = function( mapSource ) {
	var self = this;

	/**
	 * Load the level and its assets, and when complete, start configuring the
	 * environment
	 */
	Level.load( mapSource, function(map) {

		self.stage = new Kinetic.Stage( {
			width: map.width + 100,
			height: map.height,
			container: self.options.container
		});

		self.layer = new Kinetic.Layer();
		self.puckLayer = new Kinetic.Layer();

		self.puck = new Puck(100+map.puckPosition.x, map.puckPosition.y);
		self.puckLayer.add( self.puck.shape );

		self.goal = new Kinetic.Rect({
			x: map.goal.x + 100,
			y: map.goal.y,
			width: map.goal.width,
			height: map.goal.height,
			fill: 'green'
		});
		self.layer.add( self.goal );

		self.txt = new Kinetic.Text({
			x: self.stage.getWidth() - 200,
			y: 15,
			text: '',
			fontSize: 10,
			fontFamily: 'Calibri',
			fill: 'green'
		});
		self.layer.add( self.txt );

		var bx = 100,
			by = 0,
			bw = map.width,
			bh = map.height;
		var border = new Kinetic.Line({
			points: [bx, by, bx + bw, by, bx + bw, by + bh, bx, by + bh, bx, by],
			stroke: 'black',
			strokeWidth: 2
		});
		self.layer.add( border );

		self.addInitialCharges(map.startingCharges);

		/* Load background image */
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

		self.stage.add( self.layer );
		self.stage.add( self.puckLayer );
		self.anim = self.createAnimation();

		self.layer.draw();
		self.puckLayer.draw();
	});

	return self;
};

/**
 * Writes some debugging text to the canvas
 * @param  {String} text debugging text to write
 */
Game.prototype.debug = function(text) {
	this.txt.setText(text);
};

/**
 * Checks if a puck position and radius would cause a collision
 * 
 * @param  {Number} x      x coordinate of puck
 * @param  {Number} y      y coordinate of puck
 * @param  {Number} radius radius of puck
 * @return {Object|false}        Object that would be hit or false if no hit
 */
Game.prototype.isCollision = function(x, y, radius) {

	/**
	 * Using the x and y as the center, check a number of points around the
	 * permiter of the circle for a possible collision
	 */
	var pointsToCheck = 8; //test this many points along the perimeter
	var angle = 0;         //initial angle
	var r = radius + 0;    //plus buffer so it doesnt collide with itself
	for ( var i = 0; i < pointsToCheck; i++) {

		/* Calculate perimeter x and y */
		var px = x + r * Math.cos(angle);
		var py = y + r * Math.sin(angle);

		/* test for object occupying that point */
		var obj = this.layer.getIntersection(px, py);

		/* Make sure theres something there, that its a shape, and that it is
		 * not the puck (shouldnt report colliding with itself)
		 */
		if (obj && obj.shape && obj.shape !== this.puck.shape) {
			return obj.shape;
		}

		/* Calculate the next point along the perimeter */
		angle += (2*Math.PI) / pointsToCheck;
	}

	return false;
};

/**
 * Check the state of the simulation for indicators that the game is ended
 *
 * @param  {Object} state simulation state
 * @param  {Object} frame current frame data
 */
Game.prototype.checkState = function( state, frame ) {

	/* Test for collision with another object */
	var object = this.isCollision(state.position.x, state.position.y, this.puck.getRadius());
	if ( object ) {
		this.render( state, frame.frameRate );
		this.handleCollision( object );
		return;
	}

	/* test if object got off the screen */
	if (this.isOffScreen(state.position.x, state.position.y)) {
		this.handleCollision( "screen" );
	}
};

/**
 * Check if a point is outside the bounds of the simulation
 * @param  {Number}  x x-coordinate
 * @param  {Number}  y y-coordinate
 * @return {Boolean}   true if off screen
 */
Game.prototype.isOffScreen = function(x, y) {
	return (x > 100 + this.map.width) ||
		(x < 100) ||
		(y > this.map.height) ||
		(y < 0);
};

/**
 * Creates the Kinetic.Animation object that will control
 * the frame rate and drawing
 * @return {Kinetic.Animation}
 */
Game.prototype.createAnimation = function() {
	var self = this;
	var currentState = {
		position: {x: self.puck.getX(), y: self.puck.getY() },
		velocity: self.puck.velocity,
		acceleration: EFH.Vector.ZERO,
		charge : self.puck.charge
	};

	var simulation = new EFH.Simulation( currentState, function( state, frame ) {
		/*
		 * This callback is called for each step of the simulation, which
		 * may not be the same as each frame
		 */
		self.checkState( state, frame );
	});

	var a =  new Kinetic.Animation(function(frame) {
		if (frame.timeDiff === 0){
			return;
		}

		/*
		 * Calculate the state for right now. Doing so may involve more than one
		 * step in the simulation. Checking the state of the simulation for out
		 * of bounds, collisions, end of game, etc is done in the callback 
		 * configured for the EFH.Simulation constructor
		 */
		var state = simulation.handleFrameRequest( frame );

		self.render( state, frame.frameRate );

	}, self.layer);

	/* Attach the simulation object on so we can access it later */
	a.simulation = simulation;

	return a;
};

/**
 * Convert a simulation state into something we can move about on the screen
 * @param  {Object} state Simulation state
 * @param  {Number} fps   frames per second
 */
Game.prototype.render = function( state, fps ) {
	this.puck.velocity = state.velocity;
	this.puck.moveTo( state.position.x, state.position.y );
	this.puckLayer.draw();
	this.debug("FPS: " + fps);
};

/**
 * Handles a collision with a shape. Stops the simulation and figures out if you
 * won or not
 * @param  {Object} shape The shape with which the puck collided
 */
Game.prototype.handleCollision = function( shape ) {
	this.stop();
	if (shape !== false) {
		console.log(shape);
		if (shape == this.goal) {
			alert("You win!");
		}
	}
};

/**
 * Adds the initial charges that are available for the user to play with
 * @param  {Array} initialCharges array of charge values
 */
Game.prototype.addInitialCharges = function( initialCharges ) {
	var x = 25, y = 25;
	for (var i = 0; i < initialCharges.length; i++) {
		this.addCharge(x, y, initialCharges[i]);
		y+=20;
	}
};

/**
 * Start the animation
 */
Game.prototype.start = function() {
	this.anim.start();
};

/**
 * Stop the animation
 */
Game.prototype.stop = function() {
	this.anim.stop();
};

/**
 * Toggles the animation state
 * @return {Boolean} true if the simulation is running after the toggle
 */
Game.prototype.toggle = function() {
	if(this.anim.isRunning()) {
		this.anim.stop();
		return false;
	} else {
		this.anim.start();
		return true;
	}
};

/**
 * Adds a charge to the game
 * @param  {Number} x      x-coordinate
 * @param  {Number} y      y-coordinate
 * @param  {Number} charge charge value
 */
Game.prototype.addCharge = function(x, y, charge) {
	var dragCharge = new DragCharge(x, y, charge);
	this.layer.add(dragCharge.shape);
	this.layer.draw();

	var self = this;

	/**
	 * Set up callbacks so we can add or remove the charge from the 
	 * simulation
	 */
	dragCharge.onDragEnd = function() {
		if (! self.isOffScreen(this.getX(), this.getY())) {
			self.anim.simulation.addToPlayingField(this.charge);
		} else {
			self.anim.simulation.removeFromPlayingField(this.charge);
		}
	};
};

/**
 * Resets the game: moves the puck back to the starting point but does not
 * remove any charges placed by the user
 */
Game.prototype.reset = function() {
	this.puck.moveTo(100 + this.map.puckPosition.x, this.map.puckPosition.y);
	this.puck.velocity = EFH.Vector.ZERO;
	this.anim.simulation.reset();
	this.layer.draw();
	this.puckLayer.draw();
};

/**
 * Saves the game state to JSON
 */
Game.prototype.serialize = function() {
	return this.stage.toJSON();
};

var createGame = function( options, callback ) {
	loadAssets(options, function() {
		var g = new Game(options);
		callback( g );
	});
};

EFH.createGame = createGame;