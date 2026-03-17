import { db } from "./firebase.js";
import { doc, setDoc, increment } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";
import { auth } from "./firebase.js";

// ---------------- STATE ----------------
let running = false;
let seconds = 0;
let timer = null;

let watchId = null;
let lastPosition = null;
let distance = 0;

// MAP
let map = null;
let polyline = null;
let marker = null;
let path = [];

// ---------------- UI ----------------
const timeEl = document.getElementById("time");
const distanceEl = document.getElementById("distance");

// ---------------- TIMER ----------------
function updateTime() {
  let min = Math.floor(seconds / 60);
  let sec = seconds % 60;
  timeEl.innerText = `${min}:${sec < 10 ? "0"+sec : sec}`;
}

// ---------------- DISTANCE ----------------
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;

  const dLat = (lat2 - lat1) * Math.PI/180;
  const dLon = (lon2 - lon1) * Math.PI/180;

  const a =
    Math.sin(dLat/2) ** 2 +
    Math.cos(lat1 * Math.PI/180) *
    Math.cos(lat2 * Math.PI/180) *
    Math.sin(dLon/2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
}

// ---------------- INIT MAP ----------------
function initMap(lat, lon) {

  map = L.map("map").setView([lat, lon], 16);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap"
  }).addTo(map);

  polyline = L.polyline([], { weight: 5 }).addTo(map);

  marker = L.marker([lat, lon]).addTo(map);

  setTimeout(() => {
    map.invalidateSize();
  }, 200);
}

// ---------------- START ----------------
document.getElementById("startBtn").onclick = () => {

  if (running) return;

  running = true;
  seconds = 0;
  distance = 0;
  lastPosition = null;
  path = [];

  updateTime();
  distanceEl.innerText = "0.00";

  timer = setInterval(() => {
    seconds++;
    updateTime();
  }, 1000);

  watchId = navigator.geolocation.watchPosition(

    (pos) => {

      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;

      console.log("GPS:", lat, lon);

      if (!map) {
        initMap(lat, lon);
      }

      if (!polyline || !map) return;

      path.push([lat, lon]);
      polyline.setLatLngs(path);

      if (marker) {
        marker.setLatLng([lat, lon]);
      }

      map.setView([lat, lon]);

      if (lastPosition) {

        const d = getDistance(
          lastPosition.lat,
          lastPosition.lon,
          lat,
          lon
        );

        if (d > 0.001) {
          distance += d;
          distanceEl.innerText = distance.toFixed(2);
        }
      }

      lastPosition = { lat, lon };

    },

    (err) => {
      console.error(err);
      alert("Location permission denied or error");
      stopRun();
    },

    {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 5000
    }
  );
};

// ---------------- STOP ----------------
document.getElementById("stopBtn").onclick = stopRun;

async function stopRun() {

  if (!running) return;

  running = false;

  clearInterval(timer);

  if (watchId !== null) {
    navigator.geolocation.clearWatch(watchId);
  }

  const user = auth.currentUser;

  if (user) {

    const userRef = doc(db, "users", user.uid);

    await setDoc(userRef, {
      runningDistance: increment(distance || 0),
      runningTime: increment(seconds || 0)
    }, { merge: true });
  }

  alert(`Run complete!\nDistance: ${distance.toFixed(2)} km\nTime: ${seconds}s`);

  window.location.href = "profile.html";
}
