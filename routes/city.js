/**
 * Module dependencies.
 */

var
	mongoose = require('mongoose'),
	City = mongoose.model('City');

/*
 * GET load city data.
 */

exports.load = function(req, res){
	City.importFromCSV(function(err, data){
		if (err)
			res.json({error: err});
		else 
			res.json(true)
	})
};

/*
 * GET generate arcs for a city.
 */

exports.updateArcs = function(req, res){
	City.findOne({}, function(err, city){
		if (err)
			res.json({error: err});
		else {
			city.updateArcs(function(err, results){
				if (err)
					res.json({error: err});
				else
					res.json(results);
			});
		} 
	});
};