import React, { useState } from 'react';
import Pause_Img from './assests/pause_button@2x.png'
import Record_Img from './assests/record_button@2x.png'
import './App.scss';
import RecordRTC from 'recordrtc';

let recorder;
const mediaConstraints = {
  audio: true
};

function App() {
  const [isRecording, setIsRecording] = useState(false)
  const [recognizeResult, setRecognizeResult] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  function onMediaSuccess(stream) {
    recorder = RecordRTC(stream, {
      type: 'audio',
      mimeType: 'audio/wav',
      recorderType: RecordRTC.StereoAudioRecorder,
      numberOfAudioChannels: 1,
      desiredSampRate: 16000
    });
    recorder.startRecording();
  }

  function onMediaError () {
    console.log('onMediaError')
  }

  const startRecording = () => {
    setIsRecording(true)
    setRecognizeResult('')
    navigator.getWebcam = (navigator.getUserMedia || navigator.webKitGetUserMedia || navigator.moxGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
    navigator.getWebcam(mediaConstraints, onMediaSuccess, onMediaError);
  }

  const stopRecording =  () => {
    setIsRecording(false)
    setIsLoading(true)
    recorder.stopRecording(function () {
      let blob = recorder.getBlob();
      let form = new FormData();
      form.append('file', blob, 'test');
      
      let requestOptions = {
        method: 'POST',
        body: form
      };
      fetch('/api/recognize', requestOptions)
      .then(response => response.text())
      .then(result => {
        console.log(result)
        setRecognizeResult(result)
        setIsLoading(false)
      })
      .catch(error => console.log('error', error)); 
    })
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
            isLoading === true &&
            <div class="loaders">
              <div class="loader">
                <div class="loader-inner line-scale">
                  <div></div>
                  <div></div>
                  <div></div>
                  <div></div>
                  <div></div>
                </div>
              </div>
            </div>
          }
          {
            recognizeResult !== '' && recognizeResult !== undefined &&
            <p>
              {recognizeResult}
            </p>
          }
        </div>
      </header>
    </div>
  );
}

export default App;
