var jalfrezi = require('jalfrezi');
var Response = require('./lib');

module.exports = jalfrezi({
	server: require('http').createServer,
	errorHandler: function(e) {
		return Response.internalServerError(e.stack || e.toString());
	}
}, function server(options, handler) {
	return options.server(function(req, res) {
		return handler(req)
			.flatMapErrors(options.errorHandler)
			.pipe(res);
	});
};
