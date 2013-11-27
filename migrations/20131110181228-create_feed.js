module.exports = {
  up: function(migration, DataTypes, done) {
    migration
      .createTable('feeds', {
        id: {
          type: DataTypes.INTEGER
          , autoIncrement: true
          , primaryKey: true
          , allowNull: false
        }
        , url: {
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
    //migration.dropTable('feeds').success(done);
    done();
  }
}
