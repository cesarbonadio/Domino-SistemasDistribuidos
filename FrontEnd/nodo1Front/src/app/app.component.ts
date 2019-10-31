import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'taller2';
  public userName: String;
  public isOnGameTable: boolean;
  public isCreatingUser: boolean;

  constructor(){
    this.isOnGameTable = false;
    this.isCreatingUser = true;
  }

  getUserNameEmitter(user: string){
    console.log(user);
    this.userName = user;
    this.changeViewToPlay();
  }

  getUserName(){
    return this.userName;
  }

  changeViewToPlay(){
    this.isOnGameTable = true;
    this.isCreatingUser = false;
  }
  
}
