var {expect} = require('chai').use(require('dirty-chai'));
var σ = require('highland');

var Response = require('./');

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
			s.writeHead = () => {};
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

	'ok': {
		'should set body' (done) {
			var R = Response.use({}, {
				body(body) {
					expect(body).to.equal('hello');
					done();
					return Response.body(body);
				}
			});

			R.ok('hello');
		},

		'should set 200 status' (done) {
			var r = Response.ok('');
			var s = σ();
			s.writeHead = (status, headers) => {
				expect(status).to.equal(200);
				done();
			};
			r.pipe(s);
		}
	},

	'notFound': {
		'should set body' (done) {
			var R = Response.use({}, {
				body(body) {
					expect(body).to.equal('hello');
					done();
					return Response.body(body);
				}
			});

			R.notFound('hello');
		},

		'should set 404 status' (done) {
			var r = Response.notFound('');
			var s = σ();
			s.writeHead = (status, headers) => {
				expect(status).to.equal(404);
				done();
			};
			r.pipe(s);
		}
	},

	'redirect': {
		'should set empty body' (done) {
			var R = Response.use({}, {
				body(body) {
					expect(body).to.be.empty();
					done();
					return Response.body(body);
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
	}
};
