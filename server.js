var jalfrezi = require('jalfrezi');
var Response = require('./lib');

module.exports = jalfrezi({
	createServer: require('http').createServer,
	errorHandler: function(e) {
		return Response.internalServerError(e.stack || e.toString());
	}
}, function server(options, handler) {
	return options.createServer(function(req, res) {
		return handler(req)
			.flatMapErrors(options.errorHandler)
			.pipe(res);
	});
};
