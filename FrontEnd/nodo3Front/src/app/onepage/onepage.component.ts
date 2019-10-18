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
  }

  fichas = [
    '0:0','1:0','1:1','2:0','2:1','2:2','3:0',
    '3:1','3:2','3:3','4:0','4:1','4:2','4:3',
    '4:4','5:0','5:1','5:2','5:3','5:4','5:5',
    '6:0','6:1','6:2','6:3','6:4','6:5','6:6'
  ]

  jugadas = [];

  propias = []

  papa: Boolean = false;

  constructor(private http: HttpClient) {
  }

  ngOnInit(){
    this.obtenerPapa();
    this.obtenerJugada();
    this.actualizacion();
  }

  ngOnChanges(){
    
  }

  /* ngDoCheck() {
    this.obtenerPapa();
  } */

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
    .get("http://localhost:10003/papa")
    .subscribe((response: any) => {
        console.log(response['papa']);
        this.papa = response['papa'];
    })
  }

  obtenerJugada(){
    this.http
    .get("http://localhost:10003/jugadas")
    .subscribe((response: any) => {
        console.log(response['fichasJ']);
        this.jugadas = response['fichasJ'];
    })
  }

  pasarPapa() {

    this.http
    .post("http://localhost:10001/catchball" ,this.body )
    .subscribe((response: any) => {
      this.body.ball = "1"
    });

    this.http
    .post("http://localhost:10003/pasar" ,this.body )
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
    this.repartirFichas(this.propias,3);

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
    .get("http://localhost:10003/fichasP").toPromise()
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
    this.updateScroll();
  }

  jugadaExitosa(){
    this.pasarPapa();
    this.obtenerJugada();
  }

  updateScroll(){
    var element = document.getElementById("scroll");
    element.scrollTop = element.scrollHeight;
  }

}
