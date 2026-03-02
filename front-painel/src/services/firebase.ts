import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, onIdTokenChanged } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAEnt0bkAzSuCgzrYVrG_dRlAGJDuySVb8",
  authDomain: "projeto-rafael-evotrix.firebaseapp.com",
  projectId: "projeto-rafael-evotrix",
  storageBucket: "projeto-rafael-evotrix.firebasestorage.app",
  messagingSenderId: "840741980552",
  appId: "1:840741980552:web:2bef59903d88637aa9923d",
  measurementId: "G-5G4R0Y2S6K",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

/**
 * ✅ Mantém o token sempre atualizado no localStorage.
 * Evita 401 depois de um tempo com o sistema aberto.
 */
onIdTokenChanged(auth, async (user) => {
  if (user) {
    const token = await user.getIdToken();
    localStorage.setItem("token", token);
  } else {
    localStorage.removeItem("token");
    localStorage.removeItem("empresa_id");
  }
});