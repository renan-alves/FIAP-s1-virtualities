import { Component, OnInit } from '@angular/core';
import { faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from 'src/app/services/auth/auth.service';
import { FireService } from 'src/app/services/base/fire.service';

@Component({
  selector: 'app-planos',
  templateUrl: './planos.component.html',
  styleUrls: ['./planos.component.scss']
})
export class PlanosComponent implements OnInit {
  faCheckCircle = faCheckCircle;
  faTimesCircle = faTimesCircle;
  constructor(private fireService: FireService, private authService: AuthService) { }

  ngOnInit(): void {
  }

  assignUser() {
    if (this.authService.isLoggedIn) {
      this.fireService.Firestore.collection('users').doc(this.authService.getCurrentUser.uid).set({ planId: "PRO" }, { merge: true }).subscribe(user => {
        this.authService.SetUserPlan('PRO');
      });
    }
  }
}
