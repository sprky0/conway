module.exports = function(grunt) {

	grunt.initConfig({
		jshint: {
			files: ['Gruntfile.js', 'src/**/*.js', 'test/**/*.js'],
			options: {
				esversion: 6,
				globals: {
					jQuery: true
				}
			}
		},
		watch: {
			files: ['<%= jshint.files %>'],
			tasks: ['jshint', 'concat']
		},
		concat: {
			options: {
				// define a string to put between each file in the concatenated output
				separator: ';'
			},
			core: {
				src: [
					'node_modules/three/build/three.min.js'
					// , 'src/**/*.js'
				],
				dest: 'docroot/js/core.js'
			},
			app: {
				src: [

					// pick a renderer
					// 'src/renderer/basic.js',
					// 'src/renderer/three.js',
					'src/renderer/text.js',

					// pick a grid
					'src/grid/conway.js',

					// optional montioring script
					'src/monitor.js',

					// main application and interface bindings
					'src/main.js'
				],
				dest: 'docroot/js/main.js'
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-concat');
	// minify next

	grunt.registerTask('default', ['jshint', 'watch']);

};
