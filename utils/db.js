const spicedPg = require("spiced-pg");
const bcrypt = require('bcryptjs');
const { promisify } = require('util');

const hash = promisify(bcrypt.hash);
const genSalt = promisify(bcrypt.genSalt);

const db = spicedPg(process.env.DATABASE_URL || "postgres:postgres:postgres@localhost:5432/petition");
// WILL BE CALLED IN THE POST REGISTRATION ROUTE //
exports.hash = password => genSalt().then(
    salt => hash(password, salt)
);

// WILL BE CALLED IN THE POST LOGIN ROUTE // THIS PART TAKES TWO ARRGUMENTS
// (PASSWORD, AND HASHED PASSWORD FROM THE DATABASE)
exports.compare = promisify(bcrypt.compare);
exports.addSignature = function(user_id, signature) {
    return db.query(
        "INSERT INTO signatures (user_id, signature) VALUES ($1, $2) RETURNING id",
        [user_id, signature]
    );
};

//
exports.getSignature = function(id) {
    return db.query("SELECT * FROM signatures where id=$1", [
        id
    ]);
};

exports.addUser = function(first, last, email, password) {
    return db.query("INSERT INTO users (first, last, email, password) VALUES ($1, $2, $3, $4) RETURNING id", [
        first,
        last,
        email,
        password
    ]);
};
exports.getUser = function(email) {
    return db.query(`SELECT * FROM users
    FULL OUTER JOIN signatures
    ON signatures.user_id = users.id
    WHERE email =$1`,[
        email
    ]);
};
