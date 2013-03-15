coverage:
	./node_modules/.bin/mocha  --require blanket -R html-cov --recursive test > ./coverage.html
	google-chrome ./coverage.html

cov: coverage

dev:
	NODE_ENV=development ./node_modules/.bin/nodemon -w . -e '.jade|.js|.styl' server.js

supper: test
	bash -c "time git push origin master" # use bash for human-readable timing

test:
	NODE_ENV=test ./node_modules/.bin/mocha --recursive test -R list

testwatch:
	./node_modules/.bin/chicken -c 'clear; time make test' .

.PHONY: cov coverage dev supper test testwatch
