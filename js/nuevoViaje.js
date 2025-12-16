import { 
  getFirestore, collection, addDoc, onSnapshot, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

import { 
  getStorage, ref, uploadString, getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-storage.js";

const db = getFirestore();
const storage = getStorage();

// -----------------------------
//  CAMPOS DEL FORM
// -----------------------------
const transportaInput = document.getElementById("transporta");
const origenInput = document.getElementById("origen");
const destinosDiv = document.getElementById("destinos");
const addDestinoBtn = document.getElementById("addDestino");
const guardarBtn = document.getElementById("guardar");
const estado = document.getElementById("estado");
const lista = document.getElementById("listaViajes");
const vistaPrevia = document.getElementById("vistaPrevia");

let fotoBlob = null;

// -----------------------------
//  AGREGAR DESTINO
// -----------------------------
transportaInput.addEventListener("paste", (e) => {

  const files = e.clipboardData.files;
  const items = e.clipboardData.items;

  // 🖼️ PRIORIDAD: imagen como archivo
  if (files && files.length > 0) {
    const file = files[0];

    if (file.type.startsWith("image/")) {
      e.preventDefault();
      fotoBlob = file;
      estado.innerHTML = "🖼️ Imagen detectada, lista para subir.";
      mostrarVistaPreviaDesdeFile(file);
      return;
    }
  }

  // 📝 TEXTO (fallback)
  for (let item of items) {
    if (item.type === "text/plain") {
      item.getAsString((text) => {
        transportaInput.value = text;
      });
    }
  }
});


function mostrarVistaPreviaDesdeFile(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    vistaPrevia.innerHTML = `<img src="${e.target.result}" alt="preview">`;
  };
  reader.readAsDataURL(file);
}

// -----------------------------
//  REDUCIR IMAGEN BAJA RES
// -----------------------------
function procesarImagenBajaResolucion(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target.result;

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        const MAX_W = 600;
        const MAX_H = 600;

        let w = img.width;
        let h = img.height;

        const ratio = Math.min(MAX_W / w, MAX_H / h);
        w = Math.round(w * ratio);
        h = Math.round(h * ratio);

        canvas.width = w;
        canvas.height = h;
        ctx.drawImage(img, 0, 0, w, h);

        const dataUrl = canvas.toDataURL("image/jpeg", 0.35);
        resolve(dataUrl);
      };

      img.onerror = () => resolve(e.target.result);
    };

    reader.readAsDataURL(file);
  });
}

// -----------------------------
//  GUARDAR VIAJE
// -----------------------------
guardarBtn.addEventListener("click", async () => {
  estado.innerHTML = "";

  const transportaTexto = transportaInput.value.trim();
  const origen = origenInput.value.trim();

  const destinos = [...document.querySelectorAll(".destino")]
    .map(d => d.value.trim())
    .filter(v => v !== "");

  if ((!transportaTexto && !fotoBlob) || !origen || destinos.length === 0) {
    estado.innerHTML = "⚠️ Completá todos los campos.";
    return;
  }

  let transportaFinal = transportaTexto;

  // 🔐 DATOS DEL ADMIN LOGUEADO
  const adminNombre = sessionStorage.getItem("usuario") || "admin";
  const adminId = sessionStorage.getItem("usuarioId") || null;

  try {
    if (fotoBlob) {
      const dataUrl = await procesarImagenBajaResolucion(fotoBlob);

      const filename = `viajes/${Date.now()}.jpg`;
      const storageRef = ref(storage, filename);

      await uploadString(storageRef, dataUrl, "data_url");
      transportaFinal = await getDownloadURL(storageRef);

      fotoBlob = null;
      vistaPrevia.innerHTML = "";
    }

    await addDoc(collection(db, "viajes"), {
      transporta: transportaFinal,
      origen,
      destinos,
      estado: "pendiente",

      // 🔥 ADMIN QUE CARGÓ EL VIAJE
      creadoPorNombre: adminNombre,
      creadoPorId: adminId,

      ultimaPos: null,
      fecha: serverTimestamp()
    });

    estado.innerHTML = "✔️ Viaje cargado correctamente.";

    transportaInput.value = "";
    origenInput.value = "";
    destinosDiv.innerHTML = `<input class="destino" placeholder="Destino" />`;

  } catch (err) {
    console.error(err);
    estado.innerHTML = "❌ Error al guardar.";
  }
});

// -----------------------------
//  LISTAR VIAJES (EN TIEMPO REAL)
// -----------------------------
onSnapshot(collection(db, "viajes"), (snap) => {
  lista.innerHTML = "";

  snap.forEach((docu) => {
    const d = docu.data();
    const t = d.transporta || "";

    lista.innerHTML += `
      <button disabled style="opacity:.9; width:100%; text-align:left;">
        ${
          (typeof t === "string" && t.startsWith("https://"))
            ? `<img src="${t}" style="max-width:120px;display:block;margin:6px 0;border-radius:6px;"/>`
            : escapeHtml(String(t))
        }
        <br><strong>Origen:</strong> ${escapeHtml(d.origen || "-")}<br>
        <strong>Destinos:</strong> ${Array.isArray(d.destinos) ? escapeHtml(d.destinos.join(" → ")) : "-"}
      </button>
      <br><br>
    `;
  });
});

function escapeHtml(text) {
  if (typeof text !== "string") return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

