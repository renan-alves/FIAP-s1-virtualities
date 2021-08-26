import { Inject, Injectable } from '@angular/core';
import { IUserAnonymous } from 'src/app/interfaces/users';
import { BaseService } from '../base/base.service';
import { FireService } from '../base/fire.service';

@Injectable({
  providedIn: 'root'
})
export class AnonymousUserService extends BaseService<IUserAnonymous>{
  protected basePath: string = 'users';

  constructor(
    @Inject(FireService) protected fireService: FireService) {
    super(fireService);
  }
}
