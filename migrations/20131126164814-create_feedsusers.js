module.exports = {
  up: function(migration, DataTypes, done) {
    migration
      .createTable('feedsusers', {
        feed_id: {
          type: DataTypes.INTEGER
          , allowNull: false
          , primaryKey: true
        }
        , user_id: {
          type: DataTypes.INTEGER
          , allowNull: false
          , primaryKey: true
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
    done();
  }
}
