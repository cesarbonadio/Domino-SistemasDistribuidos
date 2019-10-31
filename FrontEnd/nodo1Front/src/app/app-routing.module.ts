import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { CreateUserComponent } from './create-user/create-user.component';
import { OnepageComponent } from './onepage/onepage.component';


const routes: Routes = [
{path:'nickname', component: CreateUserComponent},
{path:'juego', component: OnepageComponent},
{path:'**', component: CreateUserComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
