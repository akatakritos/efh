module.exports = function(grunt){
	grunt.initConfig({

		concat: {
			options: {
				separator: ';'
			},
			dist : {
				src: [
					'src/intro.js',
					'src/efh.utils.js',
					'src/vector.js',
					'src/efh.physics.js',
					'src/efh.simulation.js',
					'src/outro.js'
				],
				dest: 'dist/efh.js'
			}
		},

		uglify: {
			options: {
				banner: '//Electric Field Hockey.js\n'
			},
			dist: {
				files: {
					'dist/efh.min.js': ['<%= concat.dist.dest %>']
				}
			}
		},

		jshint: {
			files: ['gruntfile.js', 'src/**/*.js', 'test/**/*.js'],
			options: {
				// options here to override JSHint defaults
				globals: {
					console: true,
					module: true,
					document: true
				}
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
			files: ['<%= jshint.files %>'],
			tasks: ['concat', 'mochaTest']
			}
		});

	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-mocha-test');

	grunt.registerTask('default', ['jshint', 'concat', 'mochaTest', 'uglify']);
};