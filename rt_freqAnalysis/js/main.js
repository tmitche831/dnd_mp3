// Hacks to deal with different function names in different browsers
window.AudioContext = (function(){
  return  window.webkitAudioContext ||
          window.AudioContext       ||
          window.mozAudioContext;
})();

$(document).ready(function() {

  // the AudioContext is the primary 'container' for all your audio node objects
  try {
      audioContext = new webkitAudioContext();
  } catch(e) {
      alert('Web Audio API is not supported in this browser');
  }

  // Initialising the Analyser Node object
  var analyserNode = audioContext.createAnalyser();

  // Setting the bin count(bands) of the analyserNode
  analyserNode.fftSize = 32; // Number of bands will be this / 2.


  // creating an Audio object
  var audio0 = new Audio();
  audio0.src = null;
  audio0.controls = true;
  audio0.autoplay = false;
  audio0.loop = true;

  var sourceNode;
  // Attaching the Audio object to a sourceNode
  sourceNode = audioContext.createMediaElementSource(audio0);
  // connecting the sourceNode to the analyserNode
  sourceNode.connect(analyserNode);
  // connecting the analyserNode to the speakers (destination)
  analyserNode.connect(audioContext.destination);


  // Uint8Array = Unsigned Integer 8bit byte Array
  // Values between 0-255 will be pushed into this array
  // Which represent -1 to +1 (in audio terms)
  var frequencyAmplitudeArray = new Uint8Array(analyserNode.frequencyBinCount);

  // Copies the current frequency data into the passed frequencyAmplitudeArray
  var getFrequencies = function() {
    // Copies the current frequency data into the passed unsigned byte array.
    analyserNode.getByteFrequencyData(frequencyAmplitudeArray);
    return frequencyAmplitudeArray;
  }


  $("#stop").on('click', function() {
    audio0.pause();
    audio0.currentTime = 0;
    // Stops the frequency data from being returned.
    clearInterval(samplerID);
  });

  var samplerID = null;
  $("#start").on('click', function() {
    audio0.play();
    samplerID = window.setInterval(function() {
      // Calls getFrequencies, and sets an interval rate.
      console.log(getFrequencies());
    }, 100);
  });

    // reference source for code = http://html5demos.com/dnd-upload#view-source
    var holder = document.getElementById('holder'),
      tests = {
        filereader: typeof FileReader != 'undefined',
        dnd: 'draggable' in document.createElement('span'),
        formdata: !!window.FormData,
        progress: "upload" in new XMLHttpRequest
      },
      support = {
        filereader: document.getElementById('filereader'),
        formdata: document.getElementById('formdata'),
        progress: document.getElementById('progress')
      },
      acceptedTypes = {
        'audio/mpeg': true,
        'audio/ogg': true,
        'audio/wav': true
      },
      progress = document.getElementById('uploadprogress'),
      fileupload = document.getElementById('upload');

  "filereader formdata progress".split(' ').forEach(function (api) {
    if (tests[api] === false) {
      support[api].className = 'fail';
    } else {
      // FFS. I could have done el.hidden = true, but IE doesn't support
      // hidden, so I tried to create a polyfill that would extend the
      // Element.prototype, but then IE10 doesn't even give me access
      // to the Element object. Brilliant.
      support[api].className = 'hidden';
    }
  });

  // this did try to preview an image but I have told it to bring up a success message (commented out parts arent needed)
  function previewfile(file) {
    // if (tests.filereader === true && acceptedTypes[file.type] === true) {
      var reader = new FileReader();
      reader.onload = function (event) {
        // var image = new Image();
        // image.src = event.target.result;
        // image.width = 250; // a fake resize
        holder.innerHTML += '<p id="upl_success">Succesfully uploaded' + " " + file.name;
      };
      reader.onloadend = function() {
        audio0.src = reader.result;
      }
      reader.readAsDataURL(file);
    // }  else {
    //   // holder.innerHTML += '<p>Uploaded ' + file.name + ' ' + (file.size ? (file.size/1024|0) + 'K' : '');
    //   console.log('not working', file);
    // }
  }

  function readfiles(files) {
      var formData = tests.formdata ? new FormData() : null;
      for (var i = 0; i < files.length; i++) {
        if (tests.formdata) formData.append('file', files[i]);
        previewfile(files[i]);
      }
  }

  // DnD listeners
  if (tests.dnd) {
    holder.ondragover = function () { this.className = 'hover'; return false; };
    holder.ondragend = function () { this.className = ''; return false; };
    holder.ondrop = function (e) {
      this.className = '';
      e.preventDefault();
      readfiles(e.dataTransfer.files);
    }
  } else {
    fileupload.className = 'hidden';
    fileupload.querySelector('input').onchange = function () {
      readfiles(this.files);
    };
  }
});
