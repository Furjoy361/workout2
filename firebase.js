// Firebase core
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";

// Authentication
import { getAuth } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";

// Firestore Database
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC0OO4mshJkGtDVuArOR7yWo6hZuraCgJI",
  authDomain: "plank-rival.firebaseapp.com",
  projectId: "plank-rival",
  storageBucket: "plank-rival.firebasestorage.app",
  messagingSenderId: "635688640102",
  appId: "1:635688640102:web:e0d949117be25478c157a7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const auth = getAuth(app);
const db = getFirestore(app);

// Export so other files can use them
export { auth, db };