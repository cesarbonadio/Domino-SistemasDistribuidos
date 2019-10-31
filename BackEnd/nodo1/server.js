require("./config/config");

const rp = require("request-promise");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const _ = require("lodash");
const urlencodedParser = bodyParser.urlencoded({ extended: false });
const port = process.env.PORT;

var nextplayer = process.env.NEXT;

//arreglo de puertos
var portlist = ["192.168.8.100:10001","192.168.8.102:10001","192.168.8.103:10001"];

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


//nombre de usuario de cada jugador
var userName = '';

//partidas
var matches = [];

//fichas
pieces = [
  '0:0','1:0','1:1','2:0','2:1','2:2','3:0',
  '3:1','3:2','3:3','4:0','4:1','4:2','4:3',
  '4:4','5:0','5:1','5:2','5:3','5:4','5:5',
  '6:0','6:1','6:2','6:3','6:4','6:5','6:6'
]


//post para nombre de usuario
app.post("/username", urlencodedParser, (req,res) => {
  let body = _.pick(req.body, ["userName"]);
  userName = body.userName;
  console.log(userName);
  res.json({ status: "success", message: "Se Creo el usuario" });
});

//get para el nombre del usuario
app.get("/username", urlencodedParser, (req, res) => {
  res.json({userName: userName});
});


//post para crear partida
app.post("/creatematch", urlencodedParser, (req,res) => {
  let body = _.pick(req.body, ["players"]);
  let match = {
    id: matches.length+1,
    matchName: "Partida " + String(matches.length+1),
    turn: 0,
    players: body.players,
    status: "En Espera",
    winner: "N/A",
    piecesPlayed: []
  }

  for(let i = 0; i < portlist.length; i++){
    let options = {
      method: "POST",
      uri: "http://" + portlist[i] + "/newmatch",
      resolveWithFullResponse: true,
      json: true,
      body: match 
    };
    rp(options)
      .then(response => {
        console.log("Pasamos informacion de partida creada ");
      })
      .catch(e => {
        console.log("Error pasando informacion de creacion de partida");
      });  
  }
  res.json({ status: "success", message: "Se Creo la partida" });
});

//post para registrar partidas creadas
app.post("/newmatch", urlencodedParser, (req,res) => {
  let body = req.body;
  matches.push(body);
  console.log(body);
  console.log(matches);
  res.json({ status: "success", message: "Se registro la partida" });
});

//get para obtener la lista de partidas
app.get("/matches", urlencodedParser, (req, res) => {
  res.json({matches: matches});
});

//put para solicitar unirse a una partida
app.put("/matches/:id", urlencodedParser, (req,res) => {
  var id = req.params.id;
  var ids = [parseInt(id)];
  var match = matches.filter(function(el){ return ~ids.indexOf(el.id)});
  //var match = matches.filter(x => x.id === id);
  let body = _.pick(req.body, ["player"]);

  match[0].status = "Listos";
  match[0].players.push(body.player)

  for(let i = 0; i < portlist.length; i++){
    let options = {
      method: "POST",
      uri: "http://" + portlist[i] + "/matches/"+id+"/join",
      resolveWithFullResponse: true,
      json: true,
      body: match
    };
    rp(options)
      .then(response => {
        console.log("Pasamos informacion de unio a partida");
      })
      .catch(e => {
        console.log("Error pasando informacion de union a partida");
      });  
  }
  res.json({ status: "success", message: "Se esta uniendo a la partida" });
});



//post para unirse a una partida
app.post("/matches/:id/join", urlencodedParser, (req,res) => {
  var id = req.params.id;
  var ids = [parseInt(id)];
  var elementPos = matches.map(function(x) {return x.id; }).indexOf(parseInt(id));
  let body = req.body;
  matches[elementPos] = body[0]
  console.log(matches);
  res.json({ status: "success", message: "Se unio a la partida" });
});



//post para barajear fichas de una partida
app.post("/matches/:id/distribute", urlencodedParser, (req,res) => {
  var id = req.params.id;
  var ids = [parseInt(id)];
  var match = matches.filter(function(el){ return ~ids.indexOf(el.id)});

  var playersLength = match[0].players.length;
  let piecesCopy = pieces.slice(0);;

  piecesCopy = piecesCopy.sort(function() {return Math.random() - 0.5});
  let n = piecesCopy.length/playersLength;

  console.log(pieces)
  console.log(piecesCopy);

  var piecesPlayers = split(piecesCopy, n);

  for(let i = 0; i < portlist.length; i++){
    let options = {
      method: "POST",
      uri: "http://" + portlist[i] + "/matches/"+id+"/distributed",
      resolveWithFullResponse: true,
      json: true,
      body: piecesPlayers
    };
    rp(options)
      .then(response => {
        console.log("Pasamos informacion de las piezas a partida");
      })
      .catch(e => {
        console.log("Error pasando informacion de las piezas a partida");
      });  
  }

  res.json({ status: "success", message: "Se pasaron a las fichas a la partida" });
});



//post para recibir las fichas 
app.post("/matches/:id/distributed", urlencodedParser, (req,res) => {
  var id = req.params.id;
  var ids = [parseInt(id)];
  var elementPos = matches.map(function(x) {return x.id; }).indexOf(parseInt(id));
  let body = req.body;
  console.log(body);

  matches[elementPos].status = "Jugando";
  matches[elementPos].turn = 1;

  for(let i=0; i< body.length; i++){
    matches[elementPos].players[i].pieces = body[i];
  }
  console.log(matches);
  res.json({ status: "success", message: "Se recibieron las fichas a la partida" });
});

//post para actualizar las jugadas 
app.post("/matches/:id/playpiece", urlencodedParser, (req,res) => {
  var id = req.params.id;
  var elementPos = matches.map(function(x) {return x.id; }).indexOf(parseInt(id));
  var body = _.pick(req.body, ["turn", "pieces", "piece"]);
  var jugador = body.turn - 1;
  
  if(matches[elementPos].turn + 1 > matches[elementPos].players.length){
    matches[elementPos].turn = 1;
  }else{
    matches[elementPos].turn = matches[elementPos].turn + 1;
  }
  if(body.piece != ''){
    matches[elementPos].piecesPlayed.push(body.piece);
    matches[elementPos].players[jugador].pieces = body.pieces;
  }

  for(let i = 0; i < portlist.length; i++){
    let options = {
      method: "POST",
      uri: "http://" + portlist[i] + "/matches/playedpiece",
      resolveWithFullResponse: true,
      json: true,
      body: matches
    };
    rp(options)
      .then(response => {
        console.log("Pasamos informacion de la pieza jugada en la partida");
      })
      .catch(e => {
        console.log("Error pasando informacion de la pieza jugada en la partida");
      });  
  }
  res.json({ status: "success", message: "Se enviaron las fichas jugadas en la partida" });
});



//post para recibir las fichas 
app.post("/matches/playedpiece", urlencodedParser, (req,res) => {
  let body = req.body;

  matches = body

  res.json({ status: "success", message: "Se recibieron las fichas jugadas en la partida" });
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

function split(arr, n) {
  var res = [];
  while (arr.length) {
    res.push(arr.splice(0, n));
  }return res;
}