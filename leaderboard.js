import { db } from "./firebase.js";

import {
collection,
getDocs,
query,
orderBy,
limit
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

const leaderboard = document.getElementById("leaderboard");

async function loadLeaderboard(){

  leaderboard.innerHTML = "";

  const q = query(
    collection(db,"users"),
    orderBy("squats","desc"),
    limit(10)
  );

  const querySnapshot = await getDocs(q);

  let rank = 1;

  querySnapshot.forEach((doc)=>{

    const data = doc.data();

    // Fix undefined name
    const name = data.name || "Player";

    // Fix undefined squats
    const squats = data.squats || 0;

    const div = document.createElement("div");

    div.className = "player";

    div.innerText = `${rank}. ${name} — ${squats} squats`;

    leaderboard.appendChild(div);

    rank++;

  });

}

loadLeaderboard();
