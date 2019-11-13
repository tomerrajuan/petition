var spicedPg = require("spiced-pg");
var up = spicedPg("postgres:postgres:postgres@localhost:5432/petition");
exports.addProfile = function(age, city, url, user_id) {
    return up.query(
        "INSERT INTO profiles (age, city, url, user_id) VALUES ($1, $2, $3, $4) RETURNING ID",
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

exports.getCombined = function(user_id) {
    return up.query(
        `SELECT * FROM users
FULL OUTER JOIN profiles
ON profiles.user_id = users.id
WHERE user_id =$1`,[user_id]
    );
};
