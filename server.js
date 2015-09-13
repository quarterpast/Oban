module.exports = function(handler, options) {
	options = options || {};
	require(options.http || 'http').createServer(function(req, res) {
		handler(req).pipe(res);
	});
};
