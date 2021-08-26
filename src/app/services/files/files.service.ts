import { Inject, Injectable } from '@angular/core';
import { IFile } from 'src/app/interfaces/files';
import { BaseService } from '../base/base.service';
import { FireService } from '../base/fire.service';

@Injectable({
  providedIn: 'root'
})
export class FilessService extends BaseService<IFile>{
  protected basePath: string = 'files';

  constructor(
    @Inject(FireService) protected fireService: FireService) {
    super(fireService);
  }
}
