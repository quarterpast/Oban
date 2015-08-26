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
	}
};
