/**
 * Represents a Map or Level - the configuration of a puzzle the user must solve
 * @return {Level}
 */
var Level = function() {

  /**
   * Set a bunch of defaults
   */
  this.name = 'Level';
  this.goal = {
    x: 0,
    y: 0,
    width: 25,
    height: 100
  };
  this.background = { url : null, image : null };
  this.puckPosition = { x : 0, y: 0 };
  this.startingCharges = [1,-1,1,-1,1,-1];
  this.width = 0;
  this.height = 0;
};

/**
 * Load from a source, calling back when all the level assets are downloaded
 * @param  {Object}   source   The level data
 * @param  {Function} callback Called when all assets are loaded
 */
Level.load = function( source, callback ) {
  if ( typeof source === 'string' ) {
    Level.loadJson( source, callback );
  } else {
    Level.loadObject( source, callback );
  }
};

Level.loadObject = function( source, callback ) {
  var map = new Level();
  merge(map, source);

  map.height = +map.height;
  map.width = +map.width;
  map.goal.x = +map.goal.x;
  map.goal.y = +map.goal.y;
  map.goal.width = +map.goal.width;
  map.goal.height = +map.goal.height;
  map.puckPosition.x = +map.puckPosition.x;
  map.puckPosition.y = +map.puckPosition.y;
  if ( typeof source.startingCharges === 'string' ) {
    map.startingCharges = source.startingCharges.split(',').map(function(c) {
      return +c;
    });
  }

  if ( source.backgroundUrl ) {
    map.background.url = source.backgroundUrl;
    map.background.image = new Image();
    map.background.image.onload = function() {
      callback( map );
    };

    map.background.image.src = map.background.url;
  } else {
    callback( map );
  }
};

Level.loadJson = function( source, callback ) {
  throw "NOT IMPLEMENTED";
};
