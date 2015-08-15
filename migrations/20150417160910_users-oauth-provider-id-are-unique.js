'use strict';

exports.up = function(knex, Promise) {
  return knex.schema.raw("ALTER TABLE users MODIFY COLUMN oauth_provider VARCHAR(255) NOT NULL")
  .then(function() {
    return knex.schema.raw("ALTER TABLE users MODIFY COLUMN oauth_id VARCHAR(255) NOT NULL")
  })
  .then(function() {
    return knex.schema.table('users', function(table) {
      table.unique(['oauth_provider', 'oauth_id'], 'ux_oauth_provider_oauth_id');
    });
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table('users', function(table) {
    table.dropUnique(['oauth_provider', 'oauth_id'], 'ux_oauth_provider_oauth_id');
  });
};
