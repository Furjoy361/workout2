import { db } from "./firebase.js";

import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

const leaderboard = document.getElementById("leaderboard");

async function loadLeaderboard() {

  leaderboard.innerHTML = "";

  const usersSnapshot = await getDocs(collection(db, "users"));

  let users = [];

  usersSnapshot.forEach((doc) => {
    const data = doc.data();

    const name = data.name || "Player";
    const pushups = data.pushups || 0;
    const squats = data.squats || 0;
    const plank = data.plank || 0;
    const running = data.running || 0;

    const overall = pushups + squats + plank + running; // total points

    users.push({
      name,
      pushups,
      squats,
      plank,
      running,
      overall
    });
  });

  // Sort users by overall points descending
  users.sort((a, b) => b.overall - a.overall);

  // Display top 10
  const topUsers = users.slice(0, 10);

  topUsers.forEach((user, index) => {

    const div = document.createElement("div");
    div.className = "player";

    div.innerHTML = `
      ${index + 1}. ${user.name} — 
      Push-ups: ${user.pushups} | Squats: ${user.squats} | Plank: ${user.plank} | Running: ${user.running} | Overall: ${user.overall}
    `;

    leaderboard.appendChild(div);
  });
}

loadLeaderboard();
