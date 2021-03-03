import {Socket_, connectTo} from '_client/server/socket_connection';
import {saveImageToServer} from '_client/board_tools/board_form';

interface HTMLInputEvent extends Event {
  target: HTMLInputElement & EventTarget;
}

const handleImageUpload = (event: HTMLInputEvent) => {
  if (event == null) {
    console.log('File upload event was null');
    return;
  }
  const files = event.target.files;
  if (files === null) {
    console.log('Files object was null');
    return;
  }
  saveImageToServer(files[0]);
};

listenForFileUpload();

// Make a container element for the list
const listContainer = document.createElement('div');
// Make the list
const listElement = document.createElement('ul');
document.getElementsByTagName('body')[0].appendChild(listContainer);
listContainer.appendChild(listElement);

const socketPromise: Promise<Socket_> = connectTo('chat');
socketPromise
    .then((socket) => {
      socket.emit('nitin', 'Connected from upload.ts');
      socket.on('nitin', (message) => {
        addToList(JSON.stringify(message));
      });
    });

/**  */
function addToList(message: string) {
  const listItem = document.createElement('li');
  listItem.innerHTML = message;
  listElement.appendChild(listItem);
}

function listenForFileUpload() {
  const upload = document.querySelector('#fileUpload');
  if (upload == null) {
    console.log('Could not file fileUpload element. Uploads will not work.');
    return;
  }
  upload.addEventListener('change', (event) => {
    console.log('Got image upload request');
    // @ts-ignore
    handleImageUpload(event);
  });
}
