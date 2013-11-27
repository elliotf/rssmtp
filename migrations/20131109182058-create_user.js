module.exports = {
  up: function(migration, DataTypes, done) {
    migration
      .createTable('users', {
        id: {
          type: DataTypes.INTEGER
          , autoIncrement: true
          , primaryKey: true
          , allowNull: false
        }
        , email: {
          type: DataTypes.STRING(2048)
          , allowNull: false
        }
        , created_at: {
          type: DataTypes.DATE
          , allowNull: false
        }
        , updated_at: {
          type: DataTypes.DATE
          , allowNull: false
        }
      })
      .done(done)
  },
  down: function(migration, DataTypes, done) {
    //migration.dropTable('users').success(done);
    done();
  }
}
