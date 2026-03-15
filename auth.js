import { auth } from "./firebase.js";
import { GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";

const provider = new GoogleAuthProvider();

export async function loginWithGoogle() {

  try {

    const result = await signInWithPopup(auth, provider);

    const user = result.user;

    console.log("Logged in:", user);

    window.location.href = "profile.html";

  } catch (error) {

    console.error(error);

  }

}
