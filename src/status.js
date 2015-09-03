var {STATUS_CODES} = require('http');
var camelCase = require('camel-case');

function statusMethod(status) {
	return function(body) {
		return this.body(body).status(status);
	}
}

module.exports = Object.keys(STATUS_CODES)
.reduce((o, code) =>
	(o[camelCase(STATUS_CODES[code])] = statusMethod(parseInt(code)), o),
{});
