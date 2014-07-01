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

error = (fn, err, push)-->
	for thing in fn err
		push null thing

dev-err = (err)-> [
	Status 500
	err.stack
]

is-body = (in <[String Buffer]>) . (typeof!)

# handle :: (Request -> Result) -> (Request, Response) -> ()
handle = (handler, req, res)-->
	handler req
	.errors error dev-err
	.filter (part)-> match part
		| Status.is => res.status-code = part.code; false
		| Header.is => res.set-header ...part[\name \value]; false
		| is-body => true
	.pipe res

handle import {Status, Header}
module.exports = handle
