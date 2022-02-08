import express from "express";
var app = express();
import db from "./db.js";
import md5 from "md5";
import fetch from "node-fetch";

import bodyParser from "body-parser";
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var HTTP_PORT = 8000;

// Start server
app.listen(HTTP_PORT, () => {
  console.log("Server running on port %PORT%".replace("%PORT%", HTTP_PORT));
});

app.get("/api/users", (req, res, next) => {
  var sql = "select * from user";
  var params = [];
  db.all(sql, params, (err, rows) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: "success",
      data: rows,
    });
  });
});

app.get("/api/music-data-db", (req, res, next) => {
  var sql = "select * from datamusic";
  var params = [];
  db.all(sql, params, (err, rows) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: "success",
      data: rows,
    });
  });
});
app.get("/api/insert", (req, res, next) => {
  db.run(`INSERT INTO datamusic VALUES(NULL,'SJPFM', '25')`, (err, result) => {
    if (err) {
      return;
    }
    res.json({
      message: "success - insert data!",
    });
  });
});

app.get("/api/music-data", (req, res, next) => {
  const url = "http://sysrad.net:6464/currentsong?sid=1";
  const MusicDataUrl =
    "https://ws.audioscrobbler.com/2.0/?method=track.getInfo&api_key=09659d39f048e5188ea96fb1ea76776e&artist=cher&track=believe&format=json";

  async function getAlbumImg() {
    let settings = { method: "GET" };

    fetch(MusicDataUrl, settings).then((res) => {
      var jsonRes = res.json();
    });
  }

  var sql = "SELECT artist FROM datamusic WHERE id = 1";
  var params = [];
  db.get(sql, params, (err, row) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    let splitMusic = row.artist.split("-");

    let userToken =
      "BQDBWCOmYUNy83UxItOhbftsjt9HRhILnlqjDzh8hLlzeeSh3gIs7njp8fpeB7g9Iox8IzqDInLb7wM42QkjEcEiBlwiCDtvyDxiFVeZgz_d9Chbe85zt9SGQ1NB12WCT0uyi9hr1NDfQXyrCvQiBj6ClIliEGWhg9i136no8NFMxxhry_5Bzo1yYvdaa60jJyfb3MapE4wd7cRPW0eC5KGlpI7I8CUMw2hzFtfoYnlKp6i9Pl4KwabS1xDSihSDnqYmBgV8ntfI6Lk31m2jNEo";

    let requestOptions = {
      method: "GET",
      headers: { authorization: `Bearer ${userToken}` },
      redirect: "follow",
    };

    fetch(
      `https://api.spotify.com/v1/search?q=${splitMusic[0]}%20${splitMusic[1]}&type=track%2Cartist&limit=1`,
      requestOptions
    )
      .then((response) => response.text())
      .then((result) => {
        let resultImg = JSON.parse(result);
        const getImageUrl = resultImg.tracks.items[0].album.images[0].url;
        console.log(resultImg.tracks.items[0].album.images[0].url);
        res.json({
          message: "success",
          artist: splitMusic[0],
          music: splitMusic[1],
          albumImg: getImageUrl,
        });
      })
      .catch((error) => console.log("error", error));
  });
});

app.get("/api/user/:id", (req, res, next) => {
  var sql = "select * from user where id = ?";
  var params = [req.params.id];
  db.get(sql, params, (err, row) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: "success",
      data: row,
    });
  });
});

app.post("/api/user/", (req, res, next) => {
  var errors = [];
  if (!req.body.password) {
    errors.push("No password specified");
  }
  if (!req.body.email) {
    errors.push("No email specified");
  }
  if (errors.length) {
    res.status(400).json({ error: errors.join(",") });
    return;
  }
  var data = {
    name: req.body.name,
    email: req.body.email,
    password: md5(req.body.password),
  };
  var sql = "INSERT INTO user (name, email, password) VALUES (?,?,?)";
  var params = [data.name, data.email, data.password];
  db.run(sql, params, function (err, result) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: "success",
      data: data,
      id: this.lastID,
    });
  });
});

app.patch("/api/user/:id", (req, res, next) => {
  var data = {
    name: req.body.name,
    email: req.body.email,
    password: req.body.password ? md5(req.body.password) : undefined,
  };
  db.run(
    `UPDATE user set 
           name = coalesce(?,name), 
           email = COALESCE(?,email), 
           password = coalesce(?,password) 
           WHERE id = ?`,
    [data.name, data.email, data.password, req.params.id],
    (err, result) => {
      if (err) {
        res.status(400).json({ error: res.message });
        return;
      }
      res.json({
        message: "success",
        data: data,
      });
    }
  );
});

app.patch("/api/update-sdr", (req, res, next) => {
  var data = {
    artist: req.body.artist,
    duration: req.body.duration,
  };
  var sql =
    `UPDATE datamusic SET artist='` +
    data.artist +
    `', duration='` +
    data.duration +
    `' WHERE id='1'`;
  console.log(sql);
  db.run(sql, [], (err, result) => {
    if (err) {
      return;
    }
    res.json({
      message: "success - datamusic up to date!",
      data: result,
    });
  });
});

app.delete("/api/user/:id", (req, res, next) => {
  db.run(
    "DELETE FROM user WHERE id = ?",
    req.params.id,
    function (err, result) {
      if (err) {
        res.status(400).json({ error: res.message });
        return;
      }
      res.json({ message: "deleted", rows: this.changes });
    }
  );
});

// Root path
app.get("/", (req, res, next) => {
  res.json({ message: "Ok" });
});
