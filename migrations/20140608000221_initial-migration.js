
exports.up = function(knex, Promise) {
  var todo = [];

  todo.push(knex.schema.createTable('users', function(table){
    table.increments('id').primary().unsigned();

    table.string('email',2048).notNullable();
    table.string('oauth_provider',2048).notNullable();
    table.string('oauth_id',2048).notNullable();

    table.timestamps();
  }));

  todo.push(knex.schema.createTable('feeds', function(table){
    table.increments('id').primary().unsigned();

    table.string('url',2048).notNullable();
    table.string('name',2048).notNullable();

    table.datetime('last_fetched').notNullable();

    table.timestamps();
  }));

  todo.push(knex.schema.createTable('feedsusers', function(table){
    table.increments('id').primary().unsigned();

    table.integer('user_id').notNullable().unsigned();
    table.integer('feed_id').notNullable().unsigned();

    table.index(['user_id','feed_id'], 'ix_user_id_feed_id');
    table.index(['feed_id','user_id'], 'ix_feed_id_user_id');

    table.timestamps();
  }));

  todo.push(knex.schema.createTable('articles', function(table){
    table.increments('id').primary().unsigned();

    table.datetime('date').notNullable();
    table.string('guid').notNullable();
    table.string('link',2048);
    table.string('title',2048).notNullable().defaultTo('untitled article');
    table.text('description').defaultTo('this article does not have content');

    table.integer('feed_id').notNullable().unsigned();

    table.timestamps();
  }));

  return Promise.all(todo);
};

exports.down = function(knex, Promise) {
};
