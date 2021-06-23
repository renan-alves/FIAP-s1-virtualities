import { Inject, Injectable, Optional } from '@angular/core';
import firebase from 'firebase/app';
import { from, iif, Observable, of, throwError } from 'rxjs';
import { map, mergeMap, mergeMapTo } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { App, FirebaseOptions } from './firebase.options';

import FirestoreCollectionReference = firebase.firestore.CollectionReference;
import FirestoreDocumentReference = firebase.firestore.DocumentReference;
import FirestoreDocumentSnapshot = firebase.firestore.DocumentSnapshot;
import FirestoreQueryDocumentSnapshot = firebase.firestore.QueryDocumentSnapshot;
import FirestoreDocumentChange = firebase.firestore.DocumentChange;
import FirestoreQuerySnapshot = firebase.firestore.QuerySnapshot;
import FirestoreQuery = firebase.firestore.Query;

import Firestore = firebase.firestore.Firestore;


export type FieldPath = firebase.firestore.FieldPath;
export type FieldValue = firebase.firestore.FieldValue;
export type OrderByDirection = firebase.firestore.OrderByDirection;
export type WhereFilterOp = firebase.firestore.WhereFilterOp;
export type LoadBundleTask = firebase.firestore.LoadBundleTask;
export type FirestoreSettings = firebase.firestore.Settings;
export type FireSnapshotMetadata = firebase.firestore.SnapshotMetadata;
export type FireGetOptions = firebase.firestore.GetOptions;
export type FireSetOptions = firebase.firestore.SetOptions;
export type FireSnapshotOptions = firebase.firestore.SnapshotOptions;
export type FireSnapshotListenOptions = firebase.firestore.SnapshotListenOptions;
export type WriteBatch = firebase.firestore.WriteBatch;
export type MessagePayload = firebase.messaging.MessagePayload;
export type HttpsCallableOptions = firebase.functions.HttpsCallableOptions;
export type StorageReference = firebase.storage.Reference;
export type Trace = firebase.performance.Trace;
export type RemoteConfigFetchStatus = firebase.remoteConfig.FetchStatus;
export type RemoteConfigSettings = firebase.remoteConfig.Settings;
export type RemoteConfigValue = firebase.remoteConfig.Value;
export type RemoteConfigLogLevel = firebase.remoteConfig.LogLevel;
export type UploadMetadata = firebase.storage.UploadMetadata;
export const FieldValue = firebase.firestore.FieldValue;
export const FieldPath = firebase.firestore.FieldPath;

type FirebaseObservable<T, U, V, E> = (
  nextOrObserver: firebase.Observer<T, Error> | ((a: T) => U),
  error?: (a: E) => V,
  completed?: firebase.Unsubscribe
) => firebase.Unsubscribe;
const FirebaseObservableToRXJS = <T = unknown, U = unknown, V = unknown, E = Error>(f: FirebaseObservable<T, U, V, E>) => {
  return new Observable<T>((subscriber) => ({ unsubscribe: f(subscriber) }))
};

export enum FirebaseAuthPersistance {
  LOCAL = 'local',
  SESSION = 'session',
  NONE = 'none',
};

export type FirestoreHandler = {
  batch(): FireWriteBatch;
  clearPersistence(): Observable<void>;
  collection<T = unknown>(name: string): FireCollection<T>;
  collectionGroup<T = unknown>(collectionId: string): FireQuery<T>;
  disableNetwork(): Observable<void>;
  doc<T = unknown>(id?: string): FireDocument<T>;
  enableNetwork(): Observable<void>;
  enablePersistence(): Observable<void>;
  loadBundle(bundleData: string | ArrayBuffer | ReadableStream<Uint8Array>): LoadBundleTask;
  namedQuery<T = unknown>(name: string): Observable<FireQuery<T>>;
  onSnapshotsInSync$: Observable<void>;
  settings(settings: FirestoreSettings): void;
  terminate(): Observable<void>;
  useEmulator(host: string, port: number): void;
  waitForPendingWrites(): Observable<void>;
  setLogLevels(level: 'debug' | 'error' | 'silent'): void;
}

const tryUnwrapDocument = <T = unknown>(snapshot: { data(): T | undefined, id: string, exists: boolean }): Observable<T> => {
  return iif(() => snapshot.exists, of({ ...(snapshot.data() || {}), id: snapshot.id } as unknown as T), throwError({ type: 'error', reason: 'document_not_exists' }));
}

export type FireWriteBatch = {
  set<T>(documentReference: FirestoreDocumentReference<T>, data: Partial<T>, options: FireSetOptions): FireWriteBatch,
  delete<T>(documentReference: FirestoreDocumentReference<T>): FireWriteBatch,
  update<T>(documentReference: FirestoreDocumentReference<T>, data: T): FireWriteBatch,
  commit$: Observable<void>;
  origin: WriteBatch;
}

const createFireWriteBatch = (
  set: FireWriteBatch['set'],
  remove: FireWriteBatch['delete'],
  update: FireWriteBatch['update'],
  commit$: FireWriteBatch['commit$'],
  origin: WriteBatch,
): FireWriteBatch => ({ set, delete: remove, update, commit$, origin });

const convertWriteBatch = (writeBatch: WriteBatch): FireWriteBatch => {
  const set = <T = unknown>(documentReference: FirestoreDocumentReference<T>, data: Partial<T>, options: FireSetOptions) => convertWriteBatch(writeBatch.set(documentReference, data, options));
  const remove = <T = unknown>(documentReference: FirestoreDocumentReference<T>) => convertWriteBatch(writeBatch.delete(documentReference));
  const update = <T = unknown>(documentReference: FirestoreDocumentReference<T>, data: T) => convertWriteBatch(writeBatch.update(documentReference, data));
  const commit$ = from(writeBatch.commit());
  return createFireWriteBatch(set, remove, update, commit$, writeBatch);
};

export type FireQueryDocumentSnapshot<T = unknown> = {
  data(): T | undefined;
  unwrap$: Observable<T>;
  exists: boolean;
  get<T = unknown>(fieldPath: string | FieldPath, options?: FireSnapshotOptions): T | undefined;
  isEqual(other: FireQueryDocumentSnapshot<T>): boolean;
  metadata: FireSnapshotMetadata;
  ref: FireDocument<T>;
  origin: FirestoreQueryDocumentSnapshot<T>;
};

const convertQueryDocumentSnapshot = <T = unknown>(snapshot: FirestoreQueryDocumentSnapshot<T>): FireQueryDocumentSnapshot<T> => {
  return {
    data: () => snapshot.data(),
    exists: snapshot.exists,
    get: (fieldPath, options) => snapshot.get(fieldPath, options),
    isEqual: (other) => snapshot.isEqual(other.origin),
    metadata: snapshot.metadata,
    ref: convertDocument(snapshot.ref),
    unwrap$: tryUnwrapDocument<T>(snapshot),
    origin: snapshot,
  }
};

export type FireDocumentChangeType =
  | 'added'
  | 'removed'
  | 'modified';

export type FireDocumentChange<T = unknown> = {
  doc: FireQueryDocumentSnapshot<T>,
  newIndex: number;
  oldIndex: number;
  type: FireDocumentChangeType;
}

const convertDocumentChange = <T = unknown>(documentChange: FirestoreDocumentChange<T>): FireDocumentChange<T> => {
  return {
    doc: convertQueryDocumentSnapshot(documentChange.doc),
    newIndex: documentChange.newIndex,
    oldIndex: documentChange.oldIndex,
    type: documentChange.type as FireDocumentChangeType,
  };
};

export type FireQuerySnapshot<T = unknown> = {
  metadata: FireSnapshotMetadata;
  empty: boolean;
  docs: FireQueryDocumentSnapshot<T>[];
  query: FireQuery<T>;
  size: number;
  docChanges(options?: FireSnapshotListenOptions): FireDocumentChange<T>[];
  forEach: (callback: (result: FireQueryDocumentSnapshot<T>) => void, thisArg?: any) => void;
  isEqual: (other: FireQuerySnapshot<T>) => boolean;
  origin: FirestoreQuerySnapshot<T>;
}

const convertQuerySnapshot = <T = unknown>(querySnapshot: FirestoreQuerySnapshot<T>): FireQuerySnapshot<T> => {
  return {
    docChanges: (options) => querySnapshot.docChanges(options).map(convertDocumentChange),
    docs: querySnapshot.docs.map(convertQueryDocumentSnapshot),
    empty: querySnapshot.empty,
    forEach: (callback, thisArg) => querySnapshot.forEach((result) => callback(convertQueryDocumentSnapshot(result)), thisArg),
    isEqual: (other) => querySnapshot.isEqual(other.origin),
    metadata: querySnapshot.metadata,
    query: convertQuery(querySnapshot.query),
    size: querySnapshot.size,
    origin: querySnapshot,
  };
}

export type FireQuery<T = unknown> = {
  get(opts?: FireGetOptions): Observable<FireQuerySnapshot<T>>;
  isEqual(other: FireQuery<T>): boolean;
  limit(limit: number): FireQuery<T>;
  limitToLast(limit: number): FireQuery<T>;
  onSnapshot$: Observable<T>;
  orderBy(fieldPath: string | FieldPath, directionStr?: OrderByDirection): FireQuery<T>;
  where(fieldPath: string | FieldPath, opStr: WhereFilterOp, value: unknown): FireQuery<T>;
  startAt(...fields: unknown[]): FireQuery<T>;
  startAfter(...fields: unknown[]): FireQuery<T>;
  endBefore(...fields: unknown[]): FireQuery<T>;
  endAt(...fields: unknown[]): FireQuery<T>;
  origin: FirestoreQuery<T>;
};

const convertQuery = <T = unknown>(query: FirestoreQuery<T>): FireQuery<T> => {
  return {
    endAt: (...fields) => convertQuery(query.endAt(...fields)),
    endBefore: (...fields) => convertQuery(query.endBefore(...fields)),
    get: (opts?) => from(query.get(opts)).pipe(map(convertQuerySnapshot)),
    isEqual: (other) => query.isEqual(other.origin),
    limit: (limit: number) => convertQuery(query.limit(limit)),
    limitToLast: (limit: number) => convertQuery(query.limitToLast(limit)),
    onSnapshot$: FirebaseObservableToRXJS(query.onSnapshot.bind(query)),
    orderBy: (fieldPath, directionStr) => convertQuery(query.orderBy(fieldPath, directionStr)),
    startAfter: (...fields) => convertQuery(query.startAfter(...fields)),
    startAt: (...fields) => convertQuery(query.startAt(...fields)),
    where: (fieldPath, opStr, value) => convertQuery(query.where(fieldPath, opStr, value)),
    origin: query,
  }
};

export type FireDocumentSnapshot<T = unknown> = {
  get<T = unknown>(fieldPath: string | FieldPath, options?: FireSnapshotOptions): T | undefined;
  data: () => T | undefined;
  unwrap$: Observable<T>;
  id: string;
  isEqual(other: FireDocumentSnapshot<T>): boolean;
  exists: boolean;
  origin: FirestoreDocumentSnapshot<T>;
}

const convertFireDocumentSnapshot = <T = unknown>(snapshot: FirestoreDocumentSnapshot<T>): FireDocumentSnapshot<T> => ({
  get: (fieldPath, options?) => snapshot.get(fieldPath, options),
  data: () => snapshot.data(),
  id: snapshot.id,
  isEqual: (other: FireDocumentSnapshot<T>) => snapshot.isEqual(other.origin),
  exists: snapshot.exists,
  unwrap$: tryUnwrapDocument<T>(snapshot),
  origin: snapshot,
});

export type FireDocument<T = unknown> = {
  id: string;
  path: string;
  collection<U = unknown>(name: string): FireCollection<U>;
  delete(): Observable<void>;
  get(options?: FireGetOptions): Observable<FireDocumentSnapshot<T>>;
  isEqual(other: FireDocument<unknown>): boolean;
  onSnapshot$: Observable<FireDocumentSnapshot<T>>;
  set(data: T, options: FireSetOptions): Observable<T>;
  update(data: T): Observable<T>;
  origin: FirestoreDocumentReference<T>;
};

const convertDocument = <T = unknown>(document: FirestoreDocumentReference<T>): FireDocument<T> => {
  const collection = <U = unknown>(name: string) => convertCollection<U>(document.collection(name) as FirestoreCollectionReference<U>);
  return {
    id: document.id,
    path: document.path,
    collection,
    delete: () => from(document.delete()),
    get: (options?) => from(document.get(options)).pipe(map(convertFireDocumentSnapshot)),
    isEqual: (other: FireDocument<T>) => document.isEqual(other.origin),
    onSnapshot$: FirebaseObservableToRXJS(document.onSnapshot.bind(document)),
    set: (data, options) => from(document.set(data, options))
      .pipe(
        mergeMapTo(document.get()),
        map(convertFireDocumentSnapshot),
        mergeMap(tryUnwrapDocument),
      ),
    update: (data) => from(document.update(data))
      .pipe(
        mergeMapTo(document.get()),
        map(convertFireDocumentSnapshot),
        mergeMap(tryUnwrapDocument),
      ),
    origin: document,
  };
};

export type FireCollection<T = unknown> = {
  get(options?: FireGetOptions): Observable<FireQuerySnapshot<T>>;
  limit(limit: number): FireQuery<T>;
  limitToLast(limit: number): FireQuery<T>;
  onSnapshot$: Observable<FireCollection<T>>;
  orderBy(fieldPath: string | FieldPath, directionStr?: OrderByDirection): FireQuery<T>;
  path: string;
  startAfter(...fieldValues: unknown[]): FireQuery<T>;
  startAt(...fieldValues: unknown[]): FireQuery<T>;
  where(fieldPath: string | FieldPath, opStr: WhereFilterOp, value: any): FireQuery<T>;
  add(data: T): Observable<FireDocument<T>>;
  doc(id?: string): FireDocument<T>;
  endAt(...fieldValues: unknown[]): FireQuery<T>;
  endBefore(...fieldValues: unknown[]): FireQuery<T>;
  isEqual(other: FireCollection<T>): boolean;
  origin: FirestoreCollectionReference<T>;
}

const convertCollection = <T = unknown>(collection: FirestoreCollectionReference<T>): FireCollection<T> => ({
  path: collection.path,
  get: (options?) => from(collection.get(options)).pipe(map(convertQuerySnapshot)),
  limit: (limit) => convertQuery(collection.limit(limit)),
  limitToLast: (limit) => convertQuery(collection.limitToLast(limit)),
  orderBy: (fieldPath, directionStr) => convertQuery(collection.orderBy(fieldPath, directionStr)),
  startAfter: (...fieldValues) => convertQuery(collection.startAfter(...fieldValues)),
  startAt: (...fieldValues) => convertQuery(collection.startAt(...fieldValues)),
  where: (fieldPath, opStr, value) => convertQuery(collection.where(fieldPath, opStr, value)),
  add: (data) => from(collection.add(data)).pipe(map(convertDocument)),
  doc: (id?) => convertDocument(collection.doc(id)),
  endAt: (...fieldValues) => convertQuery(collection.endAt(...fieldValues)),
  endBefore: (...fieldValues) => convertQuery(collection.endBefore(...fieldValues)),
  isEqual: (other) => collection.isEqual(other.origin),
  onSnapshot$: FirebaseObservableToRXJS(collection.onSnapshot.bind(collection)),
  origin: collection,
});

const createFirestoreHandler = (firestore: Firestore): FirestoreHandler => {
  const batch: FirestoreHandler['batch'] = () => convertWriteBatch(firestore.batch());
  const clearPersistence: FirestoreHandler['clearPersistence'] = () => from(firestore.clearPersistence());
  const collection: FirestoreHandler['collection'] = <T = unknown>(name: string) => convertCollection(firestore.collection(name) as FirestoreCollectionReference<T>);
  const collectionGroup: FirestoreHandler['collectionGroup'] = <T = unknown>(collectionId: string) => convertQuery(firestore.collectionGroup(collectionId) as FirestoreQuery<T>);
  const disableNetwork: FirestoreHandler['disableNetwork'] = () => from(firestore.disableNetwork());
  const doc: FirestoreHandler['doc'] = <T = unknown>(documentPath: string) => convertDocument(firestore.doc(documentPath) as FirestoreDocumentReference<T>);
  const enableNetwork: FirestoreHandler['enableNetwork'] = () => from(firestore.enableNetwork());
  const enablePersistence: FirestoreHandler['enablePersistence'] = () => from(firestore.enablePersistence());
  const loadBundle: FirestoreHandler['loadBundle'] = (bundleData: string | ArrayBuffer | ReadableStream<Uint8Array>) => firestore.loadBundle(bundleData);
  const namedQuery: FirestoreHandler['namedQuery'] = <T = unknown>(name: string) => from(firestore.namedQuery(name) as Promise<FirestoreQuery<T>>).pipe(map(convertQuery));
  const onSnapshotsInSync$: FirestoreHandler['onSnapshotsInSync$'] = FirebaseObservableToRXJS<void, unknown, unknown, Error>(firestore.onSnapshotsInSync.bind(firestore));
  const settings: FirestoreHandler['settings'] = (settings) => firestore.settings(settings);
  const terminate: FirestoreHandler['terminate'] = () => from(firestore.terminate());
  const useEmulator: FirestoreHandler['useEmulator'] = (host, port) => firestore.useEmulator(host, port);
  const waitForPendingWrites: FirestoreHandler['waitForPendingWrites'] = () => from(firestore.waitForPendingWrites());
  const setLogLevels: FirestoreHandler['setLogLevels'] = (level) => firebase.firestore.setLogLevel(level);
  return {
    batch,
    clearPersistence,
    collection,
    collectionGroup,
    disableNetwork,
    doc,
    enableNetwork,
    enablePersistence,
    loadBundle,
    namedQuery,
    onSnapshotsInSync$,
    settings,
    terminate,
    useEmulator,
    waitForPendingWrites,
    setLogLevels,
  };
}
export type QueryFn<T = unknown> = (f: FireCollection<T>) => FireQuery<T>;

@Injectable({
  providedIn: 'root'
})
export class FireService {
  private _firestore: Firestore;
  private app: App;

  constructor(
  ) {
    this.app = firebase.initializeApp(environment.firebaseConfig, environment.firebaseAppName);
    this._firestore = this.app.firestore();
  }

  get Firestore(): FirestoreHandler {
    return createFirestoreHandler(this._firestore);
  }
}
