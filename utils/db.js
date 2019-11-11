var spicedPg = require("spiced-pg");
var db = spicedPg("postgres:postgres:postgres@localhost:5432/petition");

// 'SELECT name FROM actors'
// exports.getActors = function() {
//     return db.query("SELECT * FROM actors");
// };

exports.addSignature = function(first_name, last_name, signature) {
    return db.query("INSERT INTO signatures (first_name, last_name, signature) VALUES ($1, $2, $3) RETURNING ID", [
        first_name,
        last_name,
        signature
    ]);
};

//
exports.getSignature = function(id) {
    return db.query("SELECT first_name,last_name,signature FROM signatures WHERE id =$1", [
        id
    ]);
};
// exports.getNames = function(first_name, last_name, signature) {
//     return db.query("SELECT first_name, last_name, signature FROM signatures WHERE id = $1, $2, $3", [
//         first_name,
//         last_name,
//         signature
//     ]);
// };
// exports.getLastName = function(id) {
//     return db.query("SELECT last_name FROM signatures WHERE id =$1", [
//         id
//     ]);
// };
// exports.getLastName = function(id) {
//     return db.query("SELECT first_name FROM signatures WHERE id =$1", [
//         id
//     ]);
// };
