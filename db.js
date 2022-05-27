import sqlite3 from "sqlite3";
import md5 from "md5";

const DBSOURCE = "db.sqlite";
let db = new sqlite3.Database(DBSOURCE, (err) => {
  if (err) {
    // Cannot open database sas
    console.error(err.message);
    throw err;
  } else {
    console.log("Connected to the SQlite database.");
    db.run(
      `CREATE TABLE user (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name text, 
            email text UNIQUE, 
            password text, 
            CONSTRAINT email_unique UNIQUE (email)
            )`,
      (err) => {
        if (err) {
          // Table already created
        } else {
          // Table just created, creating some rows
          var insert =
            "INSERT INTO user (name, email, password) VALUES (?,?,?)";
          db.run(insert, ["admin", "admin@example.com", md5("admin123456")]);
          db.run(insert, ["user", "user@example.com", md5("user123456")]);
        }
      }
    );
    db.run(
      `CREATE TABLE datamusic (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            artist text, 
            duration int
            )`,
      (err) => {
        if (err) {
        } else {
          // Table just created, creating some rows
          var insert =
            "INSERT INTO datamusic (artist, duration) VALUES (?,?,?)";
          db.run(insert, ["artist", "artist name"]);
          db.run(insert, ["duration", 0]);
        }
      }
    );

    db.run(
      `CREATE TABLE tokendb (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            token text
            )`,
      (err) => {
        if (err) {
        } else {
          // Table just created, creating some rows
          var insert = `INSERT INTO tokendb (token) VALUES ('firstToken')`;
          db.run(insert);
        }
      }
    );
  }
});

export default db;
