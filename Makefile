coverage:
	NODE_ENV=test \
					 DB_TOKEN="coverage" \
					 GOOGLE_OAUTH_SECRET="test" \
					 GOOGLE_OAUTH_ID="test" \
					 GOOGLE_OAUTH_FQDN="test" \
					 APP_SECRET="test" \
					 APP_SMTP_SENDER="no-reply@example.com" \
					 ./node_modules/.bin/mocha  --require blanket -R html-cov --recursive test > coverage.html
	google-chrome coverage.html

cov: coverage

dev:
	NODE_ENV=development \
					./node_modules/.bin/nodemon -w . -e '.jade|.js|.styl' server.js

supper: test
	bash -c "time git push origin master" # use bash for human-readable timing

test:
	NODE_ENV=test \
					 GOOGLE_OAUTH_SECRET="test" \
					 GOOGLE_OAUTH_ID="test" \
					 GOOGLE_OAUTH_FQDN="test" \
					 APP_SECRET="test" \
					 APP_SMTP_HOST="smtp.example.com" \
					 APP_SMTP_PORT="465" \
					 APP_SMTP_SSL="true" \
					 APP_SMTP_FROM="no-reply@example.com" \
					 APP_SMTP_PASS="dummy password" \
					 ./node_modules/.bin/mocha --recursive test -R list

testwatch:
	DB_TOKEN="testwatch" ./node_modules/.bin/chicken -c 'clear; time make test' .

install:
	# for node.js
	sudo apt-get -y install python-software-properties
	sudo add-apt-repository -y ppa:chris-lea/node.js
	# for mongodb
	sudo apt-key adv --keyserver keyserver.ubuntu.com --recv 7F0CEB10
	sudo sh -c 'echo "deb http://downloads-distro.mongodb.org/repo/ubuntu-upstart dist 10gen" > /etc/apt/sources.list.d/10gen.list'
	# install packages
	sudo apt-get update
	sudo apt-get install -y build-essential mongodb-10gen nodejs
	npm install
	npm install mongodb --mongodb:native

.PHONY: cov coverage dev supper test testwatch
