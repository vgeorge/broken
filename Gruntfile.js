var 
	fs = require('fs'),
	mongoose = require('mongoose'),
	db = mongoose.connection,
	config = require('./config');

// Bootstrap models
var models_path = __dirname + '/models'
fs.readdirSync(models_path).forEach(function (file) {
  if (~file.indexOf('.js')) require(models_path + '/' + file)
})

var 
	City = mongoose.model('City');

// Connect to mongodb
mongoose.connect(config.db)


module.exports = function(grunt) {

	/* 
	 * Default
	 */

	grunt.registerTask('default', 'Init application database', function(){

		var done = this.async();

		// On connect
		db.on('open', function (err) {
			City.count(function(err, count){
				if (!err) {
					if (count > 0 )
						grunt.task.run('arcs');					
					else 
						grunt.task.run('load', 'arcs');
					// db.close();
					done();
				} else {
					grunt.log.write(err);
				}
			})

		});
		
	});

	/* 
	 * Load cities task
	 */

	grunt.registerTask('cities', 'Load data/cities.csv', function(){

		var done = this.async();

		// On connect
		db.on('open', function (err) {
			City.remove(function(err){
				if (err) {
					// db.close();
					done(err)
				} else {
					City.importFromCSV(config.dataCsvPath, function(err, data){
						if (err) {
							grunt.log.write('Error loading data, closing...');
						} else {
							grunt.log.write('Cities loaded sucessfully!');
						}
						// db.close();
						done(err);							

					})

				}
			})
		})

	})

	/* 
	 * Generate arcs task
	 */

	grunt.registerTask('arcs', 'Generate arcs.', function(){

		var done = this.async();
		
		// On connect
		db.on('open', function (err) {
			City.buildNet(config.nNearestCities, function(err){
				// db.close();
				done(err);
			});
		});
	});
}