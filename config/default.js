module.exports = {
  database: {
    // for sequelize
    dialect: "sqlite",
    username: "root",
    password: null,
    database: "db.sqlite",
    host:     "127.0.0.1",
    storage:  __dirname + "/../dev-db.sqlite",

    // for bookshelf
    client: 'sqlite',
    connection: {
      filename: __dirname + "/../dev-db.sqlite",
    }
  }
};
