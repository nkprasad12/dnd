import {checkDefined, getElementById, getOrigin, Location, Point} from '/src/common/common';
import {ModelHandler} from '/src/game_board/controller/model_handler';
import {BoardModel, TokenModel} from '/src/game_board/model/board_model';
import {LoadedImage} from '/src/utils/image_utils';

const IMAGE_TYPES: string[] = ['image/jpg', 'image/jpeg', 'image/png'];

const TEXT_COLOR = 'rgb(143, 77, 23)';

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

const SERVER_PREFIX = 'server@';

export async function saveImageToServer(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(getOrigin() + '/uploadImage', {
    method: 'POST',
    body: formData,
  });
  const data = await response.json();
  const path = SERVER_PREFIX + '/retrieve_image/' + data.path;
  return path;
}

function addDiv(parent: HTMLElement): HTMLElement {
  const element = document.createElement('div');
  parent.appendChild(element);
  return element;
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

function addLabel(
    parent: HTMLElement, content: string, color?: string): HTMLElement {
  const item = document.createElement('label');
  if (color !== undefined) {
    item.style.color = color;
  }
  item.innerHTML = content;
  parent.appendChild(item);
  return item;
}

function addInput(parent: HTMLElement, inputType: InputType): HTMLInputElement {
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

function addSubmitButton(
    parent: HTMLElement, label: string): HTMLButtonElement {
  const item = document.createElement('button');
  item.className = 'btn-success';
  item.innerHTML = label;
  parent.appendChild(item);
  return item;
}

function addInputSection(
    parent: HTMLElement, label: string, inputType: InputType,
    color?: string): HTMLInputElement {
  addLabel(parent, label, color);
  addBreak(parent, 1);
  const inputField = addInput(parent, inputType);
  addBreak(parent, 2);
  return inputField;
}

function addNumberInputSection(
    parent: HTMLElement, label: string,
    options?: NumberInputEntryOptions): HTMLElement {
  const inputField =
      addInputSection(
          parent, label, InputType.NUMBER_INPUT, options?.textColor);
  if (options?.min !== undefined) {
    inputField.min = String(options.min);
    inputField.max = String(options.max);
  }
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

export interface NumberInputEntryOptions {
  textColor?: string;
  min?: number;
  max?: number;
}

export class NumberInputEntry extends FormInputEntry<number> {
  private result?: number;

  constructor(
      private readonly label: string,
      private readonly options?: NumberInputEntryOptions) {
    super();
  }

  addToParent(parent: HTMLElement, listener: ResolvedListener): void {
    const inputField = addNumberInputSection(parent, this.label, this.options);
    inputField.oninput = (event) => {
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

/** Class for a generic simple form requesting information. */
abstract class BaseSimpleForm {
  private readonly root: HTMLElement;
  private readonly submitButton: HTMLButtonElement;

  protected constructor(
      parent: HTMLElement,
      inputFields: FormInputEntry<any>[],
      onSubmit: () => any) {
    this.root = addDiv(parent);
    addAllInputFields(
        this.root,
        inputFields,
        (allReady) => {
          this.submitButton.disabled = allReady ? false : true;
        });
    this.submitButton = addSubmitButton(this.root, 'Update');
    this.submitButton.disabled = true;
    this.submitButton.style.display = 'block';
    this.submitButton.onclick = () => {
      onSubmit();
    };
  }

  protected show(): void {
    this.root.style.display = 'block';
  }

  protected hide(): void {
    this.root.style.display = 'none';
  }
}

export interface BoardUpdateData {
  tileSize: number;
  offset: Point;
}

/** Class for a form requesting information to make a game board. */
export class BoardUpdateForm extends BaseSimpleForm {
  static create(
      parentId: string,
      onUpdate: (data: BoardUpdateData) => any): void {
    new BoardUpdateForm(getElementById(parentId), onUpdate);
  }

  private constructor(
      parent: HTMLElement,
      onUpdate: (data: BoardUpdateData) => any) {
    const tileSizeEntry: NumberInputEntry =
        new NumberInputEntry(
            'Tile Size (in pixels)', {textColor: TEXT_COLOR, min: 10});
    const offsetXEntry: NumberInputEntry =
        new NumberInputEntry(
            'Grid Offset X (in pixels, 0 <= offset < tileSize)',
            {textColor: TEXT_COLOR, min: 0});
    const offsetYEntry: NumberInputEntry =
        new NumberInputEntry(
            'Grid Offset Y (in pixel, 0 <= offset < tileSize)',
            {textColor: TEXT_COLOR, min: 0});
    super(
        parent, [tileSizeEntry, offsetXEntry, offsetYEntry],
        () => {
          const tileSize =
              checkDefined(tileSizeEntry.getResolved(), 'tileSize');
          const offsetX =
              checkDefined(offsetXEntry.getResolved(), 'offsetX');
          const offsetY =
              checkDefined(offsetYEntry.getResolved(), 'offsetY');
          if (tileSize < 1 || offsetX < 0 ||
             offsetX >= tileSize || offsetY < 0 || offsetY >= tileSize) {
            console.log('Invalid input! ignoring');
            return;
          }
          onUpdate({tileSize: tileSize, offset: {x: offsetX, y: offsetY}});
        },
    );
  }
}

/** Class for a generic dialog form requesting information. */
abstract class BaseDialogForm {
  private readonly modal: HTMLElement;
  private readonly modalContent: HTMLElement;
  private readonly submitButton: HTMLElement;

  protected constructor(
      parent: HTMLElement,
      title: string,
      inputFields: FormInputEntry<any>[],
      onSubmit: () => any) {
    this.modal = addModal(parent);
    this.modalContent = addModalContent(this.modal);
    const closeSpan = addCloseSpan(this.modalContent);
    closeSpan.addEventListener(
        'click', () => {
          this.hide();
        });
    addParagraph(this.modalContent, title);
    addAllInputFields(
        this.modalContent,
        inputFields,
        (allReady) => {
          this.submitButton.style.display = allReady ? 'block' : 'none';
        });
    this.submitButton = addSubmitButton(this.modalContent, 'Create');
    this.submitButton.style.display = 'none';
    this.submitButton.onclick = (_unused) => {
      this.hide();
      onSubmit();
    };
  }

  protected show(): void {
    this.modal.style.display = 'block';
  }

  protected hide(): void {
    this.modal.style.display = 'none';
  }
}

/** Class for a form requesting information to make a game board. */
export class NewBoardForm extends BaseDialogForm {
  static createOnClick(
      bindingElementId: string,
      parentId: string,
      onNewBoard: (model: BoardModel) => any): void {
    const boardForm = new NewBoardForm(getElementById(parentId), onNewBoard);
    getElementById(bindingElementId).onclick = () => {
      boardForm.show();
    };
  }

  private constructor(
      parent: HTMLElement,
      onNewBoard: (boardModel: BoardModel) => any) {
    const boardNameEntry: TextInputEntry = new TextInputEntry('Board Name');
    const tileSizeEntry: NumberInputEntry =
        new NumberInputEntry('Tile Size (pixels)');
    const backgroundImageEntry: ImageInputEntry =
        new ImageInputEntry('Background Image');
    super(
        parent, 'Create a new board',
        [boardNameEntry, tileSizeEntry, backgroundImageEntry],
        () => {
          const boardName =
              checkDefined(boardNameEntry.getResolved(), 'boardName');
          const tileSize =
              checkDefined(tileSizeEntry.getResolved(), 'tileSize');
          const backgroundImage =
              checkDefined(
                  backgroundImageEntry.getResolved(), 'backgroundImage');
          onNewBoard(
              BoardModel.Builder.forNewBoard()
                  .setName(boardName)
                  .setBackgroundImage(backgroundImage)
                  .setTileSize(tileSize)
                  .build());
        },
    );
  }
}

const TOKEN_FORM_STUB = 'addNewIconFormStub';

/** Class for a form requesting information to make a game board. */
export class NewTokenForm extends BaseDialogForm {
  static create(tile: Location, modelHandler: ModelHandler) {
    const form = new NewTokenForm(
        // TODO: get this from the menu itself.
        getElementById(TOKEN_FORM_STUB),
        tile,
        (token) => {
          console.log('NewTokenForm onNewToken');
          const newModel = modelHandler.copyModel();
          newModel.tokens.push(token);
          modelHandler.update(newModel);
        });
    form.show();
  }

  static createOnClick(
      bindingElementId: string,
      parentId: string,
      tile: Location,
      onNewToken: (model: TokenModel) => any): void {
    const boardForm =
        new NewTokenForm(getElementById(parentId), tile, onNewToken);
    getElementById(bindingElementId).onclick = () => {
      boardForm.show();
    };
  }

  private constructor(
      parent: HTMLElement,
      tile: Location,
      onNewToken: (model: TokenModel) => any) {
    const nameEntry: TextInputEntry = new TextInputEntry('Token Name');
    const sizeEntry: NumberInputEntry =
        new NumberInputEntry('Size (tiles)');
    const speedEntry: NumberInputEntry =
        new NumberInputEntry('Speed (tiles / move)');
    const iconEntry: ImageInputEntry = new ImageInputEntry('Icon');
    super(
        parent, 'Create a new token',
        [nameEntry, sizeEntry, speedEntry, iconEntry],
        () => {
          const name = checkDefined(nameEntry.getResolved(), 'name');
          const icon = checkDefined(iconEntry.getResolved(), 'icon');
          const speed = checkDefined(speedEntry.getResolved(), 'speed');
          const size = checkDefined(speedEntry.getResolved(), 'size');
          const token = TokenModel.create(name, icon, size, tile, false, speed);
          console.log(token);
          onNewToken(token);
        },
    );
  }
}
