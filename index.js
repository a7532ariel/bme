const express = require('express')
const cors = require('cors')
const path = require('path')
const https = require('https');
const bodyParser = require('body-parser');
const FormData = require('form-data');
const fetch = require('node-fetch');
const multer = require('multer');
let upload = multer();

// Create the server
const app = express()

// Serve static files from the React frontend app
app.use(bodyParser.json({
    limit: '10mb', extended: true
}));                  
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(express.static(path.join(__dirname, '/build')))
// const apiUrl = "http://0.0.0.0:1234"
const apiUrl = "https://140.112.29.224:1234"

// Serve our base route that returns a Hellow World cow
app.post('/api/recognize', upload.single('file'), cors(), (req, res, next) => {
  console.log(req.file)
  let form = new FormData();
  form.append('file', req.file.buffer, req.file.originalname);
  form.append("filename", req.file.originalname);
  fetch(`${apiUrl}/recognize`, {
      method: 'POST',
      body: form,
      agent: new https.Agent({  
          rejectUnauthorized: false
      })
  })
  .then(response => response.json())
  .then(result => {
      console.log(result)
      res.send(result)
  })
  .catch(error => console.log('error', error)); 
})

app.post('/api/finetune', cors(), (req, res, next) => {
  console.log(req.body)
  fetch(`${apiUrl}/finetune`, {
    method: 'POST',
    body: JSON.stringify(req.body),
    headers: {'Content-Type': 'application/json'},
    agent: new https.Agent({  
        rejectUnauthorized: false
    })
  })
  .then(response => response.text())
  .then(result => {
      console.log(result)
      res.send(result)
  })
  .catch(error => console.log('error', error)); 
})

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname + '/build/index.html'))
})

// Choose the port and start the server
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Mixing it up on port ${PORT}`)
})