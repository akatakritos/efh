module.exports = function(grunt){
	grunt.initConfig({

		concat: {
			options: {
				separator: ';'
			},
			physics : {
				src: [
					'src/intro.js',
					'src/efh.utils.js',
					'src/assets.js',
					'src/puck.js',
					'src/dragcharge.js',
					'src/map.js',
					'src/game.js',
					'src/outro.js'
				],
				dest: 'dist/game.js'
			},
			game : {
				src: [
					'src/intro.js',
					'src/efh.utils.js',
					'src/vector.js',
					'src/pointcharge.js',
					'src/physics.js',
					'src/simulation.js',
					'src/outro.js'
				],
				dest: 'dist/simulation.js'
			}
		},

		uglify: {
			options: {
				banner: '//Electric Field Hockey.js\n'
			},
			dist: {
				files: {
					'dist/game.min.js': ['<%= concat.game.dest %>'],
					'dist/simulation.min.js' : ['<%= concat.physics.dest %>']
				}
			}
		},

		jshint: {
			files: ['gruntfile.js', 'src/**/*.js'],
			options: {
				// options here to override JSHint defaults
				globals: {
					console: true,
					module: true,
					document: true
				},
				ignores: ['src/intro.js', 'src/outro.js']
			}
		},
		mochaTest: {
			test: {
				options: {
					reporter: 'spec',
					growl : true
				},
				src: ['test/**/*.js']
			}
		},
		watch: {
			files: ['<%= jshint.files %>', 'test/*.js'],
			tasks: ['jshint', 'concat', 'mochaTest']
			}
		});

	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-mocha-test');

	grunt.registerTask('default', ['jshint', 'concat', 'mochaTest', 'uglify']);
	grunt.registerTask('test', ['jshint', 'concat', 'mochaTest']);
};