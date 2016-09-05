var pg = require('pg');

module.exports = {
  importantQuerys: {
    deleteAll: 'DELETE FROM sunshine',
    deleteById: 'DELETE FROM sunshine WHERE id = $1',
    createTable: 'CREATE TABLE sunshine (id serial primary key, url VARCHAR(200) not null, timestamp timestamp default current_timestamp )',
    getAll: 'SELECT * FROM sunshine',
    insert: 'INSERT INTO sunshine (url) VALUES($1) RETURNING *'
  },
  query: function(queryText, passVals, cb) {
    if (!cb) { cb = passVals; passVals = []; }  // optional param
    pg.connect(process.env.DATABASE_URL + "?ssl=true", function(err, client, done) {
      if (err) {
        return cb(err);
      }
      client.query(queryText, passVals, function(err, result) {
        cb(err, result);
        done();
      });
    });
  },
  run: function(queryName, cb) {
    this.query(this.importantQuerys[queryName], cb);
  },
  addPost: function(url, cb) {
    console.log('adding ' + url);
    this.query(this.importantQuerys.insert, [url], cb);
  },
  deletePost: function(id, cb) {
    console.log('deleting ' + id);
    this.query(this.importantQuerys.deleteById, [id], cb);
  }
}
