dev:
	NODE_ENV=development ./node_modules/.bin/nodemon -w . -e '.jade|.js|.styl' server.js

supper: test
	bash -c "time git push origin master" # use bash for human-readable timing

test:
	./node_modules/.bin/mocha --recursive test/app.js test/routes test/models -R list

testwatch:
	./node_modules/.bin/chicken -c 'clear; time make test' .

.PHONY: dev supper test testwatch
