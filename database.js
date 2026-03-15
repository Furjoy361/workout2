import { db } from "./firebase.js";

import {
  doc,
  setDoc,
  increment
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

export async function addSquats(uid, reps){

  const userRef = doc(db,"users",uid);

  await setDoc(userRef,{
    squats: increment(reps)
  },{ merge:true });

  console.log("Squats updated");

}
