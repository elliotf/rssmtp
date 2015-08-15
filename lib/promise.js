var BookPromise = require('bookshelf/lib/base/promise');
var KnexPromise = require('knex/lib/promise');

function unhandledRejectionHandler(err) {
  throw err;
}

BookPromise.onPossiblyUnhandledRejection(unhandledRejectionHandler);
KnexPromise.onPossiblyUnhandledRejection(unhandledRejectionHandler);

module.exports = KnexPromise;
