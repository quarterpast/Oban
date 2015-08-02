var {expect} = require('chai').use(require('dirty-chai'));

var Response = require('./');

exports['Response'] = {
	'should stream' (done) {
		var r = Response(['hello']);
		r.apply(x => {
			expect(x).to.equal('hello');
			done();
		});
	}
};
