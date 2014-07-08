require! {
	'karma-sinon-expect'.expect
	handle: './index.js'
	'concat-stream'
	σ: highland
}

export 'Oban':
	'calls handler with the request': ->
		handle do
			handler = expect.sinon.stub!.returns σ []
			request = {}
			concat-stream ->

		expect handler .to.be.called-with request

	'pipes string chunks to body': (done)->
		handle do
			-> σ <[ hello world ]>
			{}
			concat-stream (body)->
				expect body .to.be \helloworld
				done!

	'sets status to Status chunks': (done)->
		handle do
			-> σ [handle.Status 153]
			{}
			res = concat-stream (body)->
				expect res .to.have.property \statusCode 153
				done!

	'sets headers to Header chunks': (done)->
		res = concat-stream (body)->
			expect res.set-header .to.be.called-with \X-Test \foo
			done!
		res.set-header = expect.sinon.stub!
		handle do
			-> σ [handle.Header \X-Test \foo]
			{}
			res

	'pipes buffer chunks to body': (done)->
		handle do
			-> σ [
				new Buffer 'hello'
				new Buffer 'world'
			]
			{}
			concat-stream (body)->
				expect body.to-string! .to.be \helloworld
				done!

	'handles async streams': (done)->
		handle do
			-> σ (push)->
				set-timeout (-> push null \hello), 5
				set-timeout (-> push null \world), 10
				set-timeout (-> push global.nil ), 15
			{}
			concat-stream (body)->
				expect body .to.be \helloworld
				done!

	'sends error stack for stream errors': (done)->
		e = new Error 'lol'
		handle do
			-> σ (push)->
				push e
				push global.nil
			{}
			concat-stream (body)->
				expect body .to.be e.stack
				done!
	
	'sets status code to 500 for stream errors': (done)->
		e = new Error 'lol'
		handle do
			-> σ (push)->
				push e
				push global.nil
			{}
			res = concat-stream (body)->
				expect res .to.have.property \statusCode 500
				done!

	'handle-with-error allows setting custom error handler': (done)->
		handle.handle-with-error do
			-> σ ['error']
			-> σ (push)-> push new Error; push global.nil
			{}
			concat-stream (body)->
				expect body .to.be 'error'
				done!
