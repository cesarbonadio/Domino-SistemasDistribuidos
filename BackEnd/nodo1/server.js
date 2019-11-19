require("./config/config");

const rp = require("request-promise");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const _ = require("lodash");
var fs = require('fs');
var json_matches = JSON.parse(fs.readFileSync('recover.json'));
var json_user = JSON.parse(fs.readFileSync('user.json'));
const urlencodedParser = bodyParser.urlencoded({ extended: false });
const port = process.env.PORT;

var nextplayer = process.env.NEXT;

//arreglo de puertos
var portlist = ["localhost:10001","localhost:10002","localhost:10003"];

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

var currentMatch = {
  id: 0,
  matchName: '',
  turn: 0,
  players: [],
  status: '',
  winner: '',
  piecesPlayed: []
}


//nombre de usuario de cada jugador


//partidas
var matches = [];

//fichas
pieces = [
  '0:0','1:0','1:1','2:0','2:1','2:2','3:0',
  '3:1','3:2','3:3','4:0','4:1','4:2','4:3',
  '4:4','5:0','5:1','5:2','5:3','5:4','5:5',
  '6:0','6:1','6:2','6:3','6:4','6:5','6:6'
]

try {
  if(fs.existsSync('recover.json')){
    matches =  json_matches.matches;
    var userName = json_user.user;
  }else{
    console.log('errorrr');
  } 
}catch (error) {
  console.log(error)
}




//post para nombre de usuario
app.post("/username", urlencodedParser, (req,res) => {
  let body = _.pick(req.body, ["userName"]);
  userName = body.userName;
  json_user.user = userName;
  var stringify = JSON.stringify(json_user);
  fs.writeFile('user.json', stringify, function (err) {
      if (err) {
          console.log("Ocurrio un error guardando el usuario en archivo en el JSON");
      }
      console.log("El usuario fue guardado exitosamente.");
  })
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
  json_matches.matches.push(body);
  var stringify = JSON.stringify(json_matches);
  fs.writeFile('recover.json', stringify, function (err) {
      if (err) {
          console.log("Ocurrio un error guardando el historial en archivo en el JSON");
      }
      console.log("El historial fue guardado exitosamente.");
  })
  // matches.push(body);
  console.log(body);
  console.log(json_matches.matches);
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
  currentMatch = _.filter(json_matches.matches, function (match) {
    return match.id == id;
  })[0];

  console.log(id)

  console.log("hokaaa", currentMatch)
  //var match = matches.filter(x => x.id === id);
  let body = _.pick(req.body, ["player"]);

  currentMatch.status = "Listos";
  currentMatch.players.push(body.player)

  for(let i = 0; i < portlist.length; i++){
    let options = {
      method: "POST",
      uri: "http://" + portlist[i] + "/matches/"+id+"/join",
      resolveWithFullResponse: true,
      json: true,
      body: currentMatch
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
  let body = req.body;
  var id = req.params.id;
  var ids = [parseInt(id)];
  json_matches.matches = _.filter(json_matches.matches, function (match) {
    return match.id != id;
  });
  console.log("partidas",json_matches)
  console.log(body)

  json_matches.matches.push(body)

  var stringify = JSON.stringify(json_matches);
  fs.writeFile('recover.json', stringify, function (err) {
    if (err) {
        console.log("Ocurrio un error actualizando el historial en archivo en el JSON");
    }
    console.log("El historial fue actualizado exitosamente.");
  })

  matches = json_matches.matches;
  /* var elementPos = matches.map(function(x) {return x.id; }).indexOf(parseInt(id)); */
  
  console.log(json);
  res.json({ status: "success", message: "Se unio a la partida" });
});



//post para barajear fichas de una partida
app.post("/matches/:id/distribute", urlencodedParser, (req,res) => {
  var id = req.params.id;
  var ids = [parseInt(id)];
  var match = matches.filter(function(el){ return ~ids.indexOf(el.id)});
  console.log(match);
  

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
  let body = req.body;
  var id = req.params.id;
  var ids = [parseInt(id)];

  console.log(id)

  currentMatch = _.filter(json_matches.matches, function (match) {
    return match.id == id;
  })[0];

  json_matches.matches = _.filter(json_matches.matches, function (match) {
    return match.id != id;
  });

  console.log("llegue",currentMatch);

  currentMatch.status = "Jugando";
  currentMatch.turn = 1;
  for(let i=0; i< body.length; i++){
    currentMatch.players[i].pieces = body[i];
  }

  console.log("partidas",json_matches.matches)

  json_matches.matches.push(currentMatch)

  var stringify = JSON.stringify(json_matches);
  fs.writeFile('recover.json', stringify, function (err) {
    if (err) {
        console.log("Ocurrio un error actualizando el historial en archivo en el JSON");
    }
    console.log("El historial fue actualizado exitosamente.");
  })
  matches = json_matches.matches;

  /* var elementPos = matches.map(function(x) {return x.id; }).indexOf(parseInt(id));
  let body = req.body;
  console.log(body);

  matches[elementPos].status = "Jugando";
  matches[elementPos].turn = 1;

  for(let i=0; i< body.length; i++){
    matches[elementPos].players[i].pieces = body[i];
  } */
  console.log(matches);
  res.json({ status: "success", message: "Se recibieron las fichas a la partida" });
});

//post para actualizar las jugadas 
app.post("/matches/:id/playpiece", urlencodedParser, (req,res) => {
  var id = req.params.id;
  var elementPos = matches.map(function(x) {return x.id; }).indexOf(parseInt(id));
  var body = _.pick(req.body, ["turn", "pieces", "piece", "winner"]);
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

  if(body.winner != ''){
    matches[elementPos].winner = body.winner;
    matches[elementPos].status = "Finalizado";
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

  json_matches.matches = matches;

  var stringify = JSON.stringify(json_matches);
  fs.writeFile('recover.json', stringify, function (err) {
    if (err) {
        console.log("Ocurrio un error actualizando el historial en archivo en el JSON");
    }
    console.log("El historial fue actualizado exitosamente.");
  })
  matches = json_matches.matches;


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