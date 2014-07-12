# data Part = Header { name :: String, value :: String }
#           | Status { code :: Number}
#           | Chunk Buffer
# type Result = Stream Part
class Part
	@is = (v)-> v instanceof this
class Header extends Part
	(@name, @value)~>
class Status extends Part
	(@code)~>

{nil} = require \highland

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
		| Status.is => res.status-code = part.code; false
		| Header.is => res.set-header ...part[\name \value]; false
		| is-body => true
	.pipe res

# handle :: (Request -> Result) -> (Request, Response) -> ()
handle = handle-with-error dev-err

module.exports = handle import {
	Status,
	Header,
	Part,
	handle-with-error,
	handle
}
