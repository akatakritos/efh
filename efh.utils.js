(function(window) {
	var EFH = window.EFH || {};

	var Utils = {};

	Utils.merge = function(defaults, overrides) {
		if (overrides) {
			for ( var prop in overrides ) {
				if (defaults.hasOwnProperty(prop)) {
					defaults[prop] = overrides[prop];
				}
			}
		}
	};

	EFH.Utils = Utils;
	if ( ! window.EFH) {
		window.EFH = EFH;
	}
})(typeof(window) === 'undefined' ? global : window);