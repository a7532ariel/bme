import React, { useState } from 'react';
import Pause_Img from './assests/pause_button@2x.png'
import Record_Img from './assests/record_button@2x.png'

import './App.css';
var MediaStreamRecorder = require('msr');

const apiUrl = "http://140.112.29.224:1234/recognize"

var mediaConstraints = {
  audio: true
};

let b = []
let mediaRecorder;

function App() {
  const [isRecording, setIsRecording] = useState(false)
  const [recognizeResult, setRecognizeResult] = useState('')

  function onMediaSuccess(stream) {
    mediaRecorder = new MediaStreamRecorder(stream);
    mediaRecorder.mimeType = 'audio/wav'; // check this line for audio/wav
    mediaRecorder.ondataavailable = function (blob) {
        console.log('chunk of real-time data is: ', blob);
        // POST/PUT "Blob" using FormData/XHR2
        b.push(blob);
    };
    mediaRecorder.start();
  }

  function onMediaError () {
    console.log('onMediaError')
  }

  const startRecording = () => {
    setIsRecording(true)
    setRecognizeResult('')
    navigator.getUserMedia(mediaConstraints, onMediaSuccess, onMediaError);
  }

  const stopRecording = () => {
    mediaRecorder.stop()
    setIsRecording(false)
    window.ConcatenateBlobs(b, 'audio/wav', function(concatenatedBlob) {
      console.log('recordedBlob is: ', concatenatedBlob);
      let form = new FormData();
      form.append('file', concatenatedBlob, 'test');
      console.log(form.get('file'))
      let requestOptions = {
        method: 'POST',
        body: form,
        // mode:'no-cors',
      };
      fetch(apiUrl, requestOptions)
      .then(response => response.text())
      .then(result => {
        console.log(result)
        setRecognizeResult(result)
      })
      .catch(error => console.log('error', error));
    });
    b = [];
  }

  return (
    <div className="App">
      <header className="App-header">
        <div>
          <div>
            {
              isRecording === false && 
                <img src={Record_Img} alt="start" onClick={startRecording}/>
            }
            {
              isRecording === true && 
                <img src={Pause_Img} alt="start" onClick={stopRecording}/>
            }
          </div>
          {
            recognizeResult !== '' && recognizeResult !== undefined &&
            <p>
              result: {recognizeResult}
            </p>
          }
        </div>
      </header>
    </div>
  );
}

export default App;