var
	moment = require('moment'),
	mongoose = require('mongoose'),
	Arc = mongoose.model('Arc');


function Checker(options){

	options = options || {};

	function next(){

		Arc.checkOne(function(err){
			if (err) console.log(err);
			setTimeout(next, options.timeout || 1000)	
		});
	}

	// start updating
	next();
}

module.exports = Checker