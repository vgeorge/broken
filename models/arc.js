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

  ibge_id: {type : String, default : '', trim : true},
  name: {type : String, default : '', trim : true, required: true},
  uf: {type: String},  
  isCapital: {type: Boolean, defaut: false},
  nearCities: [{
    id: { type: Schema.ObjectId, ref: 'City'},
    straightDistance: {type: Number, default: 0},
    routeForwardDistanceRatio: {type: Number, default: 0},
    routeBackwardDistanceRatio: {type: Number, default: 0}
  }],
  stats: {
    percentualConnected: { type: Number, default: 0},    
    totalConnected: { type: Number, default: 0},
    totalTortuous: { type: Number, default: 0},
    totalInexistent: { type: Number, default: 0},        
    totalChecked: { type: Number, default: 0}
  },
  loc: { type: {type: String}, coordinates: []},
  updatedAt: {type: Date},
  shouldUpdate: {type: Boolean, default: true},
  isUpdating: {type: Boolean, default: false}
})