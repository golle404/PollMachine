#Poll Machine - freeCodeCamp project

App where user can create multiple private or public polls,
manage them and view results.

Test page - https://poll-machine-golle404.c9users.io/home

This project is build as part of freeCodeCamp curriculum.

Frameworks and libraries used:

- node.js
- express.js
- mongodb database
- passport.js
- bootstrap
- jQUery

current version 0.4.8

Usage

download with 

	git pull https://github.com/golle404/PollMachine.git
	
install

	npm install
	
then	

	bower install
	
	
edit app/_oauth.js to include you own API keys and rename file to "oauth.js" (without underscore)

edit _.env if needed and rename file to ".env" (without underscore)

if on windows you can start both server (with nodemon) and mongo with 

	npm start
	
otherwise start separately

	node index.js
	
	mongod
