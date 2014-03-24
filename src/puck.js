  var Puck = function(x, y) {
    this.charge = new EFH.PointCharge({x: x, y: y, charge: 1});
    this.velocity = EFH.Vector.ZERO;
    this.shape = new Kinetic.Image({
      x : x - 20,
      y : y - 20,
      image : Assets.images.puck
    });
  };

  Puck.prototype.moveTo = function(x, y) {
    this.charge.x = x;
    this.charge.y = y;
    this.shape.setPosition(x - 20, y - 20);
  };

  Puck.prototype.getX = function() {
    return this.charge.x;
  };

  Puck.prototype.getY = function() {
    return this.charge.y;
  };

  Puck.prototype.getRadius = function() {
    return 20;
  };
