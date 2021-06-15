import { Inject, Injectable } from '@angular/core';
import { IFiles } from 'src/app/interfaces/files';
import { BaseService } from '../base/base.service';
import { FireService } from '../base/fire.service';

@Injectable({
  providedIn: 'root'
})
export class FilessService extends BaseService<IFiles>{
  protected basePath: string = 'files';

  constructor(
    @Inject(FireService) protected fireService: FireService) {
    super(fireService);
  }
}
