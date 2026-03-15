import { db } from "./firebase.js";

import {
  doc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";


// -------------------- CREATE USER --------------------
export async function createUser(user){

  const userRef = doc(db,"users",user.uid);

  const docSnap = await getDoc(userRef);

  // If user does not exist, create it
  if(!docSnap.exists()){

    await setDoc(userRef,{

      name: user.displayName,
      pushups: 0,
      squats: 0,
      plank: 0

    });

    console.log("User profile created");

  }

}


// -------------------- ADD SQUATS --------------------
export async function addSquats(uid, reps){

  const userRef = doc(db,"users",uid);

  await setDoc(userRef,{

    squats: reps

  }, { merge: true });   // important so other fields stay

  console.log("Squats updated successfully");

}
