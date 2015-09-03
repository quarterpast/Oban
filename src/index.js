var MetaStream = require('@quarterto/meta-stream');
var σ = require('highland');
var camelCase = require('camel-case');
var {STATUS_CODES} = require('http');
var {response: responseHeaders} = require('standard-headers');

function statusMethod(status) {
	return function(body) {
		return this.body(body).status(status);
	}
}

var statusMethods = Object.keys(STATUS_CODES)
	.reduce((o, code) =>
		(o[camelCase(STATUS_CODES[code])] = statusMethod(parseInt(code)), o),
	{});

function headerMethod(header) {
	return function(val) {
		return this.header(header, val);
	}
}

var headerMethods = responseHeaders
	.filter(h => h !== 'status')
	.reduce((o, header) =>
		(o[camelCase(header)] = headerMethod(header), o),
	{});


var Response = MetaStream.use({
	getInitialMeta() {
		return {
			status: 200,
			headers: {}
		}
	},

	pipe(res) {
		res.writeHead(this.meta().status, this.meta().headers);
		return σ().pipe.call(this, res);
	},

	...headerMethods,

	status(status) {
		this.meta({status});
		return this;
	},

	header(k, v) {
		return this.headers({[k]: v});
	},

	headers(headers) {
		this.meta({headers});
		return this;
	}
}, {
	body(body) {
		return this(
			σ.isStream(body) || body.pipe? body
			: /* otherwise */              [].concat(body)
		);
	},

	empty() {
		return this([]);
	},

	redirect(location, status = 302) {
		return this.empty().status(status).headers({location});
	},

	...statusMethods
});

module.exports = Response;
