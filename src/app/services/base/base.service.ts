import { Inject, Injectable } from '@angular/core';
import { map, mapTo, mergeMap, mergeMapTo } from 'rxjs/operators';
import { forkJoin, from, iif, Observable, of, throwError } from 'rxjs';
import { FireCollection, FireQuery, FireService } from './fire.service';

@Injectable({
  providedIn: 'root'
})
export abstract class BaseService<T> {
  protected abstract basePath: string;
  unwrap$: Observable<T>;

  constructor(@Inject(FireService) protected fireService: FireService) {}

  private get collection(){
    return this.fireService.Firestore.collection<T>(this.basePath);
  }

  createFirestoreId(): string {
    return this.fireService.Firestore.collection('_').doc().id;
  }

  doc$(id: string): Observable<T> {
    return this.collection.doc(id).get().pipe(
      mergeMap((doc) => doc.unwrap$),
    )
  }

  collection$(queryFn?: QueryFn<T>): Observable<T[]> {
    if (queryFn)
      return queryFn(this.collection).get().pipe(mergeMap((c) => forkJoin(c.docs.map((d) => d.unwrap$))));
    return this.collection.get().pipe(mergeMap((c) => forkJoin(c.docs.map((d) => d.unwrap$))));
  }

  create$(value: T, id?: string): Observable<T> {
    const docId = id ? id : this.createFirestoreId();
    return this.collection.doc(docId).set(value, { merge: false });
  }

  exists$(id: string): Observable<boolean> {
    return this.collection.doc(id).get().pipe(
      map((v) => v.exists),
    );
  }

  update$(value: Partial<T>, id: string): Observable<T> {
    return this.collection.doc(id).update(value as T);
  }

  set$(value: Partial<T>, id: string, opts: { merge: boolean }): Observable<T> {
    return this.collection.doc(id).set(value as T, opts);
  }

  delete$(id: string): Observable<T> {
    return this.doc$(id).pipe(
      mergeMap((doc) => this.collection.doc(id).delete().pipe(mapTo(doc))),
    );
  }
}

export type QueryFn<T = unknown> = (f: FireCollection<T>) => FireQuery<T>;