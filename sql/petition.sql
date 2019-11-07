DROP TABLE IF EXISTS actors;
CREATE TABLE actors(
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE CHECK(name != ''),
    age INT,
    "number of oscars" INT
);
INSERT INTO actors (name, age, "number of oscars") VALUES ('Leonardo DiCaprio', 41, 1);
INSERT INTO actors (name, age, "number of oscars") VALUES ('Jennifer Lawrence', 25, 1);
INSERT INTO actors (name, age, "number of oscars") VALUES ('Samuel L. Jackson', 67, 0);
INSERT INTO actors (name, age, "number of oscars") VALUES ('Meryl Streep', 66, 3);
INSERT INTO actors (name, age, "number of oscars") VALUES ('John Cho', 43, 0);
