var {expect} = require('chai').use(require('dirty-chai'));

var σ = require('highland');
var {STATUS_CODES} = require('http');
var {response: responseHeaders} = require('standard-headers');
var camelCase = require('camel-case');
var Response = require('./');

function statusTest(status) {
	var funcName = camelCase(STATUS_CODES[status]);
	return {
		'should set body' (done) {
			var R = Response.use({}, {
				body(body) {
					expect(body).to.equal('hello');
					done();
					return Response.body(body);
				}
			});

			R[funcName]('hello');
		},

		[`should set ${status} status`] (done) {
			var r = Response[funcName]('');
			var s = σ();
			s.writeHead = (status, headers) => {
				expect(status).to.equal(parseInt(status));
				done();
			};
			r.pipe(s);
		}
	};
}

var statusTests = Object.keys(STATUS_CODES)
	.reduce((o, code) =>
		(o[camelCase(STATUS_CODES[code])] = statusTest(code), o),
	{});

function headerTest(header) {
	var funcName = camelCase(header);
	return done => {
		var r = Response.empty()[funcName]('foo')
		var s = σ();
		s.writeHead = (status, headers) => {
			expect(headers).to.have.property(header, 'foo');
			done();
		};
		r.pipe(s);
	}
}

var headerTests = responseHeaders
	.filter(h => h !== 'status')
	.reduce((o, header) =>
		(o[camelCase(header)] = headerTest(header), o),
	{});


exports['Response'] = {
	'should stream' (done) {
		var r = Response(['hello']);
		r.apply(x => {
			expect(x).to.equal('hello');
			done();
		});
	},

	'pipe': {
		'should pipe' (done) {
			var r = Response(['hello']);
			var s = σ();
			s.apply(x => {
				expect(x).to.equal('hello');
				done();
			});
			r.pipe(s);
		},

		'should write head' (done) {
			var r = Response(['hello']);
			var s = σ();
			s.writeHead = (status, headers) => {
				expect(status).to.equal(200);
				expect(headers).to.deep.equal({});
				done();
			};
			r.pipe(s);
		},

		'should set timeout' (done) {
			var r = Response([]);
			var s = σ();
			s.setTimeout = (timeout) => {
				expect(timeout).to.equal(120);
				done();
			};
			r.pipe(s);
		}
	},

	'header': {
		'with mulitple headers should set array'() {
			var r = Response([]);
			r.header('a', 1).header('a', 2);
			expect(r.meta().headers.a).to.deep.equal([1, 2]);
		}
	},

	'body': {
		'should write string body' (done) {
			Response.body('hello').toArray(body => {
				expect(body).to.deep.equal(['hello']);
				done();
			});
		},

		'should pipe stream body' (done) {
			Response.body(σ(['hello'])).toArray(body => {
				expect(body).to.deep.equal(['hello']);
				done();
			});
		}
	},

	'status helper methods': statusTests,
	'header helper methods': headerTests,

	'empty': {
		'should set empty body' (done) {
			Response.empty().toArray(xs => {
				expect(xs).to.be.empty();
				done();
			});
		},
	},

	'redirect': {
		'should set empty body' (done) {
			var R = Response.use({}, {
				empty() {
					expect('here').to.be.ok();
					done();
					return Response.empty();
				}
			});

			R.redirect('/hello');
		},

		'should set location header' (done) {
			var r = Response.redirect('/hello');
			var s = σ();
			s.writeHead = (status, headers) => {
				expect(headers).to.have.property('location', '/hello');
				done();
			};
			r.pipe(s);
		},

		'should set 302 status' (done) {
			var r = Response.redirect('/hello');
			var s = σ();
			s.writeHead = (status, headers) => {
				expect(status).to.equal(302);
				done();
			};
			r.pipe(s);
		},

		'should set custom status' (done) {
			var r = Response.redirect('/hello', 307);
			var s = σ();
			s.writeHead = (status, headers) => {
				expect(status).to.equal(307);
				done();
			};
			r.pipe(s);
		}
	},
	
	'timeout': {
		'should set timeout'(done) {
			var r = Response([]).timeout(300);
			var s = σ();
			s.setTimeout = (timeout) => {
				expect(timeout).to.equal(300);
				done();
			};
			r.pipe(s);
		}
	}
};
