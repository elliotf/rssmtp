module.exports = {
  database: {
    // for sequelize
    dialect:  "mysql",
    username: "travis",
    password: null,
    database: "rssmtp",
    host:     "127.0.0.1",

    // for bookshelf
    client: 'mysql2',
    connection: {
      database: 'rssmtp',
      user:     'travis'
    }
  }
};
