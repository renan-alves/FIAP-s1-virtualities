import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AuthService } from 'src/app/services/auth/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  expanded: boolean;
  isLoggedIn: boolean;

  constructor(private afAuth: AngularFireAuth) {
    this.afAuth.authState.subscribe(user => {
      if (user && !user.isAnonymous) 
        this.isLoggedIn = true;
      else this.isLoggedIn = false;
    })
  }

  ngOnInit(): void {

  }

  toggleHamburger() {
    this.expanded = !this.expanded;
  }

}
