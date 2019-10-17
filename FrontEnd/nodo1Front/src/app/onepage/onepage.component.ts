import { Component, OnInit, OnChanges } from "@angular/core";
import { HttpClient} from '@angular/common/http';
import { Observable } from 'rxjs';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: "app-onepage",
  templateUrl: "./onepage.component.html",
  styleUrls: ["./onepage.component.css"]
})
export class OnepageComponent implements OnInit, OnChanges {

  subscription: Subscription;

  localobj = {
    input1: "0",
    input2: "0",
    total: "0"
  };

  remoteobj = {
    input1: "0",
    input2: "0",
    total: "0"
  };

  body = {
    ball: "1"
  };

  ficha = {
    valor: "0"
  };

  fichas = [
    '1/1','1/2','1/3','1/4','1/5','1/6',
    '2/1','2/2','2/3','2/4','2/5','2/6',
    '3/1','3/2','3/3','3/4','3/5','3/6',
    '4/1','4/2','4/3','4/4','4/5','4/6',
    '5/1','5/2','5/3','5/4','5/5','5/6',
    '6/1','6/2','6/3','6/4','6/5','6/6'
  ]

  jugador = {
    jugador: false
  }

  propias = []

  jugadas = [];

  papa: Boolean = false;

  jugador1: Boolean = false;

  constructor(private http: HttpClient) {

  }

  ngOnInit(){
    this.obtenerPapa();
    this.obtenerJugador();
    this.actualizacion();

  }

  ngOnChanges(){

  }

  ngDoCheck() {
  }

  add() {
    let trans = parseInt(this.localobj.input1) + parseInt(this.localobj.input2);
    this.localobj.total = trans + "";
  }

  sub() {
    let trans = parseInt(this.localobj.input1) - parseInt(this.localobj.input2);
    this.localobj.total = trans + "";
  }


  addRem() {
    
    this.http
    .post("http://localhost:10001/add", this.remoteobj)
    .subscribe((response: any)=>{
      
      this.remoteobj.input1 = response.input1;
      this.remoteobj.input2 = response.input2;
      this.remoteobj.total = response.total;

    });
  }

  subRem() {
    this.http
    .post("http://localhost:10001/sub", this.remoteobj)
    .subscribe((response: any)=>{
      this.remoteobj.input1 = response.input1;
      this.remoteobj.input2 = response.input2;
      this.remoteobj.total = response.total;

    });
  }

  obtenerPapa(){
    this.http
    .get("http://localhost:10001/papa")
    .subscribe((response: any) => {
        console.log(response['papa']);
        this.papa = response['papa'];
    })
  }

  obtenerPapa2(){
    <Promise<any>>this.http.get("http://localhost:10001/papa").toPromise()
    .then((response: any) => {
      console.log(response['papa']);
      this.papa = response['papa'];
    })
  }

  obtenerJugador(){
    this.http.get("http://localhost:10001/jugador")
    .subscribe((response: any) => {
      console.log(response['jugador']);
      this.jugador1 = response['jugador'];
  })
  }

  obtenerJugada(){
    this.http
    .get("http://localhost:10001/jugadas")
    .subscribe((response: any) => {
        console.log(response['fichasJ']);
        this.jugadas = response['fichasJ'];
    })
  }

  obtenerJugada2(){
    <Promise<any>>this.http
    .get("http://localhost:10001/jugadas").toPromise()
    .then((response: any) => {
        console.log(response['fichasJ']);
        this.jugadas = response['fichasJ'];
    })
  }

  startGame(){
    this.http
    .post("http://localhost:10001/catchball" ,this.body )
    .subscribe((response: any) => {
      this.body.ball = "1"
    });

    this.http
    .post("http://localhost:10001/jugador" ,this.jugador )
    .subscribe((response: any) => {
      this.jugador.jugador = false
      console.log(this.jugador.jugador);
    });

    this.jugador1 = false

    this.barajear();

  }

  pasarPapa() {

    this.http
    .post("http://localhost:10002/catchball" ,this.body )
    .subscribe((response: any) => {
      this.body.ball = "1"
    });

    this.http
    .post("http://localhost:10001/pasar" ,this.body )
    .subscribe((response: any) => {
      this.body.ball = "1"
    });

    this.papa = false;
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

    this.propias = this.propias.filter(item => item != valor);
    this.repartirFichas(this.propias,1);

    return this.jugadaExitosa();

  }

  barajear(/* PASAR EL NUMERO DE JUGADORES */){
    this.fichas = this.fichas.sort(function() {return Math.random() - 0.5});
    this.fichas = this.split(this.fichas, 3);
    
    for (let i = 1; i<=3; i++){
      this.repartirFichas(this.fichas[i-1],i);
    }
  }

  split(arr, n) {
    var res = [];
    var m = arr.length/n;
    while (arr.length) {
      res.push(arr.splice(0, m));
    }
    return res;
  }

  async repartirFichas(arr,n){
    let res = await this.http
      .post("http://localhost:1000"+n+"/repartir", {fichas: arr})
      .toPromise();
  }

  obtenerFichas(){
    <Promise<any>>this.http
    .get("http://localhost:10001/fichasP").toPromise()
    .then((response: any) => {
        console.log("llegue");
        console.log(response['fichasP']);
        this.propias = response['fichasP'];
    })
  }

  actualizacion(){
    const source = interval(2500);
    this.subscription = source.subscribe(val => this.actualizar());
  }

  actualizar(){
    this.obtenerJugada();
    this.obtenerPapa();
    this.obtenerFichas();
  }

  jugadaExitosa(){
    this.pasarPapa();
    this.obtenerJugada();
  }

}
