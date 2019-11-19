import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  FormsModule
} from '@angular/forms';
import { Router } from '@angular/router'
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-create-user',
  templateUrl: './create-user.component.html',
  styleUrls: ['./create-user.component.css']
})
export class CreateUserComponent implements OnInit {

  //formulario
  public registrationForm: FormGroup = new FormGroup({
    userName: new FormControl(null, [
    ])
  });

  constructor(
    private _router: Router,
    private _http: HttpClient
  ) {}

  ngOnInit() {
  }

  //get del registration form para el get
  get userName() {
    return this.registrationForm.get('userName');
  }

  public onSubmit():void{
    this.createUserName();
  }

  
  async createUserName() {
    await this._http
    .post("http://localhost:10003/username", 
    {
      userName: this.registrationForm.get('userName').value
    })
    .subscribe((response: any)=>{
      console.log("llegue",response);
      this._router.navigate(['/juego']);
    });

  }

}
