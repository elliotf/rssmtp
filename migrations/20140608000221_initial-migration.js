
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

    table.timestamps();
  }));

  todo.push(knex.schema.createTable('feedsusers', function(table){
    table.increments('id').primary().unsigned();

    table.integer('user_id').notNullable().unsigned();
    table.integer('feed_id').notNullable().unsigned();

    table.timestamps();
  }));

  todo.push(knex.schema.createTable('articles', function(table){
    table.increments('id').primary().unsigned();

    table.integer('feed_id').notNullable().unsigned();

    table.timestamps();
  }));

  return Promise.all(todo);
};

exports.down = function(knex, Promise) {
};

/*

CREATE TABLE `feeds` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `url` VARCHAR(2048),
  `name` VARCHAR(2048) NOT NULL DEFAULT 'unnamed feed',
  `last_fetched` DATETIME NOT NULL,
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME NOT NULL
);

CREATE TABLE `articles` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `link` VARCHAR(2048),
  `title` VARCHAR(2048) NOT NULL DEFAULT 'untitled article',
  `description` TEXT NOT NULL DEFAULT 'this article does not have content',
  `date` DATETIME NOT NULL,
  `guid` VARCHAR(255) NOT NULL,
  `feed_id` INTEGER NOT NULL REFERENCES `feeds` (`id`),
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME NOT NULL
);

CREATE TABLE `feedsusers` (
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME NOT NULL,
  `feed_id` INTEGER NOT NULL,
  `user_id` INTEGER NOT NULL,
  PRIMARY KEY (`feed_id`, `user_id`)
);
*/
