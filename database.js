import { db } from "./firebase.js";
import { doc, updateDoc, increment } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

export async function addSquats(uid, reps){

const userRef = doc(db,"users",uid);

await updateDoc(userRef,{
squats: increment(reps)
});

console.log("Squats updated");

}
