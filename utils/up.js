var spicedPg = require("spiced-pg");
var up = spicedPg("postgres:postgres:postgres@localhost:5432/petition");

exports.addProfile = function(age, city, url, user_id) {
    return up.query(
        "INSERT INTO profiles (age, city, url, user_id) VALUES ($1, $2, $3, $4) RETURNING id",
        [age, city, url, user_id]
    );
};
exports.getProfile = function(age, city, url, user_id) {
    return up.query("SELECT user_id, id FROM profiles WHERE email =$1", [
        age,
        city,
        url,
        user_id
    ]);
};

exports.getCombined = function() {
    return up.query(
        `SELECT * FROM users JOIN signatures ON users.id = signatures.user_id
        LEFT OUTER JOIN profiles ON signatures.user_id =profiles.user_id`
    );
};
exports.getCombinedProfile = function(id) {
    console.log("id is:", id);
    return up.query(
        `SELECT * FROM users
        LEFT JOIN profiles
        ON users.id = profiles.user_id
        WHERE users.id=$1`,[id]
    );
};

exports.addProfileUsers = function(first,last,email,id) {
    console.log("results are:",first,last,email,id);
    return up.query(
        `UPDATE users SET first=$1,last=$2,email=$3 WHERE id=$4`, [first,last,email,id]
    );
};
exports.addProfileUsersPass = function(first,last,email,password,id) {
    return up.query(
        `UPDATE users SET first=$1,last=$2,email=$3,password=$4 WHERE id=$5`, [first,last,email,password,id]
    );
};
exports.addProfile = function(age,city,url,user_id) {
    return up.query(
        `INSERT INTO profiles (age,city,url,user_id)
VALUES ($1,$2,$3,$4)
ON CONFLICT (user_id)
DO UPDATE SET age=$1,city=$2,url=$3`, [age,city,url,user_id]
    );
};

exports.deleteSignature = function(id) {
    return up.query(
        `DELETE FROM signatures WHERE user_id=$1`, [id]
    );
};

exports.selectCount = function() {
    return up.query(
        `SELECT COUNT (*) FROM signatures`
    );
};
exports.getSignersCity = function(id) {
    console.log(id);
    return up.query(
        `SELECT users.first,users.last,users.email,
        profiles.city,profiles.age,profiles.url
        FROM signatures
        LEFT JOIN users ON users.id = signatures.user_id
        LEFT OUTER JOIN profiles
        ON signatures.user_id =profiles.user_id
        WHERE LOWER (city) = LOWER($1)`, [id]
    );
};
