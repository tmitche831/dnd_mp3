// Hacks to deal with different function names in different browsers
  // Tells the browser that you wish to perform an animation and requests that the browser call a specified function to update an animation before the next repaint.
window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          function(callback, element){
            window.setTimeout(callback, 1000 / 60);
          };
})();

window.AudioContext = (function(){
  return  window.webkitAudioContext ||
          window.AudioContext       ||
          window.mozAudioContext;
})();

// Global Variables for the Graphics
var canvasWidth  = 512;
var canvasHeight = 256;
var ctx;

$(document).ready(function() {
  // 2D rendering context for a drawing surface of a <canvas> element.
    ctx = $("#canvas")[0].getContext("2d");

  // the AudioContext is the primary 'container' for all your audio node objects
  try {
      audioContext = new webkitAudioContext();
  } catch(e) {
      alert('Web Audio API is not supported in this browser');
  };

  // Initalising the Analyser Node object
  var analyserNode = audioContext.createAnalyser();

  // Setting the bin count(bands) of the Analyser Node
  analyserNode.fftSize = 32; // Number of bands will be this / 2.

  // Creating an Audio object
  var audio0 = new Audio();
  audio0.src = 'assets/ConfessToMe.mp3';
  audio0.controls = true;
  audio0.autoplay = false;
  audio0.loop = true;

  var sourceNode;
  // Attaching the Audio object to a sourceNode
  sourceNode = audioContext.createMediaElementSource(audio0);
  // Connecting the sourceNode to the analyserNode
  sourceNode.connect(analyserNode);
  // Connecting the analyserNode to the destination (speakers)
  analyserNode.connect(audioContext.destination);


  // Uint8Array = Unsigned Integer 8bit byte Array
  // Values between 0-255 will be pushed into this array
  // Which represent -1 to +1 (in audio terms)
  var amplitudeArray = new Uint8Array(analyserNode.frequencyBinCount);

  // Copies the current time-domain (waveform) data into the passed amplitudeArray
  var getAmplitudes = function() {
    analyserNode.getByteTimeDomainData(amplitudeArray);
    return amplitudeArray;
  };

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
      console.log(getAmplitudes());
    }, 100);
  });
});
