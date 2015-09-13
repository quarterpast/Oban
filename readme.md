<h1 align="center">
<img src="logo.png" alt="Oban">

<a href="https://travis-ci.org/quarterto/Oban">
	<img alt="Build Status" src="https://travis-ci.org/quarterto/Oban.svg?branch=master">
</a>
</h1>

Highland stream HTTP server. Builds on top of [`http`](https://nodejs.org/api/http.html) and [`highland`](http://highlandjs.org).

`npm install oban`

## Example

### Simple response
```javascript
var Response = require('oban');
var server   = require('oban/server');

server(function(req) {
	return Response.ok('hello world').header('x-powered-by', 'Oban');
}).listen(8000);
```

### Real-world streaming example
```javascript
var request = require('request');

server(function(req) {
	return Response(request('lorem.example.com'))
		.map(function(s) { return s.toUpperCase() });
});
```

### File streaming
```javascript
server(function(req) {
	switch(req.url) {
		case 'foo.png':
			return Response.file('foo.png');
		default:
			return Response.notFound(req.url + ' not found');
	}
});
```

### URL routing using [Boulevard](/quarterto/Boulevard)
```js
var route = require('boulevard');
server(route({
	'/': function(req) {
		return Response.ok('home');
	},

	'/post/:id': function(req, params) {
		// here, Post.get returns a promise
		return Response(Post.get(params.id)).map(postTemplate);
	}
})); 
```

## API
### Server
##### `server :: (Request → Response) → HTTPServer`
Wraps the function in piping and error handling logic and passes it to `http.createServer`. The default error handler simply sends a 500 response with the error stack in the body, so you'll probably want to override it for production (eek).

##### `server.withCreateServer :: ∀ a. (((Request → Response) → ()) → a) → (Request → Response) → a`
Takes a function that looks like `http.createServer` and returns a version of `server` that uses it to create things. Useful if you want to use HTTPS or something.

##### `server.withErrorHandler :: (Error → Response) → (Request → Response) → HTTPServer`
Returns a version of `server` using the given error handler. The handler receives any error that is thrown within your server, and should return a response to send instead of your server's usual response.

##### `server.server_ :: {errorHandler, createServer} → (Request → Response) → HTTPServer`
Lets you override both options at once.

### Response
#### Builders
Functions that easily construct simple responses.

##### HTTP status methods
Every named HTTP status has a corresponding builder that takes a body as its argument. Useful stati include `Response.ok`, `Response.notFound` and `Response.imATeapot`.

##### `Response.body :: (Stream | Buffer | Array | String) → Response`
Response containing the argument as body.

##### `Response.empty :: () → Response`
Response that immediately ends.

##### `Response.redirect :: URL → StatusCode? → Response`
Response with a `location` header and status (default 302 FOUND) given by the arguments.

##### `Response.file :: Filepath → Response`
Streams the given file to the response, with correct `content-type` header.

#### Methods
Functions available on Response instances. All of them `return this` for chaining.

##### `header :: HeaderName → Any → Response`
Sets the header to the value. If called multiple times for the same header, the header is sent multiple times.

##### `headers :: Map HeaderName Any → Response`
Set an entire object full of headers at once.

#####


## Hic sunt dracones
Oban 1.0 depends on the as-yet unreleased Highland 3.0. It should not be considered production-ready.

## Licence
MIT.
