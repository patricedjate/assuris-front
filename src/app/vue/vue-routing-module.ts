import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VueLogin } from './vue-login/vue-login';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: VueLogin,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VueRoutingModule {}
