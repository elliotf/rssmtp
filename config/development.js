module.exports = {
  database: {
    // for sequelize
    dialect: "sqlite",
    username: "root",
    password: null,
    database: "database_test",
    host:     "127.0.0.1",

    // for bookshelf
    client: 'sqlite',
    connection: {
      filename: ':memory:'
    }
  }
};
