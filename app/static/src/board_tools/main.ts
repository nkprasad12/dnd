const PREVIEW_BUTTON = 'previewBoard';
const PREVIEW_MODAL_CLOSE = 'closeModal';
const PREVIEW_MODAL = 'myModal';

const CREATE_BUTTON = 'createBoard';
const CREATE_MODAL_CLOSE = 'closeCreateBoardModal';
const CREATE_MODAL = 'createBoardModal';
const CREATE_UPLOAD_BUTTON = 'uploadBackground';
const CREATE_MESSAGE = 'createBoardMessage';
const CREATE_SUBMIT_BUTTON = 'createBoardSubmit';


const CLICK_EVENT = 'click';

const IMAGE_TYPES: string[] = ['image/jpg', 'image/jpeg', 'image/png'];

interface HTMLInputEvent extends Event {
  target: HTMLInputElement & EventTarget;
}

function getElementById(id: string): HTMLElement {
  const element = document.getElementById(id);
  if (element == null) {
    throw new Error('getElementById on invalid id: ' + id);
  }
  return element;
}

function setupModal(buttonId: string, modalId: string, closeId: string): void {
  const modal: HTMLElement = getElementById(modalId);

  getElementById(buttonId).addEventListener(
      CLICK_EVENT,
      () => {
        modal.style.display = 'block';
      });

  getElementById(closeId).addEventListener(
      CLICK_EVENT,
      () => {
        modal.style.display = 'none';
      });
}

function handleImageUpload(event: HTMLInputEvent): Promise<string> {
  if (event?.target?.files == null || event.target.files.length == 0) {
    return Promise.reject(new Error('File upload event was null'));
  }
  const file: File = event.target.files[0];
  console.log(file.type);
  if (!IMAGE_TYPES.includes(file.type)) {
    return Promise.reject(new Error('Invalid file upload type'));
  }

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

function setupNewBoardModal(): void {
  setupModal(CREATE_BUTTON, CREATE_MODAL, CREATE_MODAL_CLOSE);
  // TODO: Add a listener to this button
  getElementById(CREATE_SUBMIT_BUTTON).style.display = 'none';
  getElementById(CREATE_UPLOAD_BUTTON).addEventListener(
      'change',
      (event) => {
        handleImageUpload((event as HTMLInputEvent))
            .then((imageSource) => {
              // TODO: Validate that other fields were set correctly and create
              // a RemoteBoardModel from this
              console.log('Image source: %s', imageSource);
              getElementById(CREATE_SUBMIT_BUTTON).style.display = 'block';
              getElementById(CREATE_MESSAGE).textContent = 'You did it!';
            });
      });
}


setupModal(PREVIEW_BUTTON, PREVIEW_MODAL, PREVIEW_MODAL_CLOSE);
setupNewBoardModal();
