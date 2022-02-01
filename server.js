var express = require("express");
var app = express();
var db = require("./db.js");
var md5 = require("md5");
const { linkType, get } = require("get-content");

var bodyParser = require("body-parser");
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

app.get("/api/music-data", (req, res, next) => {
  const url = "http://sysrad.net:6464/currentsong?sid=1";
  const MusicDataUrl =
    "https://ws.audioscrobbler.com/2.0/?method=track.getInfo&api_key=09659d39f048e5188ea96fb1ea76776e&artist=cher&track=believe&format=json";

  async function getAlbumImg() {
    let settings = { method: "Get" };

    fetch(MusicDataUrl, settings).then((res) => {
      var jsonRes = res.json();
    });
  }

  get(url)
    .then((pageContent) => {
      deleteHtml = pageContent.replace(/<\/?[^>]+(>|$)/g, "");
      res.json({
        message: "success",
        artist: "Mock Artist",
        music: "Mock Music",
        albumImg:
          "https://lastfm.freetls.fastly.net/i/u/300x300/3b54885952161aaea4ce2965b2db1638.png",
      });
    })
    .catch((err) => {
      res.status(400).json({ error: err.message });
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
  db.run(
    `UPDATE datamusic set 
            artist = coalesce(?,artist), 
            duration = COALESCE(?,duration),
            WHERE id = 0`,
    [data.artist, data.duration],
    (err, result) => {
      if (err) {
        //res.status(400).json({ error: res.message });
        return;
      }
      res.json({
        message: "success - datamusic up to date!",
      });
    }
  );
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
