var assert = require('assert');
require('../efh.utils');
require('../efh.physics');

assert.almostEqual = function(a, b, epsilon, message) {
	if (typeof epsilon === 'undefined') {
		epsilon = 0.00000001;
	}
	assert( Math.abs(a-b) < epsilon, message);
};

describe('Vectors', function() {
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