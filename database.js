import { db } from "./firebase.js";

import {
  doc,
  setDoc
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

export async function addSquats(uid, reps){

  const userRef = doc(db,"users",uid);

  await setDoc(userRef,{
    squats: reps
  });

  console.log("Database write successful");

}
