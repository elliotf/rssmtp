module.exports = {
  database: {
    // for sequelize
    dialect: "postgres",
    username: "rssmtp",
    password: "password_here",
    database: "rssmtp_production",
    host: "127.0.0.1",

    // for bookshelf
    client: 'pg',
    connection: {
      host: "127.0.0.1",
      username: "rssmtp",
      password: "password_here",
      database: "rssmtp_production"
    }
  }
};
