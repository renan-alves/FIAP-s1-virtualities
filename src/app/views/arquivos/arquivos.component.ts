import { Component, ElementRef, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/storage';
import { MatTableDataSource } from '@angular/material/table';
import { IFile } from 'src/app/interfaces/files';
import firebase from 'firebase';
import { AuthService } from 'src/app/services/auth/auth.service';
import { FilessService } from 'src/app/services/files/files.service';
import { faAngleLeft, faAngleRight, faBan, faCircle, faFileUpload, faPen, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { formatDate } from '@angular/common';
import { humanFileSize, isNullOrEmpty } from 'src/app/_commom/util';
import { FormBuilder } from '@angular/forms';
import { FireService } from 'src/app/services/base/fire.service';
import { SelectionModel } from '@angular/cdk/collections';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ModalComponent, ModalData } from 'src/app/components/modal/modal.component';
import { error } from 'console';
import { finalize } from 'rxjs/operators';

const TEMP: FileGridData[] = [
];

@Component({
  selector: 'app-arquivos',
  templateUrl: './arquivos.component.html',
  styleUrls: ['./arquivos.component.scss']
})

export class ArquivosComponent implements OnInit {
  faCircle = faCircle;
  faAngleLeft = faAngleLeft;
  faAngleRight = faAngleRight;
  faPen = faPen;
  faTrashAlt = faTrashAlt;
  faBan = faBan;
  faFileUpload = faFileUpload;

  @ViewChild('buttonTeste') buttonTesteElement: ElementRef;

  @ViewChild('nickNameInput') nickNameInputElement: ElementRef;

  @ViewChild('disableRemoveModalBody') disableRemoveModalBody: TemplateRef<any>;

  @ViewChild('editModalBody') editModalBody: TemplateRef<any>;

  /**
   * Enum para ser utlizado no HTML
   */
  modalOpenMode = ModalOpenMode;

  /**
   * Controla se o Loader vai ser exibido
   */
  showLoader: boolean;

  isNullOrEmpty = isNullOrEmpty;
  /**
   * Usuário logado
   */
  private user: firebase.User;

  /**
   * Armazena a referencia todos os compartilhamentos do usuário
   */
  private allSharedFiles: IFile[];

  /**
   * Enum para ser usado no Front
   */
  statusEnum = FileStatusEnum;

  /**
   * Enum para ser usado no Front
   */
  navigationModeEnum = NavigationMode;

  /**
   * Armazena os compartilhamentos do usuário
   */
  private allFiles: Item[];

  /**
   * Armazena as informações dos arquivos em memória, para evitar carregamentos desnecessário
   */
  private knowItens:
    {
      fullPath: string,
      itens: Item[],
    }[] = [];

  get canRemove(): boolean {
    return !this.selection.isEmpty();
  }

  get isAnySelected(): boolean {
    return !this.selection.isEmpty();
  }

  get isLinkLayer(): boolean {
    return this.actualPath === '/';
  }

  /**
   * Colunas que são exibidas no grid
   */
  displayedColumns: string[] = ['name', 'size', 'status',];

  /**
   * Sinaliza se é necessário mostrar o Preview do arquivo
   */
  showPreview: boolean = false;

  /**
   * Sinaliza se é necessário mostrar o Preview do arquivo
   */
  previewFile: PreviewFile;

  actualPath: string;

  navigationLine: FilePathWithName[] = [];

  navigationExibicao: FilePathWithName[] = [];

  /**
   * Informações que são exibidas no grid
   */
  dataSource = new MatTableDataSource(TEMP);

  selection = new SelectionModel<FileGridData>(true, []);

  nickNameForm = this.formBuilder.group({
    name: '',
  });

  /**
   * Controla o estado de Edição
   */
  isEditMode = false;

  disableDeleteModalText = '';

  filesUpload: File[] = [];

  modalRef: MatDialogRef<ModalComponent, any>;

  @ViewChild('fileInput') fileInput: ElementRef;

  constructor(
    private filesService: FilessService,
    private afStorage: AngularFireStorage,
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private fireService: FireService,
    public dialog: MatDialog) { }

  async ngOnInit(): Promise<void> {
    this.previewFile = new PreviewFile();
    // Registra o usuário logado
    this.user = this.authService.getCurrentUser;

    // Abre o Loader
    this.showLoader = true;

    // Pega a informação de todos Compartilhamentos do usuário 
    this.allSharedFiles = await this.getAllSharedFilesOfLoggedUser();

    this.allFiles = await Promise.all(this.getAllLinks());

    this.knowItens.push({ fullPath: '/', itens: this.allFiles });
    this.navigationLine.push({ name: 'Meus Links', itemPath: '/' });
    this.actualPath = '/';
    this.buildGrid(this.allFiles);

    // Fecha o Loader
    this.showLoader = false;
  }

  private async getAllSharedFilesOfLoggedUser(): Promise<IFile[]> {
    return await this.filesService.collection$((ref) => ref.where("userId", "==", this.user.uid)).toPromise();
  }

  private getAllLinks(): Promise<Item>[] {
    return this.allSharedFiles.map(async (file, index) => {
      return (
        {
          docId: file.docId,
          completePath: '/' + file.docId,
          name: this.getLinkName(file),
          size: '-',
          type: TypeItemEnum.Link,
          status: file.active ?
            FileStatusEnum.Disponivel :
            FileStatusEnum.NaoDisponivel,
          dataCriacao: formatDate(new Date(file.dateCreated), 'dd-MM-yyyy HH:mm', 'pt-BR'),
          dataExpiracao: formatDate(new Date(file.expirationDate), 'dd-MM-yyyy HH:mm', 'pt-BR'),
          downloadLimit: file.downloadLimit,
          downloadCount: file.downloadCount ?? 0,
        }
      ) as Item
    });
  }

  private getLinkName(file: IFile) {
    if (isNullOrEmpty(file.nickname)) {
      return `Link compartilhado ${formatDate(new Date(file.dateCreated), 'dd-MM-yyyy HH:mm ', 'pt-BR')}`;
    }
    return file.nickname;
  }

  private async buildItens(path: string, resetKnowItem = false): Promise<Item[]> {
    const indexKnowItem = this.knowItens.findIndex(k => k.fullPath === path);

    if (indexKnowItem !== -1) {
      // Caso seja requisitado, reseta a informação em memória, para "forçar" um recarregamento deste diretório
      if (resetKnowItem) {
        this.knowItens.splice(indexKnowItem, 1);
      } else {
        return this.knowItens[indexKnowItem].itens;
      }
    }

    const fileStorage = await this.afStorage.ref(path).listAll().toPromise();

    const itens = await Promise.all(fileStorage.items.map(async (i, index) => {
      // Pega as informações mais específicas do arquivo
      const metadata = await fileStorage.items[index].getMetadata();
      return (
        {
          completePath: i.fullPath,
          name: i.name,
          size: this.getSize(metadata),
          typeFile: this.getFileType(metadata),
          type: TypeItemEnum.SingleFile
        }
      ) as Item
    }));

    const folders = await Promise.all(fileStorage.prefixes.map(async p => {
      return (
        {
          completePath: p.fullPath,
          name: p.name,
          size: '-',
          type: TypeItemEnum.Folder
        }
      ) as Item
    }));

    const itensRetorno = itens.concat(folders);
    this.knowItens.push({ fullPath: path, itens: itensRetorno });

    return itensRetorno;
  }

  /**
   * Constrói o grid da tela
   */
  private async buildGrid(itens: Item[]) {
    this.selection.clear();
    this.changeFilePath();
    this.dataSource.data = await Promise.all(itens
      .map(async (i, index) =>
        (
          {
            index: index,
            docId: i.docId,
            name: i.name,
            size: i.size,
            status: i.status,
            item: i
          }
        ) as FileGridData));
  }

  private getSize(metadata: any): string {
    let size = (metadata.size) as number;
    return humanFileSize(size);
  }

  private getFileType(metadata: any): string {
    // TODO: Fazer um de-para mais sofisticado
    return metadata.contentType;
  }

  private handleClickedLink(item: Item, docId: string): void {
    this.nickNameForm.controls['name'].setValue(item.name);
    this.showPreview = true;
    this.previewFile =
      {
        docId: docId,
        canEdit: true,
        name: item.name,
        status: this.getStatus(item.status),
        dataCriacao: item.dataCriacao,
        dataExpiracao: item.dataExpiracao,
        downloadLimit: item.downloadLimit,
        downloadCount: item.downloadCount ?? 0
      } as PreviewFile;
  }

  private getStatus(status: FileStatusEnum): string {
    switch (status) {
      case FileStatusEnum.Disponivel:
        return 'Disponível';

      case FileStatusEnum.NaoDisponivel:
        return 'Indisponível';
    }
  }

  private async handleDoubleClickedLink(item: Item): Promise<void> {
    await this.handleClickedFolder(item);
  }

  private async handleClickedFolder(item: Item): Promise<void> {
    this.previewFile = new PreviewFile();
    const itens = await this.buildItens(item.completePath);

    this.processNavigationLine();
    this.navigationLine.push({ name: item.name, itemPath: item.completePath });
    this.actualPath = item.completePath;

    this.buildGrid(itens);
  }

  private handleClickedSingleFile(item: Item): void {
    this.showPreview = true;
    this.previewFile =
      {
        canEdit: false,
        name: item.name,
        size: item.size,
        typeFile: item.typeFile

      } as PreviewFile;
  }

  private processNavigationLine(): void {
    const indexToDelete = this.navigationLine.findIndex(n => n.itemPath === this.actualPath) + 1;
    this.navigationLine.splice(indexToDelete, this.navigationLine.length - indexToDelete);
  }

  private changeFilePath() {
    this.navigationExibicao = [];

    const indexToDelete = this.navigationLine.findIndex(n => n.itemPath === this.actualPath) + 1;
    const navigationLineActual = this.navigationLine.slice(0, indexToDelete);

    navigationLineActual.forEach((n, index) => {
      let name;
      // Se for o primeiro
      if (index === 0) {
        name = n.name;
      } else {
        name = ' > ' + n.name;
      }
      this.navigationExibicao.push({ name: name, itemPath: n.itemPath });
    });
  }

  private async openDialog(mode: ModalOpenMode): Promise<void> {
    // Guarda a referência do modal quje será utilizado 
    let modalBody: TemplateRef<any>;

    // Avalia qual é o modal certo, a partir do modo de abertura
    if (mode === ModalOpenMode.Edit) {
      modalBody = this.editModalBody;

    } else {
      modalBody = this.disableRemoveModalBody;
      this.disableDeleteModalText = mode === ModalOpenMode.Disable ?
        "Tem certeza que deseja desabilitar o compartilhamente deste Link?" :
        "Tem certeza que deseja remover este arquivo?";
    }

    // Abre o modal
    this.modalRef = this.dialog.open(ModalComponent, {
      data: {
        templateBody: modalBody,
      } as ModalData
    });
  }

  /**
   * Filtro de busca
   */
  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  /**
   * @param {Event} row Infomações da linha clicada
   */
  async handleClickedRow(row: FileGridData, event: MouseEvent): Promise<void> {
    // Abre o Loader
    this.showLoader = true;

    const fileGridData = row as FileGridData;
    const item = fileGridData.item as Item;

    if (event.ctrlKey) {
      this.selection.toggle(row);
    } else if (event.shiftKey) {
      if (this.selection.selected.length !== 0) {
        let rowFrom = this.selection.selected[this.selection.selected.length - 1].index;
        let rowTo = row.index;

        const menorIndex = Math.min(rowFrom, rowTo);
        const maiorIndex = Math.max(rowFrom, rowTo);

        this.selection.clear();
        this.dataSource.data.forEach(d => {
          if (d.index >= menorIndex && d.index <= maiorIndex) {
            this.selection.select(d);
          }
        });
      } else {
        this.selection.toggle(row);
      }
    } else {
      this.selection.clear();
      this.selection.select(row);
    }

    switch (item.type) {
      case TypeItemEnum.Link:
        await this.handleClickedLink(item, fileGridData.docId);
        break;

      case TypeItemEnum.Folder:
        await this.handleClickedFolder(item);
        break;

      case TypeItemEnum.SingleFile:
        await this.handleClickedSingleFile(item);
        break;

      default:
        console.error('O Tipo de Item não está declarado, verifique se realmente há um valor no objeto Item 😨');
        break;
    }

    // Fecha o Loader
    this.showLoader = false;
  }

  /**
   * @param {Event} row Infomações da linha clicada
   */
  async handleDoubleClickedRow(row: FileGridData): Promise<void> {
    // Abre o Loader
    this.showLoader = true;

    //return;
    const item = row.item as Item;

    switch (item.type) {
      case TypeItemEnum.Link:
        await this.handleDoubleClickedLink(item);
        break;

      case TypeItemEnum.Folder:
        // Folder não tem Double CLick
        break;

      case TypeItemEnum.SingleFile:
        // SingleFile não tem Double CLick
        break;

      default:
        console.error('O Tipo de Item não está declarado, verifique se realmente há um valor no objeto Item ');
        break;
    }

    // Fecha o Loader
    this.showLoader = false;
  }

  handleClickNavigationItem(path: string) {
    const knowItem = this.knowItens.find(k => k.fullPath === path);
    this.actualPath = path;
    this.buildGrid(knowItem.itens);
  }

  handlerClickedArrow(mode: NavigationMode): void {
    let indexNavigator = 0;

    switch (mode) {
      case NavigationMode.Back:
        if (!this.hasItemBack()) {
          return;
        }
        indexNavigator = -1;

        break;
      case NavigationMode.Foward:
        if (!this.hasItemFoward()) {
          return;
        }
        indexNavigator = 1;

        break;
      // Não deveria acontecer, mas se não tiver valor, retorna e gera erro
      default:
        console.error('Valor não esperado na navegação');
        return
    }

    const targetPath = this.navigationLine[this.navigationLine.findIndex(n => n.itemPath === this.actualPath) + indexNavigator];

    const knowItem = this.knowItens.find(k => k.fullPath === targetPath.itemPath);
    this.actualPath = targetPath.itemPath;
    this.buildGrid(knowItem.itens);
  }

  hasItemBack(): boolean {
    return this.navigationLine.findIndex(n => n.itemPath === this.actualPath) > 0;
  }

  hasItemFoward(): boolean {
    return this.navigationLine.findIndex(n => n.itemPath === this.actualPath) < this.navigationLine.length - 1;
  }

  async handleDisableRemove(mode: ModalOpenMode): Promise<void> {
    // Se não pode remover, retorna direto
    if (!this.canRemove) {
      return;
    }

    // Abre o modal
    await this.openDialog(mode);

    // Espera o resultado
    this.modalRef.componentInstance.userAction.subscribe(
      async (userConfirm) => {
        console.log(userConfirm);
        if (userConfirm) {
          if (mode === ModalOpenMode.Remove) {
            this.showLoader = true;
            this.selection.selected.forEach(async (arquivo, index) => {
              await this.afStorage.ref(arquivo.item.completePath).delete().toPromise();

              if (index === this.selection.selected.length - 1) {
                // Compila os arquivos que foram deletados
                const arquivosDeletados = this.selection.selected.map(s => s.item.completePath);

                // Atualiza a tabela
                this.dataSource.data = this.dataSource.data
                  .filter(d => arquivosDeletados.findIndex(a => a === d.item.completePath) === -1);

                // Pega o diretório atual e atualiza a informação em memória
                const diretorioAtual = this.knowItens.find(k => k.fullPath === this.actualPath).itens;
                this.knowItens
                  .find(k => k.fullPath === this.actualPath).itens = diretorioAtual
                    .filter(d => arquivosDeletados
                      .findIndex(a => a === d.completePath) === -1);
              }
            });

            this.showLoader = false;
          } else if (mode === ModalOpenMode.Disable) {
            this.showLoader = true;
            this.selection.selected.forEach(async (arquivo, index) => {
              // Atualiza a informação no firebase
              await this.fireService.Firestore.collection('files').doc(arquivo.docId).set({ active: false }, { merge: true }).toPromise();

              if (index === this.selection.selected.length - 1) {

                // Compila os arquivos que foram deletados
                const arquivosDesabilitados = this.selection.selected.map(s => s.item.completePath);
                console.log('arquivosDesabilitados', arquivosDesabilitados);
                console.log('this.dataSource.data', this.dataSource.data);
                
                console.log(this.dataSource.data.filter(d => arquivosDesabilitados.findIndex(a => a === d.item.completePath) !== -1));
                this.dataSource.data
                  .filter(d => arquivosDesabilitados.findIndex(a => a === d.item.completePath) !== -1)
                  .forEach(d => d.status = FileStatusEnum.NaoDisponivel);

                // Pega o diretório raiz(onde estão contidos os Links) e atualiza a informação
                this.knowItens.find(k => k.fullPath === '/').itens
                  .filter(d => arquivosDesabilitados.findIndex(a => a === d.completePath) !== -1)
                  .forEach(a => a.status = FileStatusEnum.NaoDisponivel);
              }
            });

            this.showLoader = false;
            // TODO: Disable
          }
        }
        this.modalRef.close();
      },
    );
  }

  async handleEdit(): Promise<void> {
    await this.openDialog(ModalOpenMode.Edit);
    this.modalRef.componentInstance.userAction.subscribe(
      async (userConfirm) => {
        if (userConfirm && this.filesUpload.length > 0) {
          this.showLoader = true;
          const uploadStatus = [] as boolean[];

          this.filesUpload.forEach(async fileUpload => {
            const path = this.actualPath + '/' + fileUpload.name;

            const task = this.afStorage.upload(path, fileUpload);

            await task.snapshotChanges().toPromise();
            task.snapshotChanges().subscribe(
              async (snap) => {
                if (snap.state === firebase.storage.TaskState.ERROR || snap.state === firebase.storage.TaskState.CANCELED || snap.state === firebase.storage.TaskState.PAUSED) {
                  // TODO: Tratar erro
                }

                if (snap.state === firebase.storage.TaskState.SUCCESS) {
                  uploadStatus.push(true);
                }

                if (uploadStatus.length === this.filesUpload.length) {
                  const itens = await this.buildItens(this.actualPath, true);

                  console.log(itens);
                  this.buildGrid(itens);
                  this.filesUpload = [];
                  this.modalRef.close();
                }
              },
              (error) => {
                // TODO: Tratar erro
              },
              () => this.showLoader = false,
            );
          });
        } else {
          this.filesUpload = [];
          this.modalRef.close();
        }
      }
    );
  }

  enterPressedHandler(): void {
    this.isEditMode = false;
    setTimeout(() => {
      this.buttonTesteElement.nativeElement.focus();
      this.unfocusHandler();
    }, 0);
  }

  unfocusHandler(): void {
    // Sinaliza que a edição acabou
    this.isEditMode = false;

    // Se o valor for o mesmo, não modificou nada
    if (this.nickNameForm.value['name'] === this.previewFile.name) {
      return;
    }

    // Atualiza a informação no firebase
    this.fireService.Firestore.collection('files').doc(this.previewFile.docId).set({ nickname: this.nickNameForm.value['name'] }, { merge: true }).subscribe();

    // Atualiza a informação no Preview
    this.previewFile.name = !isNullOrEmpty(this.nickNameForm.value['name']) ? this.nickNameForm.value['name'] : `Link compartilhado ${this.previewFile.dataCriacao}`;

    // Atualiza a informação no Grid
    this.dataSource.data.find(d => d.docId === this.previewFile.docId).name = this.previewFile.name;

    // Pega o diretório raiz(onde estão contidos os Links) e atualiza a informação
    this.knowItens.find(k => k.fullPath === '/').itens.find(i => i.docId === this.previewFile.docId).name = this.previewFile.name;
  }

  buttonHandler(): void {
    this.isEditMode = true;
    setTimeout(() => { // this will make the execution after the above boolean has changed
      this.nickNameInputElement.nativeElement.focus();
    }, 0);
  }

  onFileSelected(event:
    {
      target:
      {
        files: File[];
      };
    }) {

    this.filesUpload = this.filesUpload.concat(Object.values(event.target.files));
  }

  openFileInput() {
    this.fileInput.nativeElement.click();
  }
}

export class FileGridData {
  docId: string;
  index: number;
  name: string;
  size: string;
  status: FileStatusEnum;
  item: Item;
}

export class PreviewFile {
  docId: string;
  canEdit: boolean;
  name: string;
  size: string;
  status: string;
  typeFile: string;
  dataCriacao: string;
  dataExpiracao: string;
  downloadLimit: number;
  downloadCount: number;
}

export class Item {
  docId: string;
  completePath: string;
  type: TypeItemEnum;
  name: string;
  size: string;
  typeFile: string;
  status: FileStatusEnum;
  dataCriacao: string;
  dataExpiracao: string;
  downloadLimit: number;
  downloadCount: number;
}

export class FilePathWithName {
  name: string;
  itemPath: string
}

export enum FileStatusEnum {
  Disponivel = 0,
  NaoDisponivel = 1,
}

export enum NavigationMode {
  Back = 0,
  Foward = 1,
}

export enum TypeItemEnum {
  SingleFile = 0,
  Folder = 1,
  Link = 2
}

export enum ModalOpenMode {
  Remove = 0,
  Disable = 1,
  Edit = 2
}