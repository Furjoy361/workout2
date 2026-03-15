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

const q = query(
collection(db,"users"),
orderBy("squats","desc"),
limit(10)
);

const querySnapshot = await getDocs(q);

let rank = 1;

querySnapshot.forEach((doc)=>{

const data = doc.data();

const div = document.createElement("div");

div.className = "player";

div.innerText = `${rank}. ${data.name} — ${data.squats} squats`;

leaderboard.appendChild(div);

rank++;

});

}

loadLeaderboard();