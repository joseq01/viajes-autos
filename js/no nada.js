// ---------------- FIREBASE CONFIG ----------------
import { initializeApp } 
  from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";

import { 
  getFirestore,
  collection,
  getDocs,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBuAsS0aqT8e6ECtMj-mmZsBemBoMTivoY",
  authDomain: "viajesautos.firebaseapp.com",
  projectId: "viajesautos",
  storageBucket: "viajesautos.firebasestorage.app",
  messagingSenderId: "593140621786",
  appId: "1:593140621786:web:bb5eba2477c5efda56a0e3"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export { collection, getDocs, addDoc, serverTimestamp };
