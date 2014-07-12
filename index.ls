{Part, Status} = require \peat
{nil}  = require \highland

# handle-error :: (Error → Stream a) → Stream a → Stream a
handle-error = (f, stream)-->
	stream.consume (e, x, p, n)->
		if e
			try n f e
			catch e2
				p e2
				p null nil
		else if x is nil
			p null nil
		else
			p null x
			n!

# dev-err :: Error → Result
dev-err = (err)-> [
	Status 500
	err.stack
]

# is-body :: Part → Boolean
is-body = (chunk)-> chunk instanceof Buffer or typeof chunk is \string

# handle-with-error :: (Error -> Result) -> (Request -> Result) -> (Request, Response) -> ()
handle-with-error = (err-handler, handler, req, res)-->
	handle-error err-handler, handler req
	.filter (part)-> match part
		| Part.is => that.run res; false
		| is-body => true
	.pipe res

# handle :: (Request -> Result) -> (Request, Response) -> ()
handle = handle-with-error dev-err

module.exports = handle import {
	handle-with-error,
	handle
}
