# Oban [![Build Status](https://travis-ci.org/quarterto/Oban.svg?branch=master)](https://travis-ci.org/quarterto/Oban)

Highland stream HTTP server. Builds on top of [`http`](https://nodejs.org/api/http.html) and [`highland`](http://highlandjs.org).

`npm install oban`

## Example

### Simple response
```javascript
var handle = require('oban');
var http   = require('http');
var resp   = require('oban-response');
var stream = require('highland')

http.createServer(handle(function(req) {
	return stream([
		resp.Status(200),
		resp.Header('X-Powered-By', 'Oban'),
		'hello world'
	]);
})).listen(8000);
```

### Remote service, stream transformation
```javascript
var request = require('request');

handle(function(req) {
	return stream([
		resp.Status(200)
	]).concat(
		stream(request('lorem.example.com'))
		.map(function(s) { return s.toUpperCase() })
	);
});
```

## API
Oban provides two functions to handle responses, `handle` and `handleWithError`. The former is simply the latter partially applied with a default error handler, which you'll want to override.

### `handleWithError :: (Error → Result) → (Request → Result) → Request → Response → ()`
Takes a Stream error handler and a Request handler which return Result streams. A Result is a Highland stream containing [Oban response](/quarterto/Oban-response) objects, Strings or Buffers. String and Buffer chunks are sent as body to the client.

### `handle :: (Request → Result) → Request → Response → ()`
Partially applied version of `handleWithError` with a default error handler. Good enough for development, but you'll want to override it if (God forbid) you put this in production. It's the main export of Oban to make it simple to switch:

```javascript
var handle = require('oban');
```

to

```javascript
var oban = require('oban');
var handle = oban.handleWithError(customErrorHandler);
```

#### Default error handler
The default error handler that `handle` uses simply sets the status code to 500 and prints the stack trace of the error to the client.

## Licence
MIT.
