import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  onSnapshot 
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";


// 🔥 TU CONFIG REAL
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "viajesautos.firebaseapp.com",
  projectId: "viajesautos"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


// ================================
// LISTADO DE VIAJES
// ================================
const lista = document.getElementById("listaViajes");

onSnapshot(collection(db, "viajes"), (snap) => {
  lista.innerHTML = "";

  snap.forEach(d => {
    const v = d.data();

    lista.innerHTML += `
      <div class="viaje-card">
        <b>Chofer:</b> ${v.chofer} <br>
        <b>Estado:</b> ${v.estado || "sin estado"} <br>
        <b>Última posición:</b> 
          ${v.ultimaPos ? `${v.ultimaPos.lat}, ${v.ultimaPos.lng}` : "—"} 
        <br><hr>
      </div>
    `;
  });
});


// ================================
// CREAR VIAJE NUEVO
// ================================
document.getElementById("nuevoViaje").onclick = async () => {

  await addDoc(collection(db, "viajes"), {
    chofer: "chofer1",
    estado: "pendiente",
    origen: { lat: null, lng: null },
    horaInicio: Date.now(),
    ultimaPos: null
  });

  alert("Viaje creado");
};
