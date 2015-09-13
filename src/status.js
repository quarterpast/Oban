var {STATUS_CODES} = require('http');
var camelCase = require('camel-case');
var binary = require('@quarterto/binary');

function statusMethod(status) {
	var methodName = status === 418 ? 'imATeapot' : camelCase(STATUS_CODES[status]);
	return {[methodName](body) {
		return this.body(body).status(parseInt(status));
	}};
}

module.exports = Object.keys(STATUS_CODES).map(statusMethod).reduce(binary(Object.assign), {});
