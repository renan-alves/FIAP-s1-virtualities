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
  showMenu: boolean;

  constructor(private afAuth: AngularFireAuth) {
    this.afAuth.authState.subscribe(user => {
      if (user && !user.isAnonymous && user.emailVerified)
        this.isLoggedIn = true;
      else this.isLoggedIn = false;

      console.log(this.isLoggedIn);

      this.showMenu = true;
    })
  }

  ngOnInit(): void {

  }

  toggleHamburger() {
    this.expanded = !this.expanded;
  }

}
