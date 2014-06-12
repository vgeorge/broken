/**
 * Module dependencies.
 */

 var 
	fs = require('fs'),
	_ = require('underscore'),
	async = require('async'),
	parse = require('csv-parse'),
	mongoose = require('mongoose'),
	Schema = mongoose.Schema;

 /**
 * Cities Schema
 */

var CitySchema = new Schema({
	_id: String,
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
	updateArcs: function(callback) {
    var City = mongoose.model('City')
    
    this.model('City').collection
      .geoNear(this.getLon(), this.getLat(), {spherical: true, num: 5 + 1, distanceMultiplier: 6371}, function(err, cities){
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
  }
}

/**
 * Statics
 */

CitySchema.statics = {

	importFromCSV: function(callback) {
		var City = mongoose.model('City');


		var parser = parse({delimiter: ',', columns: true}, function(err, data){


			async.each(data, function(row, done){

				City.findById(row.id, function(err, city){
					if (err) 
						return callback(err);
					

					if (!city) {
						city = new City({_id: row.id});
					}
					city.name = row.name;
					city.uf = row.uf;
					city.isCapital = row.is_capital == '1' ? true : false;
					city.loc = {type: 'Point', coordinates: [new Number(row.lon),new Number(row.lat)]};
					city.save(done)
				})
			}, callback);		  
		});

		fs.createReadStream(__dirname+'/../data/cities.csv').pipe(parser);
	}
}

mongoose.model('City', CitySchema)