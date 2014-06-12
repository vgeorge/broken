/**
 * Module dependencies.
 */

var
	mongoose = require('mongoose'),
	City = mongoose.model('City');

/*
 * GET home page.
 */

exports.index = function(req, res){
	City.count(function(err, count){
		if (count == 0) 
			res.redirect('/cities/load');
		else 
			res.json({error: err, count: count});
	})
};

