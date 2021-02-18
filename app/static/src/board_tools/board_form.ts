import {checkDefined, getElementById} from '/src/common/common';
import {BoardModel, BoardModelBuilder} from '/src/game_board/model/board_model';
import {LoadedImage} from '/src/utils/image_utils';

const IMAGE_TYPES: string[] = ['image/jpg', 'image/jpeg', 'image/png'];


interface HTMLInputEvent extends Event {
  target: HTMLInputElement & EventTarget;
}

// eslint-disable-next-line no-unused-vars
enum InputType {
  // eslint-disable-next-line no-unused-vars
  IMAGE_INPUT = 'file',
  // eslint-disable-next-line no-unused-vars
  NUMBER_INPUT = 'number',
  // eslint-disable-next-line no-unused-vars
  TEXT_INPUT = 'text',
}

function handleImageUpload(event: HTMLInputEvent): Promise<LoadedImage> {
  if (event?.target?.files == null || event.target.files.length == 0) {
    return Promise.reject(new Error('File upload event was null'));
  }
  const file: File = event.target.files[0];
  if (!IMAGE_TYPES.includes(file.type)) {
    return Promise.reject(new Error('Invalid file upload type'));
  }

  const loadImagePromise = loadImageFromFile(file);
  const saveImagePromise = saveImageToServer(file);
  return Promise.all([loadImagePromise, saveImagePromise])
      .then((promises) => new LoadedImage(promises[0], promises[1]));
}

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const image = document.createElement('img');
      const result = event.target?.result;
      if (result === null || result === undefined) {
        reject(new Error('File result was null or undefined!'));
        return;
      }
      if (typeof result != 'string') {
        reject(new Error('File result was not string!'));
        return;
      }
      image.src = result;
      resolve(image);
    };
    reader.readAsDataURL(file);
  });
}

function saveImageToServer(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  return fetch('http://127.0.0.1:5000/uploadImage', {
    method: 'POST',
    body: formData,
  })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        const path = 'http://localhost:5000/retrieve_image/' + data.path;
        return path;
      });
}

function addModal(parent: HTMLElement): HTMLElement {
  const modal = document.createElement('div');
  modal.className = 'modal';
  parent.appendChild(modal);
  return modal;
}

function addModalContent(modal: HTMLElement): HTMLElement {
  const content = document.createElement('div');
  content.className = 'modal-content';
  modal.appendChild(content);
  return content;
}

function addCloseSpan(parent: HTMLElement): HTMLElement {
  const closeSpan = document.createElement('span');
  closeSpan.className = 'close';
  closeSpan.innerHTML = '&times;';
  parent.appendChild(closeSpan);
  return closeSpan;
}

function addParagraph(parent: HTMLElement, content: string): HTMLElement {
  const paragraph = document.createElement('p');
  paragraph.innerHTML = content;
  parent.appendChild(paragraph);
  return paragraph;
}

function addLabel(parent: HTMLElement, content: string): HTMLElement {
  const item = document.createElement('label');
  item.innerHTML = content;
  parent.appendChild(item);
  return item;
}

function addInput(parent: HTMLElement, inputType: InputType): HTMLElement {
  const item = document.createElement('input');
  item.type = inputType;
  if (inputType === InputType.IMAGE_INPUT) {
    item.accept = 'image/*';
  }
  parent.appendChild(item);
  return item;
}

function addBreak(parent: HTMLElement, numBreaks: number): void {
  for (let i = 0; i < numBreaks; i++) {
    parent.appendChild(document.createElement('br'));
  }
}

function addSubmitButton(parent: HTMLElement, label: string): HTMLElement {
  const item = document.createElement('button');
  item.className = 'btn-success';
  item.innerHTML = label;
  parent.appendChild(item);
  return item;
}

function addInputSection(
    parent: HTMLElement, label: string, inputType: InputType): HTMLElement {
  addLabel(parent, label);
  addBreak(parent, 1);
  const inputField = addInput(parent, inputType);
  addBreak(parent, 2);
  return inputField;
}

type ResolvedListener = (resolved: boolean) => any;

abstract class FormInputEntry<T> {
  abstract addToParent(parent: HTMLElement, listener: ResolvedListener): void;
  abstract getResolved(): T|undefined;
}

export class TextInputEntry extends FormInputEntry<string> {
  private result?: string;

  constructor(private readonly label: string) {
    super();
  }

  addToParent(parent: HTMLElement, listener: ResolvedListener): void {
    const inputField =
        addInputSection(parent, this.label, InputType.TEXT_INPUT);
    inputField.oninput = (event) => {
      // @ts-ignore
      const target = (event.target as HTMLTextAreaElement);
      this.result = target.value.length === 0 ? undefined : target.value;
      listener(this.result != undefined);
    };
  }

  getResolved(): string|undefined {
    return this.result;
  }
}

export class NumberInputEntry extends FormInputEntry<number> {
  private result?: number;

  constructor(private readonly label: string) {
    super();
  }

  addToParent(parent: HTMLElement, listener: ResolvedListener): void {
    const inputField =
        addInputSection(parent, this.label, InputType.NUMBER_INPUT);
    inputField.oninput = (event) => {
      // @ts-ignore
      const target = (event.target as HTMLTextAreaElement);
      this.result =
          target.value.length === 0 ? undefined : parseInt(target.value);
      listener(this.result != undefined);
    };
  }

  getResolved(): number|undefined {
    return this.result;
  }
}

export class ImageInputEntry extends FormInputEntry<LoadedImage> {
  private result?: LoadedImage;

  constructor(private readonly label: string) {
    super();
  }

  addToParent(
      parent: HTMLElement, listener: ResolvedListener): void {
    const inputField =
        addInputSection(parent, this.label, InputType.IMAGE_INPUT);
    inputField.onchange =
      (event) => {
        handleImageUpload((event as HTMLInputEvent))
            .then((imageSource) => {
              this.result = imageSource;
              listener(true);
            });
      };
  }

  getResolved(): LoadedImage|undefined {
    return this.result;
  }
}

function addAllInputFields(
    parent: HTMLElement,
    inputEntries: FormInputEntry<any>[],
    onAllInputsReady: (allReady: boolean) => any): void {
  const ready: boolean[] = [];
  for (let i = 0; i < inputEntries.length; i++) {
    const entry = inputEntries[i];
    ready.push(false);
    entry.addToParent(
        parent,
        (isReady) => {
          ready[i] = isReady;
          onAllInputsReady(!ready.includes(false));
        });
  }
}

/** Class for a form requesting information to make a game board. */
export class BoardForm {
  static createOnClick(
      bindingElementId: string,
      parentId: string,
      onNewBoard: (model: BoardModel) => any): void {
    const boardForm = new BoardForm(getElementById(parentId), onNewBoard);
    getElementById(bindingElementId).onclick = () => {
      boardForm.show();
    };
  }

  private readonly modal: HTMLElement;
  private readonly modalContent: HTMLElement;
  private readonly submitButton: HTMLElement;

  private boardName: TextInputEntry = new TextInputEntry('Board Name');
  private tileSize: NumberInputEntry =
      new NumberInputEntry('Tile Size (pixels)');
  private backgroundImage: ImageInputEntry =
      new ImageInputEntry('Background Image');

  private constructor(
      parent: HTMLElement,
      onNewBoard: (boardModel: BoardModel) => any) {
    this.modal = addModal(parent);
    this.modalContent = addModalContent(this.modal);
    const closeSpan = addCloseSpan(this.modalContent);
    closeSpan.addEventListener(
        'click', () => {
          this.hide();
        });
    addParagraph(this.modalContent, 'Create New Board');
    addAllInputFields(
        this.modalContent,
        [this.boardName, this.tileSize, this.backgroundImage],
        (allReady) => {
          this.submitButton.style.display = allReady ? 'block' : 'none';
        });
    this.submitButton = addSubmitButton(this.modalContent, 'Create Board');
    this.submitButton.style.display = 'none';
    this.submitButton.onclick = (_unused) => {
      const boardName = checkDefined(this.boardName.getResolved(), 'boardName');
      const tileSize = checkDefined(this.tileSize.getResolved(), 'tileSize');
      const backgroundImage =
          checkDefined(this.backgroundImage.getResolved(), 'backgroundImage');
      this.hide();
      console.log(boardName);
      onNewBoard(
          new BoardModelBuilder()
              .setBackgroundImage(backgroundImage)
              .setTileSize(tileSize)
              .build());
    };
  }

  show(): void {
    this.modal.style.display = 'block';
  }

  private hide(): void {
    this.modal.style.display = 'none';
  }
}
