import { Inject, Injectable } from '@angular/core';
import { IUserProvider } from 'src/app/interfaces/users';
import { BaseService } from '../base/base.service';
import { FireService } from '../base/fire.service';

@Injectable({
  providedIn: 'root'
})
export class UserProviderService extends BaseService<IUserProvider>{
  protected basePath: string = 'users';

  constructor(
    @Inject(FireService) protected fireService: FireService) {
    super(fireService);
  }
}
