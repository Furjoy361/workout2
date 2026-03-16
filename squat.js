import { addSquats } from "./database.js";
import { auth } from "./firebase.js";

// -------------------- REPS LOGIC --------------------
let running = false;
let squatStage = null; // "down" or "up"
let reps = 0;

// cooldown to prevent double counting
let lastRepTime = 0;
const repCooldown = 400;

// Load rep sound after user clicks START
let repSound = null;

// Show initial reps
document.getElementById("reps").innerText = `Reps: ${reps}`;

// -------------------- START / STOP --------------------
document.getElementById("startBtn").onclick = function() {
  if (!running) {
    reps = 0;
    squatStage = null;
    running = true;

    document.getElementById("reps").innerText = `Reps: ${reps}`;

    repSound = new Audio('assets/1.mp3');
  }
}

document.getElementById("stopBtn").onclick = async function() {

  running = false;

  const user = auth.currentUser;

  if (user) {
    await addSquats(user.uid, reps, user.displayName || "Player");
    console.log("Squats and name saved to database");
  }

  alert(`You completed ${reps} squats!`);

  window.location.href = "profile.html";
}

// -------------------- MEDIA PIPE CAMERA & POSE --------------------
const videoElement = document.getElementById('camera');

const pose = new Pose({
  locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
});

pose.setOptions({
  modelComplexity: 1,
  smoothLandmarks: true,
  enableSegmentation: false,
  minDetectionConfidence: 0.6,
  minTrackingConfidence: 0.6
});

pose.onResults(onResults);

// -------------------- SQUAT REPS COUNT --------------------
function calculateAngle(A, B, C) {

  const AB = { x: B.x - A.x, y: B.y - A.y };
  const CB = { x: B.x - C.x, y: B.y - C.y };

  const dot = AB.x * CB.x + AB.y * CB.y;

  const magAB = Math.sqrt(AB.x * AB.x + AB.y * AB.y);
  const magCB = Math.sqrt(CB.x * CB.x + CB.y * CB.y);

  const angleRad = Math.acos(dot / (magAB * magCB));

  return angleRad * (180 / Math.PI);
}

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

    const now = Date.now();

    // Deep squat detection
    if (avgAngle < 85 && squatStage !== "down") {
      squatStage = "down";
    }

    // Full stand detection
    if (avgAngle > 165 && squatStage === "down") {

      if (now - lastRepTime > repCooldown) {

        squatStage = "up";
        reps++;
        lastRepTime = now;

        document.getElementById("reps").innerText = `Reps: ${reps}`;

        if (repSound) {
          repSound.currentTime = 0;
          repSound.play();
        }

        document.body.style.backgroundColor = "rgba(0,255,0,0.4)";
        setTimeout(() => {
          document.body.style.backgroundColor = "";
        }, 300);
      }
    }

  }

}

// -------------------- CAMERA START --------------------
const camera = new Camera(videoElement, {
  onFrame: async () => {
    await pose.send({ image: videoElement });
  },
  width: 640,
  height: 480
});

camera.start();
