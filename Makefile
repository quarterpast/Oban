export SHELL := "/bin/bash"
export PATH  := $(shell npm bin):$(PATH)

SRC_FILES = $(wildcard src/*.js)
LIB_FILES = $(patsubst src/%.js, lib/%.js, $(SRC_FILES))

lib/%.js: src/%.js
	@mkdir -p $(@D)
	babel $(BABEL_OPTS) $< -o $@

all: $(LIB_FILES)

test: all test.js
	mocha -u exports -r babel/register

