var assert = require('assert');
require('../dist/efh.js');

assert.almostEqual = function(a, b, epsilon, message) {
	if (typeof epsilon === 'undefined') {
		epsilon = 0.00000001;
	}
	assert( Math.abs(a-b) < epsilon, message);
};

var Factory = {
	createVector: function(magnitude, direction) {
		return new EFH.Vector({magnitude: magnitude, direction: direction});
	},
	createCharge: function(x, y, charge) {
		return new EFH.PointCharge({x:x, y:y, charge: charge});
	}
};

describe('Vectors', function() {
	describe('standardize', function(){
		describe('general cases', function(){
			describe('normal vector', function() {
				var v = new EFH.Vector({magnitude: 1, direction: Math.PI/4});
				var result = v.standardize();
				it('should be the same', function(){
					assert.equal(result.direction, v.direction);
					assert.equal(result.magnitude, v.magnitude);
				});
			});

			describe('large angle, positive magnitude', function(){
				var v = Factory.createVector(1, 5*Math.PI/2);
				var result = v.standardize();

				it('should have same magnitude', function(){
					assert.equal(result.magnitude, v.magnitude);
				});

				it ('should have an angle between 0 and 2pi', function() {
					assert(result.direction >= 0 && result.direction <= 2*Math.PI);
				});

			});

			describe('negative direction, positive magnitude', function(){
				var v = Factory.createVector(1, -Math.PI);
				var result = v.standardize();

				it('should have the same magnitude', function() {
					assert.equal(result.magnitude, v.magnitude);
				});

				it ('should have a positive direction between 0 and 2pi', function() {
					assert(result.direction >= 0 && result.direction <= 2*Math.PI);
				});
			});

			describe('negative direction, negative magnitude', function(){
				var v = Factory.createVector(-Math.PI/2, -1);
				var result = v.standardize();

				it('should have a positive direction', function() {
					assert( result.direction >= 0 && result.direction <= 2*Math.PI);
				});

				it ('should have a positive magnitude', function() {
					assert( result.magnitude >= 0 );
				});
			});
		});

		describe('specific cases', function() {
			var tests = [
				{input: Factory.createVector(1,0), expected: Factory.createVector(1,0) },
				{input: Factory.createVector(0,0), expected: Factory.createVector(0,0) },
				{input: Factory.createVector(-1,0), expected: Factory.createVector(1,Math.PI) },
				{input: Factory.createVector(1,-Math.PI), expected: Factory.createVector(1,Math.PI) },
				{input: Factory.createVector(-1,-Math.PI), expected: Factory.createVector(1,0) }
			];

			for( var i = 0; i < tests.length; i++) {
				var input = tests[i].input;
				var expected = tests[i].expected;

				describe('' + input, function() {
					it('should become ' + expected, function() {
						var result = input.standardize();
						assert.equal(result.magnitude, expected.magnitude);
						assert.equal(result.direction, expected.direction);
					});
				});
			}
		});
	});

	describe('addition', function(){
		describe( 'adding the zero vector', function() {
			it ('changes nothing', function() {
				var v = new EFH.Vector({magnitude: 4, direction: 3});
				var result = v.add(EFH.Vector.ZERO);
				assert.equal(v.magnitude, result.magnitude);
				assert.equal(v.direction, result.direction);
			});
		});

		describe( 'adding to itself', function() {
			var v = new EFH.Vector({magnitude: 1, direction: 3});
			var result = v.add(v);

			it('should be twice the magnitude', function() {
				assert.almostEqual(result.magnitude, v.magnitude*2);
			});

			it ('should be the same direction', function(){
				assert.equal(result.direction, v.direction);
			});
		});

		describe ( 'adding its opposite', function() {
			var v = Factory.createVector(3, Math.PI/4);
			var opposite = Factory.createVector(3, 5*Math.PI/4);

			it('should be the zero vector', function(){
				var result = v.add( opposite );
				assert.equal(result.direction, 0);
				assert.equal(result.magnitude, 0);
			});

		});
	});

	describe('multiplication', function(){
		var v = new EFH.Vector({magnitude: 4, direction: 1.5});
		describe('multiply by zero', function() {
			var result = v.mult(0);
			it('should be zero magnitude', function() {
				assert.equal(result.magnitude, 0);
			});

			it('should have the same direction', function() {
				assert.equal(result.direction, v.direction);
			});
		});

		describe('multiply by one', function() {
			var result = v.mult( 1 );

			it('should have the same magnitude', function(){
				assert.equal(result.magnitude, v.magnitude);
			});

			it('should have the same direction', function() {
				assert.equal(result.direction, v.direction);
			});
		});

		describe('multiply by two', function(){
			var result = v.mult(2);

			it('should have twice the magnitude', function(){
				assert.equal(result.magnitude, v.magnitude * 2);
			});

			it('should have the same direction', function() {
				assert.equal(result.direction, v.direction);
			});
		});

		describe('multiply by negative 1', function(){
			var result = v.mult(-1);

			it('should have the same magnitude', function(){
				assert.equal(result.magnitude, v.magnitude);
			});

			it('should have the opposite direction', function(){
				assert.equal(result.direction, v.direction + Math.PI);
			});
		});
	});
});

describe('force calculation', function(){
	describe('opposites attract', function() {
		var o = Factory.createCharge(0, 0, 1);
		var e = Factory.createCharge(1, 0, -1);
		var n = Factory.createCharge(0, 1, -1);
		var w = Factory.createCharge(-1, 0, -1);
		var s = Factory.createCharge(0, -1, -1);

		it('o vs e should be to the left', function() {
			var result = o.calcForceAgainst( e );
			assert.equal(result.direction, Math.PI);
		});

		it('o vs n should be down', function() {
			var result = o.calcForceAgainst( n );
			assert.equal(result.direction, 3*Math.PI/2);
		});

		it('o vs w should be to the right', function() {
			var result = o.calcForceAgainst( w );
			assert.equal(result.direction, 2*Math.PI);
		});

		it('o vs s should be up', function() {
			var result = o.calcForceAgainst( s );
			assert.equal(result.direction, Math.PI/2);
		});
	});

	describe('like charges repel', function() {
		var o = Factory.createCharge(0, 0, 1);
		var e = Factory.createCharge(1, 0, 1);
		var n = Factory.createCharge(0, 1, 1);
		var w = Factory.createCharge(-1, 0, 1);
		var s = Factory.createCharge(0, -1, 1);

		it('o vs e should be to the right', function() {
			var result = o.calcForceAgainst( e );
			assert.equal(result.direction, 0);
		});

		it('o vs n should be up', function() {
			var result = o.calcForceAgainst( n );
			assert.equal(result.direction, Math.PI/2);
		});

		it('o vs w should be to the left', function() {
			var result = o.calcForceAgainst( w );
			assert.equal(result.direction, Math.PI);
		});

		it('o vs s should be down', function() {
			var result = o.calcForceAgainst( s );
			assert.equal(result.direction, 3*Math.PI/2);
		});
	});

	describe( 'when radius is zero', function() {
		var c = Factory.createCharge(0,0,1);
		var result = c.calcForceAgainst(c);
		it('should have magnitude of max value', function() {
			assert.equal(result.magnitude, Number.MAX_VALUE);
		});

	});

	describe('multiple charges', function() {
		describe('two coterminous charges', function(){
			var subject = Factory.createCharge(0,0,1);
			var coterminous = Factory.createCharge(1,0,1);
			var charges = [coterminous, coterminous];

			var single = coterminous.calcForceAgainst( subject );
			var doubl  = subject.calcForceFrom( charges );

			it('should be twice the magnitude', function(){

				assert.equal(doubl.magnitude, single.magnitude*2);
			});

			it ('should be the same direction', function() {
				assert.equal(doubl.direction, single.direction);
			});
		});

		describe('two opposite direction charges', function() {
			var subject = Factory.createCharge(0,0,1);
			var charges = [Factory.createCharge(-1,0,1), Factory.createCharge(1,0,1)];
			var result = subject.calcForceFrom( charges );
			it('should be zero magnitude', function() {
				assert.almostEqual(result.magnitude, 0);
			});
		});
	});
});