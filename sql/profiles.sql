DROP TABLE IF EXISTS profiles;
CREATE TABLE profiles(
    id SERIAL PRIMARY KEY,
    age INT,
    city VARCHAR (100),
    url VARCHAR (100),
    user_id INTEGER NOT NULL UNIQUE
    -- REFERENCES users(id) NOT NULL UNIQUE
);
