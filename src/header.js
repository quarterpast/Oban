var {response: responseHeaders} = require('standard-headers');
var camelCase = require('camel-case');

function headerMethod(header) {
	return function(val) {
		return this.header(header, val);
	}
}

module.exports = responseHeaders
.filter(h => h !== 'status')
.reduce((o, header) =>
	(o[camelCase(header)] = headerMethod(header), o),
{});
