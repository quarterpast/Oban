require! {
	'karma-sinon-expect'.expect
	handle: './index.js'
	'concat-stream'
	σ: highland
}

export 'Oban':
	'pipes string chunks to body': (done)->
		handle do
			-> σ <[ hello world ]>
			{}
			concat-stream (body)->
				expect body .to.be \helloworld
				done!

	'calls handler with the request': ->
		handle do
			handler = expect.sinon.stub!.returns σ []
			request = {}
			concat-stream ->

		expect handler .to.be.called-with request
