const handleImageUpload = (event: Event) => {
  const files = event.target.files
  const formData = new FormData()
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

var upload = document.querySelector('#fileUpload')
console.log(upload)
upload.addEventListener('change', event => {
  console.log('Got image upload request')
  handleImageUpload(event)
})

var socket;

// TODO - figure out how to import io here. Currently we're running a js script
//        in the html before this script runs that sets up the io variable. 
socket = io.connect('http://localhost:5000/chat')
socket.on('connect', function () {
  console.log('Connected to socket')
  socket.emit('nitin', { data: 'I\'m connected from upload.ts!' });
});

// Make a container element for the list
var listContainer = document.createElement('div');
// Make the list
var listElement = document.createElement('ul');
document.getElementsByTagName('body')[0].appendChild(listContainer);
listContainer.appendChild(listElement);

socket.on('nitin', (message) => {
  console.log('message' + message);
  addToList(JSON.stringify(message));
});

function addToList(message: string) {
  var listItem = document.createElement('li');
  listItem.innerHTML = message;
  listElement.appendChild(listItem);
}
