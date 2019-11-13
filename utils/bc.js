// const bcrypt = require('bcryptjs');
// const { promisify } = require('util');
//
// const hash = promisify(bcrypt.hash);
// const genSalt = promisify(bcrypt.genSalt);
// var spicedPg = require("spiced-pg");
// var bc = spicedPg("postgres:postgres:postgres@localhost:5432/petition");
//
// // WILL BE CALLED IN THE POST REGISTRATION ROUTE //
// exports.hash = password => genSalt().then(
//     salt => hash(password, salt)
// );
//
//
// // WILL BE CALLED IN THE POST LOGIN ROUTE // THIS PART TAKES TWO ARRGUMENTS
// // (PASSWORD, AND HASHED PASSWORD FROM THE DATABASE)
// exports.compare = promisify(bcrypt.compare);
//
//
// exports.addUser = function(first, last, email, password) {
//     return bc.query("INSERT INTO users (first, last, email, password) VALUES ($1, $2, $3, $4) RETURNING ID", [
//         first,
//         last,
//         email,
//         password
//     ]);
// };
// exports.getUser = function(email) {
//     return bc.query("SELECT password, id FROM users WHERE email =$1", [
//         email
//     ]);
// };
