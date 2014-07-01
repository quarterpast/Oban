export SHELL := "/bin/bash"
export PATH  := $(shell npm bin):$(PATH)

%.js: %.ls
	lsc -c $<

all: index.js

test: all test.ls
	mocha -u exports -r LiveScript test.ls

