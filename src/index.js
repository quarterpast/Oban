var MetaStream = require('@quarterto/meta-stream');
var σ = require('highland');

var statusMethods = require('./status');
var headerMethods = require('./header');

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
