var spicedPg = require("spiced-pg");
var db = spicedPg("postgres:postgres:postgres@localhost:5432/petition");

// 'SELECT name FROM actors'
exports.getActors = function() {
    return db.query("SELECT * FROM actors");
};

exports.addActor = function(name, age) {
    return db.query("INSERT INTO actors (name, age) VALUES ($1, $2)", [
        name,
        age
    ]);
};
