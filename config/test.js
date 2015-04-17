module.exports = {
  database: {
    // sequelize
    dialect: "sqlite",
    username: "root",
    password: null,
    database: "database_test",
    host: "127.0.0.1",
    storage: '',

    // for bookshelf
    client: 'sqlite',
    connection: {
      filename: ':memory:'
    }
  }
};
