/**
 * Module dependencies.
 */

 var 
	fs = require('fs'),
	_ = require('underscore'),
	async = require('async'),
	parse = require('csv-parse'),
	ProgressBar = require('progress'),
	mongoose = require('mongoose'),
	Schema = mongoose.Schema;

 /**
 * Cities Schema
 */

var CitySchema = new Schema({
	_id: {type: Number, index: true },
	name: {type : String, default : '', required: true},
	uf: String,
	isCapital: {type: Boolean, defaut: false},
	loc: { type: {type: String}, coordinates: []}
})

/**
 * Geo index
 **/

CitySchema.index({ loc: '2dsphere' });

/**
 * Methods
 */

CitySchema.methods = {
	getLon: function(){
		return this.loc.coordinates[0]
	},
	getLat: function(){
		return this.loc.coordinates[1]    
	},
	getNearest: function(n, callback) {
		var City = mongoose.model('City')
		
		this.model('City').collection
			.geoNear(this.getLon(), this.getLat(), {spherical: true, num: n + 1, distanceMultiplier: 6371}, function(err, cities){
				if (err) callback(err)

				// remove first element
				cities.results.shift()

				// City model should be reconstruted because of geoNear possible bug
				_.map(cities.results, function(result){
					result.dis = parseFloat(result.dis.toFixed(1));
					result.obj = new City(result.obj)
				})

				callback(null,cities.results)
		});
	},
	createArcs: function(n, callback) {

		var 
			self = this,
			Arc = mongoose.model('Arc');

		self.getNearest(n, function(err, nearest){
			if (err) return callback(err)
			async.eachSeries(nearest, function(to, done){
				async.parallel([
					function(doneFoward) {
						Arc.update({from: self, to: to.obj}, {distance: {straight: to.dis}}, {upsert: true}, doneFoward);
					},
					function(doneBackward) {
						Arc.update({from: to.obj, to: self}, {distance: {straight: to.dis}}, {upsert: true}, doneBackward);
					}					
				], done)
			}, callback)
		})
	

	}
}

/**
 * Statics
 */

CitySchema.statics = {

	importFromCSV: function(csvPath, callback) {

		var 
			City = mongoose.model('City'),
			Arc = mongoose.model('Arc');

		var parser = parse({delimiter: ',', columns: true}, function(err, data){			

			var bar = new ProgressBar('loading cities [:bar] :percent Remaining: :etas Total: :elapseds', { 
				complete: '=',
		    incomplete: ' ',
		    width: 40,
				total: data.length 
			});


			async.eachSeries(data, function(row, done){

				var city = new City({
					_id: row.id,
					name: row.name,
					uf: row.uf,
					isCapital: row.is_capital == '1' ? true : false,
					loc: {type: 'Point', coordinates: [new Number(row.lon),new Number(row.lat)]}
				})

				city.save(function(err){
					bar.tick();
					done(err);
				})
			}, callback);		  
		});

		fs.createReadStream(__dirname+'/../' + csvPath).pipe(parser);
	},

	/*
	 * Generate arcs to n nearest cities, for each city 
	 */
	buildNet: function(n ,callback){
		
		var City = mongoose.model('City');

		City.find({}, function(err, cities){
			if (err) return callback(err)

			var bar = new ProgressBar('building net [:bar] :percent Remaining: :etas Total: :elapseds', { 
				complete: '=',
		    incomplete: ' ',
		    width: 40,
				total: cities.length 
			});

			async.eachSeries(cities, function(city, done){
				bar.tick();
				city.createArcs(n, done);	
			}, callback)
		})
	}
}

mongoose.model('City', CitySchema)