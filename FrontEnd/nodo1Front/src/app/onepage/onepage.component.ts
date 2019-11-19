import { Component, OnInit, OnChanges, Input } from "@angular/core";
import { HttpClient} from '@angular/common/http';
import { Observable } from 'rxjs';
import { interval, Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: "app-onepage",
  templateUrl: "./onepage.component.html",
  styleUrls: ["./onepage.component.css"]
})
export class OnepageComponent implements OnInit, OnChanges {

  subscription: Subscription;

  propias = {
    match: 0,
    turn: 0,
    pieces: []
  }

  played = [];

  userName: String;
  
  ip: String;

  matches: any = [];

  matchSelected : boolean;


  constructor(private http: HttpClient, private _activedRoute: ActivatedRoute, private _router: Router) {
    this.getUserName();
    this.matchSelected = false;
    this.ip = "localhost:10003"
  }

  ngOnInit(){
    this.actualizacion();
  }

  ngOnChanges(){}

  ngDoCheck() {
  }

  /*hacer request para obtener usuario*/
  getUserName(){
    this.http
    .get("http://localhost:10003/username")
    .subscribe((response: any)=>{
      console.log(response);
      this.userName = response.userName;
      console.log(this.userName)
      this.changePage();
    });
    
  }

  changePage(){
    if(this.userName == ""){
      console.log("llegueeeee")
      this._router.navigate(["/nickname"]);
    }
  }

  /*hacer request para crear partida*/
  createMatch(){
    console.log("creating match");
    this.http
    .post("http://" + this.ip + "/creatematch", 
    {
      players: [ 
        {
        userName: this.userName,
        ip: this.ip,
        creator: true,
        pieces: []
        }
      ]
    })
    .subscribe((response: any)=>{
      console.log(response);
    });
  }

  /* Obtiene las partidas */
  getMatches(){
    this.http
    .get("http://" + this.ip + "/matches")
    .subscribe((response: any)=>{
      console.log(response);
      this.matches= response['matches']
      console.log(this.matches)
    });
  }

  /* Hace request para unirse a una partida */
  joinMatch(id){
    console.log("joinning match");
    this.http
    .put("http://" + this.ip + "/matches/"+id,{
      player: 
        {
        userName: this.userName,
        ip: this.ip,
        creator: false,
        pieces: []
        }
    })
    .subscribe((response: any)=>{
      console.log(response);
      this.matches= response['matches']
      console.log(this.matches)
    });

  }

  /* Valida si eres jugador 1 */
  getip(match){
    let jugador = match.players.filter(item => item != item.ip)
    console.log(jugador)
    if(jugador[0].ip == this.ip){
      return true;
    }
    return false;
  }

  /* Barajea las fichas y las reparte  */
  distribute(id){
    this.http
    .post("http://" + this.ip + "/matches/"+id+"/distribute", {})
    .subscribe((response: any)=>{
      console.log(response);
    });
  }

  /*Verificar si se tiene el turno actual de la partida*/ 
  getTurn(match){
    if (match.turn == match.players.map(function(e) { return e.ip; }).indexOf(this.ip)+1){
      return true;
    }
    return false;
  }

  getPiecesByMatch(match){
    var jugador = match.turn - 1;
    this.propias = {
      match: match.id,
      turn: match.turn,
      pieces: match.players[jugador].pieces
    } 
    this.getPiecesPlayed(match);
  }

  async playPiece(matchId, turn, piece){
    this.matchSelected = true;
    console.log("match", matchId);
    console.log("turn", turn);
    console.log("piece",piece)
    let pieces = this.propias.pieces.filter(item => item != piece);
    console.log("LLEGUEEEEEEE",pieces)
    let winner: String;

    if(pieces.length == 0){
      winner = this.userName;
    }else{
      winner = '';
    }

    this.http
      .post("http://" + this.ip + "/matches/"+matchId+"/playpiece", {
        turn: turn,
        pieces: pieces,
        piece: piece,
        winner: winner
      }).subscribe((response: any)=>{
        console.log(response);
      });

    this.propias.pieces = [];
    this.played.push(piece);
  }

  getPiecesPlayed(match){
    this.played = match.piecesPlayed;
  }
  
  skipPlay(match){
    this.matchSelected = true;
    let pieces = this.propias.pieces;

    this.http
      .post("http://" + this.ip + "/matches/"+match.id+"/playpiece", {
        turn: match.turn,
        pieces: pieces,
        piece: '',
        winner: ''
      }).subscribe((response: any)=>{
        console.log(response);
      });

    this.propias.pieces = [];
  }

  getCreater(match){
    let player = match.players.filter(item => item.ip == this.ip)
    if (player.length == 0){
      return true;
    }else{
      return false
    }
  }

  async jugarFicha(valor: string): Promise<any>{
    console.log(valor);

    let res = await this.http
      .post("http://localhost:10001/jugar", {valor: valor})
      .toPromise();

    let res2 = await this.http
      .post("http://localhost:10002/jugar", {valor: valor})
      .toPromise();

    let res3 = await this.http
      .post("http://localhost:10003/jugar", {valor: valor})
      .toPromise();

    return this.jugadaExitosa();

  }

  // Funcion para actualizar cada 2500
  actualizacion(){
    const source = interval(2500);
    this.subscription = source.subscribe(val => this.actualizar());
  }

  // Funcion para la actualizacion real
  actualizar(){
    this.updateScroll();
    this.getMatches();
  }

  jugadaExitosa(){
  }

  updateScroll(){
    var element = document.getElementById("scroll");
    element.scrollTop = element.scrollHeight;
  }

  formatearFicha(ficha){
    return ficha.replace(":","_");
  }

}
