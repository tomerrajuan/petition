const bcrypt = require('bcryptjs');
const { promisify } = require('util');

const hash = promisify(bcrypt.hash);
const genSalt = promisify(bcrypt.genSalt);

// WILL BE CALLED IN THE POST REGISTRATION ROUTE //
exports.hash = password => genSalt().then(
    salt => hash(password, salt)
);


// WILL BE CALLED IN THE POST LOGIN ROUTE // THIS PART TAKES TWO ARRGUMENTS
// (PASSWORD, AND HASHED PASSWORD FROM THE DATABASE)
exports.compare = promisify(bcrypt.compare);
