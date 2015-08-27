var MetaStream = require('@quarterto/meta-stream');
var σ = require('highland');
var camelCase = require('camel-case');
var {STATUS_CODES} = require('http');

function statusMethod(status) {
	return function(body) {
		return this.body(body).status(status);
	}
}

var statusMethods = Object.keys(STATUS_CODES)
	.reduce((o, code) =>
		(o[camelCase(STATUS_CODES[code])] = statusMethod(parseInt(code)), o),
	{});

var Response = MetaStream.use({
	getInitialMeta() {
		return {
			status: 200,
			headers: {}
		}
	},

	pipe(req) {
		req.writeHead(this.meta().status, this.meta().headers);
		return σ().pipe.call(this, req);
	},

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
