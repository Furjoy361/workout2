import { db } from "./firebase.js";
import { doc, setDoc, increment } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";
import { auth } from "./firebase.js";

// ---------------- STATE ----------------
let running = false;
let seconds = 0;
let timerInterval = null;

let goodFormTime = 0;
let formOk = false;

// anti-cheat
let tapTimeout = null;
let tapFailTimeout = null;

// ---------------- UI ----------------
const timerEl = document.getElementById("timer");
const tapBtn = document.getElementById("tapBtn");

// ---------------- TIMER FORMAT ----------------
function updateTimer() {
  let min = Math.floor(seconds / 60);
  let sec = seconds % 60;
  timerEl.innerText = `${min}:${sec < 10 ? "0"+sec : sec}`;
}

// ---------------- START ----------------
document.getElementById("startBtn").onclick = () => {

  running = true;
  seconds = 0;
  goodFormTime = 0;

  updateTimer();

};

// ---------------- STOP ----------------
document.getElementById("stopBtn").onclick = stopWorkout;

// ---------------- STOP FUNCTION ----------------
async function stopWorkout() {

  running = false;

  clearInterval(timerInterval);
  clearTimeout(tapTimeout);
  clearTimeout(tapFailTimeout);

  const user = auth.currentUser;

  if(user){
    const userRef = doc(db,"users",user.uid);

    await setDoc(userRef,{
      plank: increment(seconds)
    },{merge:true});
  }

  alert(`You held plank for ${seconds} seconds`);

  window.location.href = "profile.html";
}

// ---------------- RANDOM TAP ----------------
function scheduleTap() {

  const delay = 15000 + Math.random() * 5000;

  tapTimeout = setTimeout(() => {

    tapBtn.style.display = "block";

    tapFailTimeout = setTimeout(() => {
      stopWorkout(); // fail
    }, 5000);

  }, delay);
}

// ---------------- TAP CLICK ----------------
tapBtn.onclick = () => {

  tapBtn.style.display = "none";
  clearTimeout(tapFailTimeout);

  scheduleTap(); // next cycle

};

// ---------------- MEDIAPIPE ----------------
const videoElement = document.getElementById("camera");

const pose = new Pose({
  locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
});

pose.setOptions({
  modelComplexity: 1,
  smoothLandmarks: true,
  minDetectionConfidence: 0.7,
  minTrackingConfidence: 0.7
});

pose.onResults(onResults);

// ---------------- FORM CHECK ----------------
function onResults(results) {

  if (!running || !results.poseLandmarks) return;

  const shoulder = results.poseLandmarks[11];
  const hip = results.poseLandmarks[23];
  const ankle = results.poseLandmarks[27];
  const knee = results.poseLandmarks[25];

  // Check alignment (simple straight line logic)
  const bodyLine = Math.abs(shoulder.y - ankle.y);

  const hipDrop = hip.y - shoulder.y;

  const kneesDown = knee.y > hip.y + 0.1;

  // ---------------- FORM CONDITIONS ----------------
  if (bodyLine < 0.3 && hipDrop < 0.2 && !kneesDown) {

    goodFormTime++;

    if (goodFormTime > 10) { // ~1 sec stable

      formOk = true;

      if (!timerInterval) {
        timerInterval = setInterval(() => {
          seconds++;
          updateTimer();
        }, 1000);

        scheduleTap();
      }

    }

  } else {

    formOk = false;
    goodFormTime = 0;

    // pause timer
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }

  }

}

// ---------------- CAMERA ----------------
const camera = new Camera(videoElement, {
  onFrame: async () => {
    await pose.send({ image: videoElement });
  },
  width: 640,
  height: 480
});

camera.start();