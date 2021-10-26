import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from 'src/app/services/auth/auth.service';
import { FireService } from 'src/app/services/base/fire.service';
import firebase from 'firebase';


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  faUser = faUser;
  expanded: boolean;
  isLoggedIn: boolean;
  showMenu: boolean;
  user: firebase.User;

  constructor(private afAuth: AngularFireAuth, private authService: AuthService, private fireService: FireService) {
    this.afAuth.authState.subscribe(user => {
      this.user = user;
    
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

  async deslogar(){
    await this.authService.SignOut();
  }

  async excluirConta(){
    const userRef = this.fireService.Firestore.collection("users").doc(this.authService.getCurrentUser.uid);

    const fileRef = this.fireService.Firestore.collection("files").where("userId", "==", this.authService.getCurrentUser.uid);

    fileRef.get().subscribe(fileSnap => {
      fileSnap.docs.forEach(doc => {
        doc.ref.delete().subscribe();
      })

    });
    await this.authService.SignOut();
    userRef.delete().subscribe();
    await this.user.delete();
  }
}
