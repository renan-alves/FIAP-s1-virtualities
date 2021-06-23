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
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
