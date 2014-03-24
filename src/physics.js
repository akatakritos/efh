/**
 * Namespace for physics functions
 * @type {Object}
 */
  var Physics = {};

  /**
   * Calculate the position of an object after a period of time.
   *
   * p = p0 + vt + at^2
   * 
   * @param  {object|Point}  p    {x,y} initial position
   * @param  {EFH.Vector}    v    velocity vector
   * @param  {EFH.Vector}    a    acceleration vector
   * @param  {Number}        t    time in seconds
   * @return {object}             {x, y} final position
   */
  Physics.calcPosition = function(p, v, a, t) {
    return {
      x : p.x + (v.xComponent() * t + a.xComponent() * (t*t)),
      y : p.y + (v.yComponent() * t + a.yComponent() * (t*t))
    };
  };

  /**
   * Calculates the velocity of an object after a period of time
   *
   * v = v0 + at
   * 
   * @param  {EFH.Vector}   v    initial velocity Vector
   * @param  {EFH.Vector}   a    acceleration vector
   * @param  {Number}       t    time passed in seconds
   * @return {EFH.Vector}        final velocity vector
   */
  Physics.calcVelocity = function(v, a, t) {
    return v.add( a.mult(t) );
  };

  EFH.Physics = Physics;
