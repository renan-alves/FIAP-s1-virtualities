import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./views/home/home.module')
      .then(m => m.HomeModule)
  },
  {
    path: 'download/:fileId',
    loadChildren: () => import('./views/download/download.module')
      .then(m => m.DownloadModule)
  },
  {
    path: 'login',
    loadChildren: () => import('./views/sign-in/sign-in.module')
      .then(m => m.SignInModule)
  },
  {
    path: 'register',
    loadChildren: () => import('./views/sign-up/sign-up.module')
      .then(m => m.SignUpModule)
  },
  { path: 'planos', loadChildren: () => import('./views/planos/planos.module').then(m => m.PlanosModule), data: { bodyClass: 'planos' } }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
