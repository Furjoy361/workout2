// -------------------- REPS LOGIC --------------------
let running = false;
let squatStage = null; // "down" or "up"
let reps = 0;

// Load audio (can be a start sound as well as rep sound)
const startSound = new Audio('assets/1.mp3'); // plays when START clicked
const repSound = new Audio('assets/1.mp3');   // plays when a rep is counted

// Show initial reps
document.getElementById("reps").innerText = `Reps: ${reps}`;

// -------------------- START / STOP --------------------
document.getElementById("startBtn").onclick = function(){
  if(!running){
    reps = 0;
    squatStage = null;
    running = true;
    document.getElementById("reps").innerText = `Reps: ${reps}`; // reset display

    // Play start sound
    startSound.currentTime = 0;
    startSound.play();
  }
}

document.getElementById("stopBtn").onclick = function(){
  running = false;
  alert(`You completed ${reps} squats!`);
}

// -------------------- MEDIA PIPE CAMERA & POSE --------------------
const videoElement = document.getElementById('camera');
const canvasElement = document.getElementById('output');
const canvasCtx = canvasElement.getContext('2d');

const pose = new Pose({
  locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
});

pose.setOptions({
  modelComplexity: 1,
  smoothLandmarks: true,
  enableSegmentation: false,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
});

pose.onResults(onResults);

// -------------------- SQUAT REPS COUNT --------------------
function calculateAngle(A, B, C){
  const AB = {x: B.x - A.x, y: B.y - A.y};
  const CB = {x: B.x - C.x, y: B.y - C.y};
  const dot = AB.x*CB.x + AB.y*CB.y;
  const magAB = Math.sqrt(AB.x*AB.x + AB.y*AB.y);
  const magCB = Math.sqrt(CB.x*CB.x + CB.y*CB.y);
  const angleRad = Math.acos(dot/(magAB*magCB));
  return angleRad * (180/Math.PI);
}

function flashGreen(){
  canvasElement.style.backgroundColor = "rgba(0,255,0,0.5)";
  setTimeout(() => {
    canvasElement.style.backgroundColor = "transparent";
  }, 500); // green flash for 0.5 seconds
}

function onResults(results){
  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

  if(results.poseLandmarks && running){
    drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, {color:'#00FF00', lineWidth:4});
    drawLandmarks(canvasCtx, results.poseLandmarks, {color:'#FF0000', lineWidth:2});

    // Squat detection (using knees)
    const leftHip = results.poseLandmarks[23];
    const leftKnee = results.poseLandmarks[25];
    const leftAnkle = results.poseLandmarks[27];

    const rightHip = results.poseLandmarks[24];
    const rightKnee = results.poseLandmarks[26];
    const rightAnkle = results.poseLandmarks[28];

    const leftAngle = calculateAngle(leftHip, leftKnee, leftAnkle);
    const rightAngle = calculateAngle(rightHip, rightKnee, rightAnkle);

    const avgAngle = (leftAngle + rightAngle) / 2;

    // Only count squats after START clicked
    if(avgAngle < 100 && squatStage !== "down"){
      squatStage = "down";
    }
    if(avgAngle > 150 && squatStage === "down"){
      squatStage = "up";
      reps++;
      document.getElementById("reps").innerText = `Reps: ${reps}`;

      // Play rep sound
      repSound.currentTime = 0;
      repSound.play();

      // Flash green to indicate a counted rep
      flashGreen();
    }
  }

  canvasCtx.restore();
}

// -------------------- CAMERA START --------------------
const camera = new Camera(videoElement, {
  onFrame: async () => await pose.send({image: videoElement}),
  width: 640,
  height: 480
});
camera.start();
