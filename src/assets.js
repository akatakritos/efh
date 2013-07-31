var Assets = {
	images : {
	}
};
var loadAssets = (function() {
	var assetsList = [
		{
			name: "puck",
			source: 'img/puck.png',
			type: 'image'
		},
		{
			name: "positive",
			source: 'img/positive.png',
			type: 'image'
		},
		{
			name: "negative",
			source: 'img/negative.png',
			type: 'image'
		}
	];

	var loadedAssetsCount = 0;
	var assetLoaded = function( asset, object, callback) {
		loadedAssetsCount++;

		if ( asset.type === 'image' ) {
			Assets.images[asset.name] = object;
		}

		if ( loadedAssetsCount === assetsList.length ) {
			callback();
		}
	};

	return function( cb ) {
		assetsList.forEach(function( asset ) {
			if (asset.type === 'image') {
				var img = new Image();
				img.onload = function() {
					assetLoaded(asset, img, cb);
				};
				img.src = asset.source;
			}
		});
	};
})();