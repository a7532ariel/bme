const express = require('express')
const cors = require('cors')
const path = require('path')
const https = require('https');
const bodyParser = require('body-parser');
const FormData = require('form-data');
const fetch = require('node-fetch');
const { Readable } = require('stream');
const multer = require('multer');
let upload = multer();

// Create the server
const app = express()


function bufferToStream(binary) {
    const readableInstanceStream = new Readable({
      read() {
        this.push(binary);
        this.push(null);
      }
    });
    return readableInstanceStream;
}

// Serve static files from the React frontend app
app.use(bodyParser.json({
    limit: '10mb', extended: true
}));                        
app.use(express.static(path.join(__dirname, '/build')))
const apiUrl = "https://140.112.29.224:1234/recognize"

// Serve our base route that returns a Hellow World cow
app.post('/api/recognize', upload.single('file'), cors(), async (req, res, next) => {
  console.log(req.file)
  try {
    const readStream = bufferToStream(req.file.buffer);
    let form = new FormData();
    form.append('file', readStream, 'test');
    fetch(apiUrl, {
        method: 'POST',
        body: req.file.buffer,
        // body: JSON.stringify({
        //     'buffer': req.file.buffer,
        //     'filename': 'hahaha'
        // })
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
  } catch (err) {
    next(err)
  }
})

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname + '/build/index.html'))
})

// Choose the port and start the server
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Mixing it up on port ${PORT}`)
})