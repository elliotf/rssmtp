module.exports = {
  database: {
    // for sequelize
    dialect:  "mysql",
    username: "root",
    password: null,
    database: "rssmtp",
    host:     "127.0.0.1",

    //debug: true,

    // for bookshelf
    client: 'mysql2',
    connection: {
      database: 'rssmtp',
      user:     'root'
    }
  }
};
