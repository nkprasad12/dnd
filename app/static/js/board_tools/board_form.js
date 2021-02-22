var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { checkDefined, getElementById, getOrigin } from '/static/js/common/common.js';
import { BoardModel, TokenModel } from '/static/js/game_board/model/board_model.js';
import { LoadedImage } from '/static/js/utils/image_utils.js';
const IMAGE_TYPES = ['image/jpg', 'image/jpeg', 'image/png'];
// eslint-disable-next-line no-unused-vars
var InputType;
(function (InputType) {
    // eslint-disable-next-line no-unused-vars
    InputType["IMAGE_INPUT"] = "file";
    // eslint-disable-next-line no-unused-vars
    InputType["NUMBER_INPUT"] = "number";
    // eslint-disable-next-line no-unused-vars
    InputType["TEXT_INPUT"] = "text";
})(InputType || (InputType = {}));
function handleImageUpload(event) {
    var _a;
    if (((_a = event === null || event === void 0 ? void 0 : event.target) === null || _a === void 0 ? void 0 : _a.files) == null || event.target.files.length == 0) {
        return Promise.reject(new Error('File upload event was null'));
    }
    const file = event.target.files[0];
    if (!IMAGE_TYPES.includes(file.type)) {
        return Promise.reject(new Error('Invalid file upload type'));
    }
    const loadImagePromise = loadImageFromFile(file);
    const saveImagePromise = saveImageToServer(file);
    return Promise.all([loadImagePromise, saveImagePromise])
        .then((promises) => new LoadedImage(promises[0], promises[1]));
}
function loadImageFromFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            var _a;
            const image = document.createElement('img');
            const result = (_a = event.target) === null || _a === void 0 ? void 0 : _a.result;
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
export function saveImageToServer(file) {
    return __awaiter(this, void 0, void 0, function* () {
        const formData = new FormData();
        formData.append('file', file);
        const response = yield fetch(getOrigin() + '/uploadImage', {
            method: 'POST',
            body: formData,
        });
        const data = yield response.json();
        const path = SERVER_PREFIX + '/retrieve_image/' + data.path;
        return path;
    });
}
function addModal(parent) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    parent.appendChild(modal);
    return modal;
}
function addModalContent(modal) {
    const content = document.createElement('div');
    content.className = 'modal-content';
    modal.appendChild(content);
    return content;
}
function addCloseSpan(parent) {
    const closeSpan = document.createElement('span');
    closeSpan.className = 'close';
    closeSpan.innerHTML = '&times;';
    parent.appendChild(closeSpan);
    return closeSpan;
}
function addParagraph(parent, content) {
    const paragraph = document.createElement('p');
    paragraph.innerHTML = content;
    parent.appendChild(paragraph);
    return paragraph;
}
function addLabel(parent, content) {
    const item = document.createElement('label');
    item.innerHTML = content;
    parent.appendChild(item);
    return item;
}
function addInput(parent, inputType) {
    const item = document.createElement('input');
    item.type = inputType;
    if (inputType === InputType.IMAGE_INPUT) {
        item.accept = 'image/*';
    }
    parent.appendChild(item);
    return item;
}
function addBreak(parent, numBreaks) {
    for (let i = 0; i < numBreaks; i++) {
        parent.appendChild(document.createElement('br'));
    }
}
function addSubmitButton(parent, label) {
    const item = document.createElement('button');
    item.className = 'btn-success';
    item.innerHTML = label;
    parent.appendChild(item);
    return item;
}
function addInputSection(parent, label, inputType) {
    addLabel(parent, label);
    addBreak(parent, 1);
    const inputField = addInput(parent, inputType);
    addBreak(parent, 2);
    return inputField;
}
class FormInputEntry {
}
export class TextInputEntry extends FormInputEntry {
    constructor(label) {
        super();
        this.label = label;
    }
    addToParent(parent, listener) {
        const inputField = addInputSection(parent, this.label, InputType.TEXT_INPUT);
        inputField.oninput = (event) => {
            // @ts-ignore
            const target = event.target;
            this.result = target.value.length === 0 ? undefined : target.value;
            listener(this.result != undefined);
        };
    }
    getResolved() {
        return this.result;
    }
}
export class NumberInputEntry extends FormInputEntry {
    constructor(label) {
        super();
        this.label = label;
    }
    addToParent(parent, listener) {
        const inputField = addInputSection(parent, this.label, InputType.NUMBER_INPUT);
        inputField.oninput = (event) => {
            // @ts-ignore
            const target = event.target;
            this.result =
                target.value.length === 0 ? undefined : parseInt(target.value);
            listener(this.result != undefined);
        };
    }
    getResolved() {
        return this.result;
    }
}
export class ImageInputEntry extends FormInputEntry {
    constructor(label) {
        super();
        this.label = label;
    }
    addToParent(parent, listener) {
        const inputField = addInputSection(parent, this.label, InputType.IMAGE_INPUT);
        inputField.onchange =
            (event) => {
                handleImageUpload(event)
                    .then((imageSource) => {
                    this.result = imageSource;
                    listener(true);
                });
            };
    }
    getResolved() {
        return this.result;
    }
}
function addAllInputFields(parent, inputEntries, onAllInputsReady) {
    const ready = [];
    for (let i = 0; i < inputEntries.length; i++) {
        const entry = inputEntries[i];
        ready.push(false);
        entry.addToParent(parent, (isReady) => {
            ready[i] = isReady;
            onAllInputsReady(!ready.includes(false));
        });
    }
}
/** Class for a form requesting information to make a game board. */
class BaseDialogForm {
    constructor(parent, title, inputFields, onSubmit) {
        this.modal = addModal(parent);
        this.modalContent = addModalContent(this.modal);
        const closeSpan = addCloseSpan(this.modalContent);
        closeSpan.addEventListener('click', () => {
            this.hide();
        });
        addParagraph(this.modalContent, title);
        addAllInputFields(this.modalContent, inputFields, (allReady) => {
            this.submitButton.style.display = allReady ? 'block' : 'none';
        });
        this.submitButton = addSubmitButton(this.modalContent, 'Create');
        this.submitButton.style.display = 'none';
        this.submitButton.onclick = (_unused) => {
            this.hide();
            onSubmit();
        };
    }
    show() {
        this.modal.style.display = 'block';
    }
    hide() {
        this.modal.style.display = 'none';
    }
}
/** Class for a form requesting information to make a game board. */
export class NewBoardForm extends BaseDialogForm {
    static createOnClick(bindingElementId, parentId, onNewBoard) {
        const boardForm = new NewBoardForm(getElementById(parentId), onNewBoard);
        getElementById(bindingElementId).onclick = () => {
            boardForm.show();
        };
    }
    constructor(parent, onNewBoard) {
        const boardNameEntry = new TextInputEntry('Board Name');
        const tileSizeEntry = new NumberInputEntry('Tile Size (pixels)');
        const backgroundImageEntry = new ImageInputEntry('Background Image');
        super(parent, 'Create a new board', [boardNameEntry, tileSizeEntry, backgroundImageEntry], () => {
            const boardName = checkDefined(boardNameEntry.getResolved(), 'boardName');
            const tileSize = checkDefined(tileSizeEntry.getResolved(), 'tileSize');
            const backgroundImage = checkDefined(backgroundImageEntry.getResolved(), 'backgroundImage');
            onNewBoard(BoardModel.Builder.forNewBoard()
                .setName(boardName)
                .setBackgroundImage(backgroundImage)
                .setTileSize(tileSize)
                .build());
        });
    }
}
const TOKEN_FORM_STUB = 'addNewIconFormStub';
/** Class for a form requesting information to make a game board. */
export class NewTokenForm extends BaseDialogForm {
    static create(tile, modelHandler) {
        const form = new NewTokenForm(
        // TODO: get this from the menu itself.
        getElementById(TOKEN_FORM_STUB), tile, (token) => {
            console.log('NewTokenForm onNewToken');
            const newModel = modelHandler.copyModel();
            newModel.tokens.push(token);
            modelHandler.update(newModel);
        });
        form.show();
    }
    static createOnClick(bindingElementId, parentId, tile, onNewToken) {
        const boardForm = new NewTokenForm(getElementById(parentId), tile, onNewToken);
        getElementById(bindingElementId).onclick = () => {
            boardForm.show();
        };
    }
    constructor(parent, tile, onNewToken) {
        const nameEntry = new TextInputEntry('Token Name');
        const speedEntry = new NumberInputEntry('Speed (tiles / move)');
        const iconEntry = new ImageInputEntry('Icon');
        super(parent, 'Create a new token', [nameEntry, speedEntry, iconEntry], () => {
            const name = checkDefined(nameEntry.getResolved(), 'name');
            const icon = checkDefined(iconEntry.getResolved(), 'icon');
            const speed = checkDefined(speedEntry.getResolved(), 'speed');
            const token = TokenModel.create(name, icon, 1, tile, false, speed);
            console.log(token);
            onNewToken(token);
        });
    }
}
