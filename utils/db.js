var spicedPg = require("spiced-pg");
const bcrypt = require('./bcrypt');
var db = spicedPg(process.env.DATABASE_URL || "postgres:postgres:postgres@localhost:5432/petition");

exports.addSignature = function(user_id, signature) {
    return db.query(
        "INSERT INTO signatures (user_id, signature) VALUES ($1, $2) RETURNING ID",
        [user_id, signature]
    );
};

//
exports.getSignature = function(id) {
    return db.query("SELECT user_id,signature FROM signatures WHERE id =$1", [
        id
    ]);
};

// exports.addNames = function(first, last, email, password) {
//     return db.query(
//         "INSERT INTO signatures (first, last,email,password) VALUES ($1, $2,$3,44) RETURNING ID",
//         [first, last, email, password]
//     );
// };

// //
// exports.getNames = function(id) {
//     return db.query("SELECT first,last,email,password FROM signatures WHERE id =$1", [
//         id
//     ]);
// };
