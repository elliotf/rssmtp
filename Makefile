coverage:
	NODE_ENV=test \
					 DB_TOKEN="coverage" \
					 GOOGLE_OAUTH_SECRET="test" \
					 GOOGLE_OAUTH_ID="test" \
					 GOOGLE_OAUTH_FQDN="test" \
					 APP_FQDN="testing-fqdn.rssmtp.example.com" \
					 APP_SECRET="test" \
					 APP_SMTP_HOST="smtp.example.com" \
					 APP_SMTP_PORT="465" \
					 APP_SMTP_SSL="true" \
					 APP_SMTP_FROM="no-reply@example.com" \
					 APP_SMTP_PASS="dummy password" \
					 ./node_modules/.bin/mocha  --require blanket -R html-cov --recursive test > coverage.html
					 #./node_modules/.bin/mocha  --recursive test
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
					 APP_FQDN="testing-fqdn.rssmtp.example.com" \
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
	# install packages
	sudo apt-get update
	sudo apt-get install -y build-essential nodejs
	npm install

.PHONY: cov coverage dev supper test testwatch
