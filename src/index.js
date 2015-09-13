var MetaStream = require('@quarterto/meta-stream');
var isReadable = require('is-readable-stream');
var binary = require('@quarterto/binary');
var cookie = require('cookie');
var fs = require('fs');
var mime = require('mime');

var statusMethods = require('./status');
var headerMethods = require('./header');

function metaMethod(key) {
	return {[key](val) {
		this.meta({[key]: val});
		return this;
	}};
}

var metaMethods = ['status', 'timeout'].map(metaMethod).reduce(binary(Object.assign), {});

var Response = MetaStream.use({
	getInitialMeta() {
		return {
			status: 200,
			timeout: 120,
			headers: {}
		}
	},

	pipe(res) {
		if(res.writeHead) res.writeHead(this.meta().status, this.meta().headers);
		if(res.setTimeout) res.setTimeout(this.meta().timeout);
		return MetaStream().pipe.call(this, res);
	},

	...headerMethods,
	...metaMethods,

	headers(h) {
		var {headers} = this.meta();
		for(let [k, v] of Object.entries(h)) {
			headers[k] = headers[k] ? [].concat(headers[k]).concat(v) : v;
		}
		this.meta({headers});
		return this;
	},

	header(k, v) {
		return this.headers({[k]: v});
	},

	cookie(...args) {
		return this.setCookie(cookie.serialize(...args));
	}
}, {
	body(body) {
		return this(
			MetaStream.isStream(body)?  body
			: isReadable(body)?         body
			: /* otherwise */           [].concat(body)
		);
	},

	empty() {
		return this([]);
	},

	redirect(location, status = 302) {
		return this.empty().status(status).headers({location});
	},

	file(path) {
		return this(fs.createReadStream(path)).contentType(mime.lookup(path));
	},

	...statusMethods
});

module.exports = Response;
