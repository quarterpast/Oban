var {response: responseHeaders} = require('standard-headers');
var camelCase = require('camel-case');
var binary = require('@quarterto/binary');

function headerMethod(header) {
	return {[camelCase(header)]: function(val) {
		return this.header(header, val);
	}};
}

module.exports = responseHeaders
.filter(h => h !== 'status')
.map(headerMethod)
.reduce(binary(Object.assign), {});
