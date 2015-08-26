var MetaStream = require('@quarterto/meta-stream');
var σ = require('highland');

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
			_.isStream(body) || body.pipe? body
			: /* otherwise */              [].concat(body)
		);
	},

	ok(body) {
		return this.body(body).status(200);
	},

	notFound(body) {
		return this.body(body).status(404);
	},

	redirect(location, status = 302) {
		return this.body([]).status(status).header('location', location);
	}
});

module.exports = Response;
