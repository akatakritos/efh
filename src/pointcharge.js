var K = 1000000; //force constant

var PointCharge = function(options) {

  this.x = 0;
  this.y = 0;
  this.charge = 1;

  merge(this, options);
};

PointCharge.prototype.calcForceAgainst = function(otherCharge) {
  var dx = otherCharge.x - this.x;
  var dy = otherCharge.y - this.y;
  var r  = Math.sqrt(dx*dx + dy*dy);

  var dir = Math.atan2(dy, dx);

  var magnitude = K * this.charge * otherCharge.charge / (r * r);

  if ( magnitude == Number.POSITIVE_INFINITY) {
    magnitude = Number.MAX_VALUE;
  }

  return new Vector({magnitude: magnitude, direction: dir}).standardize();
};

PointCharge.prototype.calcForceFrom = function( pointCharges ) {
  var onObj = this;
    if (pointCharges.length === 0) {
      return Vector.ZERO;
    }

    return pointCharges.map(function( pointCharge ){

      return pointCharge.calcForceAgainst( onObj );

    }).reduce(function(accumulator, v, i, arr) {
      return accumulator.add(v);
    }, Vector.ZERO).standardize();
  };

EFH.PointCharge = PointCharge;
EFH.K = K;
