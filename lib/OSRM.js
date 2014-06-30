var
	_ = require('underscore'),
	request = require('request-json'),
	client = request.newClient('http://estradas.mapaslivres.org'); // TODO move to config.js


var apiUrl = 'http://router.project-osrm.org/'; // TODO move to config.js

function OSRM(options){

	this.options = options || {};

}

OSRM.getRoute = function(points, done){

	var locsString = _.map(points, function(point){
		return 'loc=' + point[0] + ',' + point[1];
	}).join('&');

    var self = this
      , query_str = "viaroute?"
      	+ locsString
        +"&output=json"
        +"&z=0";
    console.log(apiUrl + query_str);

    client.get(apiUrl + query_str, function (error, response, body) {
    	done(error, body);
	  // if (!error && response.statusCode == 200) {
	  //   console.log(body) // Print the google web page.
	  //   done()
	  // } else done(err);
	})

    // client.get(query_str, function(error, response, body) {
    //   if (!error && response.statusCode == 200) {
    //     callback(null, body)
    //   } else {
    //     logger.error('Houve um erro ao buscar a rota entre ' + self.fullName() + ' e ' + city_to.fullName())
    //     callback(error)
    //   }
    // })
  // }
}

module.exports = OSRM