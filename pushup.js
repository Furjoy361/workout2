// -------------------- REPS LOGIC --------------------
let running = false;
let pushupStage = null; // "down" or "up"
let reps = 0;

// Show initial reps
document.getElementById("reps").innerText = `Reps: ${reps}`;

// -------------------- START / STOP --------------------
document.getElementById("startBtn").onclick = function(){
  if(!running){
    reps = 0;
    pushupStage = null;
    running = true;
  }
}

document.getElementById("stopBtn").onclick = function(){
  running = false;
  alert(`You completed ${reps} push-ups!`);
}

// -------------------- RANDOM EVENT (Optional, can keep or remove) --------------------
function startRandomEvent(){
  setTimeout(showEvent,10000);
}

function showEvent(){
  let box = document.getElementById("eventBox");
  box.classList.remove("hidden");

  let clicked = false;

  document.getElementById("tapBtn").onclick = function(){
    clicked = true;
    box.classList.add("hidden");
    startRandomEvent();
  }

  setTimeout(function(){
    if(!clicked){
      alert("You failed the event!");
      running = false;
    }
    box.classList.add("hidden");
  },5000);
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

// -------------------- PUSH-UP REPS COUNT --------------------
function calculateAngle(A, B, C){
  const AB = {x: B.x - A.x, y: B.y - A.y};
  const CB = {x: B.x - C.x, y: B.y - C.y};
  const dot = AB.x*CB.x + AB.y*CB.y;
  const magAB = Math.sqrt(AB.x*AB.x + AB.y*AB.y);
  const magCB = Math.sqrt(CB.x*CB.x + CB.y*CB.y);
  const angleRad = Math.acos(dot/(magAB*magCB));
  return angleRad * (180/Math.PI);
}

function onResults(results){
  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

  if(results.poseLandmarks){
    drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, {color:'#00FF00', lineWidth:4});
    drawLandmarks(canvasCtx, results.poseLandmarks, {color:'#FF0000', lineWidth:2});

    // Push-up detection (using elbows)
    const leftShoulder = results.poseLandmarks[11];
    const leftElbow = results.poseLandmarks[13];
    const leftWrist = results.poseLandmarks[15];

    const rightShoulder = results.poseLandmarks[12];
    const rightElbow = results.poseLandmarks[14];
    const rightWrist = results.poseLandmarks[16];

    const leftAngle = calculateAngle(leftShoulder, leftElbow, leftWrist);
    const rightAngle = calculateAngle(rightShoulder, rightElbow, rightWrist);

    const avgAngle = (leftAngle + rightAngle) / 2;

    // Simple push-up logic: down < 90, up > 160
    if(avgAngle < 90 && pushupStage !== "down"){
      pushupStage = "down";
    }
    if(avgAngle > 160 && pushupStage === "down"){
      pushupStage = "up";
      reps++;
      document.getElementById("reps").innerText = `Reps: ${reps}`; // update visible reps
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