import React, { useState } from 'react';
import Pause_Img from './assests/pause_button@2x.png'
import Record_Img from './assests/record_button@2x.png'
import './App.scss';
import RecordRTC from 'recordrtc';
import ReactPlayer from 'react-player'
import moment from 'moment';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

let recorder;
const mediaConstraints = {
  audio: true
};

function App() {
  const [isRecording, setIsRecording] = useState(false)
  const [recognizeResult, setRecognizeResult] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [fileName, setFileName] = useState('')
  const [fineTune, setFineTune] = useState('')
  const [ttsURL, setTTSURL] = useState('')

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
    setFileName('')
    setTTSURL('')
    setFineTune('')
    navigator.getWebcam = (navigator.getUserMedia || navigator.webKitGetUserMedia || navigator.moxGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
    navigator.getWebcam(mediaConstraints, onMediaSuccess, onMediaError);
  }

  const stopRecording =  () => {
    setIsRecording(false)
    setIsLoading(true)
    recorder.stopRecording(function () {
      const time = moment().format('MMDDHHmmssSSS');
      let blob = recorder.getBlob();
      let form = new FormData();
      form.append('file', blob, `${time}.wav`);
      
      let requestOptions = {
        method: 'POST',
        body: form
      };
      fetch('/api/recognize', requestOptions)
      .then(response => response.json())
      .then(result => {
        console.log(result)
        setRecognizeResult(result.result)
        setFileName(result.filename)
        setIsLoading(false)
        tts(result.result)
      })
      .catch(error => console.log('error', error)); 
    })
  }

  const handleChange = (event) => {
    setFineTune(event.target.value)
  }

  const onFineTuneSubmit = () => {
    let requestOptions = {
      method: 'POST',
      body: JSON.stringify({
        filename: fileName,
        text: fineTune
      }),
      headers: {
        'content-type': 'application/json'
      }
    };
    fetch('/api/finetune', requestOptions)
    .then(response => response.text())
    .then(result => {
      console.log(result)
      setFileName('')
      toast("Finetuned!", {
        position: "bottom-center",
        autoClose: 1500,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
      });
    })
    .catch(error => console.log('error', error)); 
  }
  const tts = (result) => {
    const textIndex = result.indexOf('|')
    const textToSpeech = result.substring(textIndex+1)
    let requestOptions = {
      method: 'POST',
      body: JSON.stringify({
        text: textToSpeech
      }),
      headers: {
        'content-type': 'application/json'
      }
    };
    fetch('/api/tts', requestOptions)
    .then(response => response.blob())
    .then(result => {
      console.log(result)
      const url = URL.createObjectURL(result)
      setTTSURL(url)
    })
    .catch(error => console.log('error', error));
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
            <div className="loaders">
              <div className="loader">
                <div className="loader-inner line-scale">
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
            <div className="result-container">
              <p>
                {recognizeResult}
              </p>
              {
                ttsURL !== '' && ttsURL !== undefined && 
                <ReactPlayer
                  url={ttsURL}
                  className='react-player'
                  playing
                  controls
                  width='70vw'
                  height='5vh'
                  config={{
                    file: {
                      forceAudio: true
                    }
                  }}
                />
              }
              {
                (ttsURL === '' || ttsURL === undefined) && 
                <div className="loaders">
                  <div className="loader">
                    <div className="loader-inner line-scale">
                      <div></div>
                      <div></div>
                      <div></div>
                      <div></div>
                      <div></div>
                    </div>
                  </div>
                </div>
              }
            </div>
          }
          {
            fileName !== '' &&
            <div>
              <input type="text" placeholder="Finetune the result here" className="finetune" onChange={handleChange}/>
              <button className="finetune-button" onClick={onFineTuneSubmit}>Submit</button>
            </div>
          }
        </div>
        <ToastContainer 
          position="bottom-center"
          autoClose={1500}
          hideProgressBar
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover={false}
        />
      </header>
    </div>
  );
}

export default App;
