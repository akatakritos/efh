	var Simulation = function(initialState, onStep) {
		this.charges = [];
		this.initialState = initialState;
		this.currentState = initialState;
		this.previousState = initialState;
		this.accumulator = 0;
		this.simrate = 1000/60; //fps
		this.onStep = onStep || function( state, frame ) {};
	};

	Simulation.prototype.reset = function() {
		this.currentState = this.previousState = this.initialState;
		this.accumulator = 0;
	};

	Simulation.prototype.step = function( state, ds ) {
		var dt = ds/1000;
		if (dt === 0) {
			return state;
		}
		var force = new PointCharge({x:state.position.x, y:state.position.y, charge: state.charge.charge}).calcForceFrom( this.charges );
		var position = Physics.calcPosition( state.position, state.velocity, force, dt);
		var acceleration = force; //assume mass = 1
		var velocity = Physics.calcVelocity( state.velocity, force, dt);
		return {
			position: position,
			velocity: velocity,
			acceleration: acceleration,
			charge : state.charge
		};
	};

	Simulation.prototype.handleFrameRequest = function( frame ) {
		var frameTime = frame.timeDiff > 250 ? 250 : frame.timeDiff;
		this.accumulator += frameTime;
		while( this.accumulator >= this.simrate ) {

			this.previousState = this.currentState;
			this.currentState  = this.step( this.currentState, this.simrate );
			this.accumulator  -= this.simrate;

			this.onStep( this.currentState, frame );
			
		}

		var alpha = this.accumulator / frameTime;
		var state = this.blend(this.previousState, this.currentState, alpha);

		return state;
	};

	Simulation.prototype.blend = function( previousState, currentState, alpha ) {
		//currentState*alpha + previousState * ( 1.0 - alpha );
		var previousPositionVector = Vector.fromComponent(previousState.position.x, previousState.position.y);
		var currentPositionVector = Vector.fromComponent(currentState.position.x, currentState.position.y);
		var blendedPositionVector = currentPositionVector.mult(alpha).add(previousPositionVector.mult(1-alpha));
		return {
			velocity: currentState.velocity, 
			acceleration : currentState.acceleration, 
			position: {
				x: blendedPositionVector.xComponent(),
				y: blendedPositionVector.yComponent()
			}
		};
	};

	Simulation.prototype.addToPlayingField = function( pointCharge ) {
		
		if ( this.charges.indexOf( pointCharge ) === -1 ) {
			this.charges.push( pointCharge );
		}
	};

	Simulation.prototype.removeFromPlayingField = function( pointCharge ) {
		var index = this.charges.indexOf( pointCharge );
		if ( index > -1 ) {
			this.charges.splice( index, 1 );
		}
	};

	Simulation.prototype.serialize = function() {
		return JSON.stringify({
			charges: this.charges
		});
	};

	EFH.Simulation = Simulation;