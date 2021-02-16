import { Socket_, connectTo } from './server/socket_connection'

interface HTMLInputEvent extends Event {
  target: HTMLInputElement & EventTarget;
}

const handleImageUpload = (event: HTMLInputEvent) => {
  if (event == null) {
    console.log('File upload event was null');
    return;
  }
  const files = event.target.files;
  const formData = new FormData()
  // @ts-ignore
  formData.append('file', files[0])

  fetch('http://127.0.0.1:5000/uploadImage', {
    method: 'POST',
    body: formData
  })
    .then(response => {
      console.log(response)
      return response.json()
    })
    .then(data => {
      console.log('Data: ' + data)
      console.log('Path: ' + data.path)
    })
    .catch(error => {
      console.error('Error: ' + error)
    })
}

listenForFileUpload();

// Make a container element for the list
let listContainer = document.createElement('div');
// Make the list
let listElement = document.createElement('ul');
document.getElementsByTagName('body')[0].appendChild(listContainer);
listContainer.appendChild(listElement);

let socketPromise: Promise<Socket_> = connectTo('chat');
socketPromise
  .then((socket) => {
    socket.emit('nitin', 'Connected from upload.ts');
    socket.on('nitin', (message) => { addToList(JSON.stringify(message)); });
  });

function addToList(message: string) {
  let listItem = document.createElement('li');
  listItem.innerHTML = message;
  listElement.appendChild(listItem);
}

function listenForFileUpload() {
  let upload = document.querySelector('#fileUpload');
  if (upload == null) {
    console.log('Could not file fileUpload element. Uploads will not work.');
    return;
  }
  upload.addEventListener('change', (event) => {
    console.log('Got image upload request')
    // @ts-ignore
    handleImageUpload(event)
  });
}
