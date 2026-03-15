import { db } from "./firebase.js";
import { doc, setDoc, increment } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

/**
 * Add squats for a user and save their name if not already present
 * @param {string} uid - Firebase user UID
 * @param {number} reps - Number of squats completed
 * @param {string} name - User's display name
 */
export async function addSquats(uid, reps, name) {

  const userRef = doc(db, "users", uid);

  await setDoc(userRef, {
    squats: increment(reps),
    name: name
  }, { merge: true }); // ✅ merge ensures we don't overwrite the entire document

  console.log("Squats and name saved to database");
}
