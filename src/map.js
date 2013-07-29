var Level = function() {
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