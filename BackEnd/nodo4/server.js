require("./config/config");

const rp = require("request-promise");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const _ = require("lodash");
const urlencodedParser = bodyParser.urlencoded({ extended: false });
const port = process.env.PORT;

var nextplayer = process.env.NEXT;
var app = express();

app.use(
  cors({
    origin: true,
    exposedHeaders: "x-access-token"
  })
);

app.use(bodyParser.json());

//endpoints
var nodeinfo = { haspapa: false };

app.post("/catchball", urlencodedParser, (req, res) => {
  let body = _.pick(req.body, ["ball"]);
  if (body.ball == "1") {
    nodeinfo.haspapa = true;
  } else {
    nodeinfo.haspapa = false;
  }

  let options = {
    method: "POST",
    uri: "http://localhost:" + nextplayer + "/catchball",
    resolveWithFullResponse: true,
    json: true,
    body: { ball: "1" }
  };

  setTimeout(function() {
    rp(options)
      .then(response => {
        nodeinfo.haspapa = false;
        console.log("La papa se ha  ido para " + nextplayer);
      })
      .catch(e => {
        console.log("Error pasando la papa a " + nextplayer);
      });
  }, 3000);

  res.json({ status: "success", message: "catchball" });
});

app.get("/endgame", urlencodedParser, (req, res) => {
  console.log(
    "El nodo: " +
      process.env.NAMENODE +
      ", " +
      (nodeinfo != null && nodeinfo.haspapa ? "" : "NO") +
      " tiene la papa"
  );

  res.json({ status: "success", message: "endgame" });
  process.exit(0);
});

app.post("/newplayer", urlencodedParser, (req, res) => {
  let body = _.pick(req.body, ["playernotified", "newplayer"]);
  if (body.playernotified != nextplayer) {
    // pass info of new player
    let options = {
      method: "POST",
      uri: "http://localhost:" + nextplayer + "/newplayer",
      resolveWithFullResponse: true,
      json: true,
      body: req.body
    };

    rp(options)
      .then(response => {
        console.log("pasamos la info para el siguiente  " + nextplayer);
      })
      .catch(e => {
        console.log("Error pasando la papa a " + nextplayer);
      });

  } else {
    nextplayer = body.newplayer.port;
  }

  res.json({ status: "success", message: "newplayer" });
  
});

// not match endpoints
app.get("/*", (req, res) => {
  res.status(404).send();
});

app.post("/*", (req, res) => {
  res.status(404).send();
});

app.put("/*", (req, res) => {
  res.status(404).send();
});

app.delete("/*", (req, res) => {
  res.status(404).send();
});

app.listen(port, () => {
  console.log(`Started on port ${port}`);
});
