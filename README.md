Como Correrlo ?

1- Para comenzar

POST: localhost:10001/catchball

{
"ball": "1"
}

2- Para Finalizar

GET: localhost:10001/endgame
localhost:10002/endgame
localhost:10003/endgame
localhost:10004/endgame

3- Para Añadir un Nuevo Jugador

POST: localhost:10003/newplayer

{
"playernotified": "10003",
"newplayer": {
"name": "Jugador 4",
"port": "10004"
}
}}