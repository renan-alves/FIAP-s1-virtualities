import { Inject, Injectable } from '@angular/core';
import { IPlan } from 'src/app/interfaces/plan';
import { BaseService } from '../base/base.service';
import { FireService } from '../base/fire.service';

@Injectable({
  providedIn: 'root'
})
export class PlansService extends BaseService<IPlan>{
  protected basePath: string = 'plans';

  constructor(
    @Inject(FireService) protected fireService: FireService) {
    super(fireService);
  }
}
