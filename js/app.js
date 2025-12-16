import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";


// ------------------- FIREBASE CONFIG COMPLETO -------------------
const firebaseConfig = {
   apiKey: "TU_API_KEY",
   authDomain: "viajesautos.firebaseapp.com",
   projectId: "viajesautos",
   storageBucket: "viajesautos.appspot.com",
   messagingSenderId: "TU_MSG_ID",
   appId: "TU_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);



// ------------------- ELEMENTOS -------------------
const btn = document.getElementById("loginBtn");
const msg = document.getElementById("msg");

btn.onclick = login;



// ------------------- LOGIN -------------------
async function login() {
  const u = document.getElementById("user").value;
  const p = document.getElementById("pass").value;

  const ref = doc(db, "usuarios", u);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    msg.innerText = "Usuario no existe";
    return;
  }

  const data = snap.data();

  if (data.pass !== p) {
    msg.innerText = "Contraseña incorrecta";
    return;
  }

  // Guardar en sessionStorage
  sessionStorage.setItem("usuario", u);
  sessionStorage.setItem("rol", data.rol);

  // Redirección según rol
  if (data.rol === "admin") window.location = "admin.html";
  else window.location = "chofer.html";
}
