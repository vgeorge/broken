/**
 * Module dependencies.
 */

 var 
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
  updatedAt: {type: Date, default: Date.now}
})

ArcSchema.index({ from: 1, to: 1 });


mongoose.model('Arc', ArcSchema)