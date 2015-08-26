export SHELL := "/bin/bash"
export PATH  := $(shell npm bin):$(PATH)

BABEL_OPTS = --optional es7.objectRestSpread

lib/%.js: src/%.js
	@mkdir -p $(@D)
	babel $(BABEL_OPTS) $< -o $@

all: lib/index.js

test: all test.js
	mocha -u exports -r babel/register

