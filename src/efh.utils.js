var merge = function(defaults, overrides) {
	if (overrides) {
		for ( var prop in overrides ) {
			if (defaults.hasOwnProperty(prop)) {
				defaults[prop] = overrides[prop];
			}
		}
	}
};
