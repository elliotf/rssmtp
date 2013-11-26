# Development TODO

* Get rid of MongoDB
  * Write migration script(s)
  * Migrate user data
  * Remove mongoose-based models
  * Remove mongoose, mocha-mongoose
  * Remove mongoose from travis-ci
* add an Article factory to Feed (addArticleFromData or some such) to reduce cruft around building articles
* Implement Feed up to the level that Poller requires
* Sort out Feed's fetch/pull/merge/publish so it makes more sense
* Remove refetch from Admin UI
* Show some sort of summary to Admin UI
  * feeds
  * num subscribed to feed
  * users?
* intercom.io?
* Add Debug information to poller for console output or a log
