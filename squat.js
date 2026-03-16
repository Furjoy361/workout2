import { addSquats } from "./database.js";
import { auth } from "./firebase.js";

// -------------------- REPS LOGIC --------------------
let running = false;
let squatStage = null;
let reps = 0;

let repSound = null;

// stability filtering
let angleHistory = [];
const historySize = 5;

let lastRepTime = 0;
const repCooldown = 600;

let squatStartTime = 0;
const minSquatTime = 300;

// Show initial reps
document.getElementById("reps").innerText = `Reps: ${reps}`;

// -------------------- START / STOP --------------------
document.getElementById("startBtn").onclick = function() {

  if (!running) {

    reps = 0;
    squatStage = null;
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
    console.log("Squats saved");

  }

  alert(`You completed ${reps} squats!`);

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

// -------------------- SQUAT DETECTION --------------------
function onResults(results) {

  if (results.poseLandmarks && running) {

    const leftHip = results.poseLandmarks[23];
    const leftKnee = results.poseLandmarks[25];
    const leftAnkle = results.poseLandmarks[27];

    const rightHip = results.poseLandmarks[24];
    const rightKnee = results.poseLandmarks[26];
    const rightAnkle = results.poseLandmarks[28];

    const leftAngle = calculateAngle(leftHip, leftKnee, leftAnkle);
    const rightAngle = calculateAngle(rightHip, rightKnee, rightAnkle);

    const avgAngle = (leftAngle + rightAngle) / 2;

    // ---------------- SMOOTH ANGLE ----------------
    angleHistory.push(avgAngle);

    if (angleHistory.length > historySize) {
      angleHistory.shift();
    }

    const smoothAngle = angleHistory.reduce((a,b)=>a+b)/angleHistory.length;

    const now = Date.now();

    // ---------------- DOWN POSITION ----------------
    if (smoothAngle < 85 && squatStage !== "down") {

      squatStage = "down";
      squatStartTime = now;

    }

    // ---------------- UP POSITION ----------------
    if (smoothAngle > 165 && squatStage === "down") {

      const squatDuration = now - squatStartTime;

      if (squatDuration > minSquatTime && now - lastRepTime > repCooldown) {

        squatStage = "up";
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
