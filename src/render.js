const { desktopCapturer, remote, ipcRenderer } = require('electron');

const { writeFile } = require('fs');

const { dialog, Menu } = remote;

const RecordRTC = require('recordrtc')

const { spawn } =  require('child_process');
const record = require('node-record-lpcm16');

// const {shell} = require('electron') // deconstructing assignment
// shell.showItemInFolder('filepath') // Show the given file in a file manager. If possible, select the file.
// shell.openPath('folderpath') // pen the given file in the desktop's default manner.
// global state
let mediaRecorder; // mediarecorder instance to capture footage
let recordedChunks = [];

const {
  getCurrentWindow,
  openMenu,
  minimizeWindow,
  unmaximizeWindow,
  maxUnmaxWindow,
  isWindowMaximized,
  closeWindow,
} = require("./menu/menu-functions");

window.addEventListener("DOMContentLoaded", () => {
  window.getCurrentWindow = getCurrentWindow;
  window.openMenu = openMenu;
  window.minimizeWindow = minimizeWindow;
  window.unmaximizeWindow = unmaximizeWindow;
  window.maxUnmaxWindow = maxUnmaxWindow;
  window.isWindowMaximized = isWindowMaximized;
  window.closeWindow = closeWindow;
});


window.addEventListener("DOMContentLoaded", () => {
  const menuButton = document.getElementById("menu-btn");
  const minimizeButton = document.getElementById("minimize-btn");
  const maxUnmaxButton = document.getElementById("max-unmax-btn");
  const closeButton = document.getElementById("close-btn");

  menuButton.addEventListener("click", e => {
    // Opens menu at (x,y) coordinates of mouse click on the hamburger icon.
    window.openMenu(e.x, e.y);
  });

  minimizeButton.addEventListener("click", e => {
    window.minimizeWindow();
  });

  maxUnmaxButton.addEventListener("click", e => {
    const icon = maxUnmaxButton.querySelector("i.far");

    window.maxUnmaxWindow();

    // Change the middle maximize-unmaximize icons.
    if (window.isWindowMaximized()) {
      icon.classList.remove("fa-square");
      icon.classList.add("fa-clone");
    } else {
      icon.classList.add("fa-square");
      icon.classList.remove("fa-clone");
    }
  });


  closeButton.addEventListener("click", e => {
    window.closeWindow();
  });
});

// Buttons
const videoElement = document.querySelector('video');

const startBtn = document.getElementById('startBtn');
startBtn.onclick = e => {
  mediaRecorder.start();
  startBtn.classList.add('is-danger');
  startBtn.innerText = 'Recording';
};

const stopBtn = document.getElementById('stopBtn');

stopBtn.onclick = e => {
  mediaRecorder.stop();
  startBtn.classList.remove('is-danger');
  startBtn.innerText = 'Start';
};

const videoSelectBtn = document.getElementById('videoSelectBtn');
videoSelectBtn.onclick = getVideoSources;

// get the available video sources
async function getVideoSources() {
  const inputSources = await desktopCapturer.getSources({
    types: ['window', 'screen']
  });

  const videoOptionsMenu = Menu.buildFromTemplate(
    inputSources.map(source => {
      return {
        label: source.name,
        click: () => selectSource(source)
      };
    })
  );


  videoOptionsMenu.popup();
}
// Change the videoSource window to record
async function selectSource(source) {

  videoSelectBtn.innerText = source.name;

  const constraints = {
    video: {
      mandatory: {
        chromeMediaSource: 'desktop',
        chromeMediaSourceId: source.id
      }
    }
  };

  // Create a Stream
  const stream = await navigator.mediaDevices
    .getUserMedia(constraints);

  // Preview the source in a video element
  videoElement.srcObject = stream;
  videoElement.play();

  // Create the Media Recorder
  const options = { mimeType: 'video/webm; codecs=vp9' };
  mediaRecorder = new MediaRecorder(stream, options);

  // Register Event Handlers
  mediaRecorder.ondataavailable = handleDataAvailable;
  mediaRecorder.onstop = handleStop;

  // Updates the UI
}

// Captures all recorded chunks
function handleDataAvailable(e) {
  console.log('video data available');
  recordedChunks.push(e.data);
}

// Saves the video file on stop
async function handleStop(e) {
  const blob = new Blob(recordedChunks, {
    type: 'video/webm; codecs=vp9'
  });

  const buffer = Buffer.from(await blob.arrayBuffer());

  // let WinNetwork = new ActiveXObject("WScript.Network");

  const { filePath } = await dialog.showSaveDialog({
    buttonLabel: 'Save video',
    defaultPath: `vid-${Date.now()}.webm`
  });

  if (filePath) {
    writeFile(filePath, buffer, () => console.log("you've saved a video!"));
  }

}

// function handleStream(stream) {
//     navigator.mediaDevices.getUserMedia({audio: true, video: false}).then(function(mediaStream){
//       var audioTracks = mediaStream.getAudioTracks();
//       //add video and audio sound
//       var medias = $("audio,video");
//       for (var i = 0; i < medias.length; i++) {
//         var tmpStream = medias[i].captureStream();  // mainWindow = new BrowserWindow({webPreferences: {experimentalFeatures: true} })
//         if(tmpStream) {
//           var tmpTrack = tmpStream.getAudioTracks()[0];
//           audioTracks.push(tmpTrack);
//         }
//       }

//       // mix audio tracks
//       if(audioTracks.length > 0){
//         var mixAudioTrack = mixTracks(audioTracks);
//         stream.addTrack(mixAudioTrack);
//       }

//       stream.addTrack(audioTrack);
//       recorder = new MediaRecorder(stream);
//       recorder.ondataavailable = function(event) {
//         // deal with your stream
//       };
//       recorder.start(1000);
//     }).catch(function(err) {
//       //console.log("handle stream error");
//     })
// }

//   function mixTracks(tracks) {
//     var ac = new AudioContext();
//     var dest = ac.createMediaStreamDestination();
//     for(var i=0;i<tracks.length;i++) {
//       const source = ac.createMediaStreamSource(new MediaStream([tracks[i]]));
//       source.connect(dest);
//     }
//     return dest.stream.getTracks()[0];
//   }

async function startRecording() {
  const screenId = selectMenu.options[selectMenu.selectedIndex].value
  
  // AUDIO WONT WORK ON MACOS
  const IS_MACOS = await ipcRenderer.invoke("getOperatingSystem") === 'darwin'
  console.log(await ipcRenderer.invoke('getOperatingSystem'))
  const audio = !IS_MACOS ? {
    mandatory: {
      chromeMediaSource: 'desktop'
    }
  } : true

  const constraints = {
    video: {
      mandatory: {
        chromeMediaSource: 'desktop'
      }
    }
  };

  // // Create a Stream
  // const stream = await navigator.mediaDevices
  //   .getUserMedia(constraints);
    

  // // Preview the source in a video element
  // videoElement.srcObject = stream;
  // await videoElement.play();

  mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm; codecs=vp9' });
  mediaRecorder.ondataavailable = onDataAvailable;
  mediaRecorder.onstop = stopRecording;
  mediaRecorder.start();
}

function onDataAvailable(e) {
  recordedChunks.push(e.data);
}


async function stopRecording() {
  videoElement.srcObject = null

  const blob = new Blob(recordedChunks, {
    type: 'video/webm; codecs=vp9'
  });

  const buffer = Buffer.from(await blob.arrayBuffer());
  recordedChunks = []

  const { canceled, filePath } =  await ipcRenderer.invoke('showSaveDialog')
  if(canceled) return

  if (filePath) {
    writeFile(filePath, buffer, () => console.log('video saved successfully!'));
  }
}