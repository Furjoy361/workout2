import { addSquats } from "./database.js"; // you can later rename to addPushups
import { auth } from "./firebase.js";

// -------------------- REPS LOGIC --------------------
let running = false;
let pushupStage = null;
let reps = 0;

let repSound = null;

// stability filtering
let angleHistory = [];
const historySize = 5;

let lastRepTime = 0;
const repCooldown = 600;

let pushupStartTime = 0;
const minPushupTime = 300;

// Show initial reps
document.getElementById("reps").innerText = `Reps: ${reps}`;

// -------------------- START / STOP --------------------
document.getElementById("startBtn").onclick = function() {

  if (!running) {

    reps = 0;
    pushupStage = null;
    running = true;

    angleHistory = [];

    document.getElementById("reps").innerText = `Reps: ${reps}`;

    repSound = new Audio('assets/1.mp3');

  }

}

document.getElementById("stopBtn").onclick = async function() {

  running = false;

  const user = auth.currentUser;

  if (user) {
    await addSquats(user.uid, reps, user.displayName || "Player"); 
    // later change to addPushups
  }

  alert(`You completed ${reps} push-ups!`);

  window.location.href = "profile.html";

}

// -------------------- MEDIA PIPE CAMERA --------------------
const videoElement = document.getElementById('camera');

const pose = new Pose({
  locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
});

pose.setOptions({
  modelComplexity: 1,
  smoothLandmarks: true,
  enableSegmentation: false,
  minDetectionConfidence: 0.7,
  minTrackingConfidence: 0.7
});

pose.onResults(onResults);

// -------------------- ANGLE CALCULATION --------------------
function calculateAngle(A, B, C) {

  const AB = { x: B.x - A.x, y: B.y - A.y };
  const CB = { x: B.x - C.x, y: B.y - C.y };

  const dot = AB.x * CB.x + AB.y * CB.y;

  const magAB = Math.sqrt(AB.x * AB.x + AB.y * AB.y);
  const magCB = Math.sqrt(CB.x * CB.x + CB.y * CB.y);

  const angleRad = Math.acos(dot / (magAB * magCB));

  return angleRad * (180 / Math.PI);

}

// -------------------- PUSH-UP DETECTION --------------------
function onResults(results) {

  if (results.poseLandmarks && running) {

    const leftShoulder = results.poseLandmarks[11];
    const leftElbow = results.poseLandmarks[13];
    const leftWrist = results.poseLandmarks[15];

    const rightShoulder = results.poseLandmarks[12];
    const rightElbow = results.poseLandmarks[14];
    const rightWrist = results.poseLandmarks[16];

    const leftAngle = calculateAngle(leftShoulder, leftElbow, leftWrist);
    const rightAngle = calculateAngle(rightShoulder, rightElbow, rightWrist);

    const avgAngle = (leftAngle + rightAngle) / 2;

    // ---------------- SMOOTH ANGLE ----------------
    angleHistory.push(avgAngle);

    if (angleHistory.length > historySize) {
      angleHistory.shift();
    }

    const smoothAngle = angleHistory.reduce((a,b)=>a+b)/angleHistory.length;

    const now = Date.now();

    // ---------------- DOWN ----------------
    if (smoothAngle < 95 && pushupStage !== "down") {

      pushupStage = "down";
      pushupStartTime = now;

    }

    // ---------------- UP ----------------
    if (smoothAngle > 160 && pushupStage === "down") {

      const duration = now - pushupStartTime;

      if (duration > minPushupTime && now - lastRepTime > repCooldown) {

        pushupStage = "up";
        reps++;

        lastRepTime = now;

        document.getElementById("reps").innerText = `Reps: ${reps}`;

        if (repSound) {
          repSound.currentTime = 0;
          repSound.play();
        }

        document.body.style.backgroundColor = "rgba(0,255,0,0.4)";

        setTimeout(()=>{
          document.body.style.backgroundColor="";
        },300);

      }

    }

  }

}

// -------------------- CAMERA --------------------
const camera = new Camera(videoElement, {
  onFrame: async () => {
    await pose.send({ image: videoElement });
  },
  width: 640,
  height: 480
});

camera.start();
