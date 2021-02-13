const handleImageUpload = (event) => {
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
