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

var fichasJugadas = []

var fichasPropias = []

var jugador = 1;

app.get("/papa", urlencodedParser, (req, res) => {
  res.json({papa: nodeinfo.haspapa});
});

app.get("/jugador", urlencodedParser, (req, res) => {
  if (jugador == 1){
    res.json({jugador: true});
  } else {
    res.json({jugador: false});
  }
});

app.post("/jugador", urlencodedParser, (req, res) => {
  let body = _.pick(req.body, ["jugador"]);
  if (!jugador.jugador){
    jugador = 0;
  }
  res.json({ status: "success", message: "Comenzo el Juego" });
});

app.post("/repartir", urlencodedParser, (req, res) => {
  let body = _.pick(req.body, ["fichas"]);
  if ( body.fichas.lenght!=0){
    fichasPropias = body.fichas;
    console.log(fichasPropias);
  }
  res.json({ status: "success", message: "Se Repartio" });
});

app.get("/fichasP", urlencodedParser, (req, res) => {
  res.json({fichasP: fichasPropias});
});

app.post("/catchball", urlencodedParser, (req, res) => {
  let body = _.pick(req.body, ["ball"]);
  if (body.ball == "1") {
    nodeinfo.haspapa = true;
    console.log("llegoooo");
  } else {
    nodeinfo.haspapa = false;
  }

  /* let options = {
    method: "POST",
    uri: "http://localhost:" + nextplayer + "/catchball",
    resolveWithFullResponse: true,
    json: true,
    body: { ball: "1" }
  }; */

  /* setTimeout(function() {
    rp(options)
      .then(response => {
        nodeinfo.haspapa = false;
        console.log("La papa se ha  ido para " + nextplayer);
      })
      .catch(e => {
        console.log("Error pasando la papa a " + nextplayer);
      });
  }, 3000); */

  res.json({ status: "success", message: "catchball" });
});

app.post("/jugar", urlencodedParser, (req, res) => {
  let body = _.pick(req.body, ["valor"]);
  if (body.valor == "0") {
    console.log("No se ha jugado ninguna ficha");
  } else {
    fichasJugadas.push(body.valor);
    console.log(fichasJugadas);
  }

  res.json({ status: "success", message: "Se jugo la ficha" });
});

app.get("/jugadas", urlencodedParser, (req, res) => {
  res.json({fichasJ: fichasJugadas});
});

app.post("/pasar", urlencodedParser, (req, res) => {
  let body = _.pick(req.body, ["ball"]);
  if (body.ball == "1") {
    nodeinfo.haspapa = false;
    console.log("pasooooo");
  } else {
    nodeinfo.haspapa = true;
  }

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
