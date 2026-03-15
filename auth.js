import { auth } from "./firebase.js";
import { GoogleAuthProvider, signInWithPopup, signOut } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";

const provider = new GoogleAuthProvider();

// Google Login
export function loginWithGoogle() {
  signInWithPopup(auth, provider)
    .then((result) => {
      const user = result.user;

      console.log("User logged in:", user);

      // go to profile page
      window.location.href = "profile.html";
    })
    .catch((error) => {
      console.error("Login error:", error);
    });
}

// Logout
export function logoutUser() {
  signOut(auth).then(() => {
    window.location.href = "login.html";
  });
}