/**
 * Module dependencies.
 */

 var 
 	OSRM = require('../lib/OSRM'),
 	mongoose = require('mongoose'),
 	Schema = mongoose.Schema;

 /**
 * Arc Schema
 */

var ArcSchema = new Schema({
  from: { type: Number, ref: 'City', index: true},
  to: { type: Number, ref: 'City', index: true},
  distance: {
    straight: Number,
    road: Number
  },
  connected: {type: Boolean, default: false},
  tortuous: {type: Boolean, default: false},
  updatedAt: Date
})

ArcSchema.index({ from: 1, to: 1 });

/**
 * Methods
 */

ArcSchema.methods = {
	updateAndSave: function(done) {
		var self = this;

		OSRM.getRoute([self.from.latlon, self.to.latlon], function(err,route){
			if (err) {
				console.log(err);
				done(err);
			} else {
				// route is not connected
				if (route.status == 207) {
					self.connected = false;					
				} else {
					self.connected = true;

					// convert to km and round to 0.1
					self.distance.road = Math.round(route.route_summary.total_distance / 1000 * 10) / 10; 
					console.log(route.route_summary.total_distance);
					console.log(self.distance.road);
					if ((self.distance.road / self.distance.straight) > 1.5 ) {
						self.tortuous = true;
					}
				}
				self.updatedAt = Date.now();
				self.save(done);
			}
		});
	}
}

/**
 * Statics
 */

ArcSchema.statics = {
	checkOne: function(done) {
		this.findOne({updatedAt: null}).populate('from to').exec(function(err, arc){
			arc.updateAndSave(done);
		})
	}
}


mongoose.model('Arc', ArcSchema)