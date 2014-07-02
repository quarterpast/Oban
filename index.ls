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

handle-error = (f, stream)-->
	stream.consume (e, x, p, n)->
		if e
			try n f e
			catch => p e
			p null global.nil # TODO ew
		else if x is global.nil
			p null global.nil
		else
			p null x
			n!

dev-err = (err)-> [
	Status 500
	err.stack
]

filter = (func, stream)--> stream.filter func
pipe   = (dest, stream)--> stream.pipe dest

is-body = (chunk)-> chunk instanceof Buffer or typeof chunk is \string

# handle-with-error :: (Error -> Result) -> (Request -> Result) -> (Request, Response) -> ()
handle-with-error = (err-handler, handler, req, res)-->
	handler req
	|> handle-error err-handler
	|> filter (part)-> match part
		| Status.is => res.status-code = part.code; false
		| Header.is => res.set-header ...part[\name \value]; false
		| is-body => true
	|> pipe res

handle = handle-with-error dev-err
handle import {
	Status,
	Header,
	Part,
	handle-with-error,
	handle
}
module.exports = handle
