import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC6Vgt-X65Es_joGLeF1MtmEQebJKlP57c",
  authDomain: "school-913e3.firebaseapp.com",
  projectId: "school-913e3",
  storageBucket: "school-913e3.firebasestorage.app",
  messagingSenderId: "963078087448",
  appId: "1:963078087448:web:c268ae08f9a1ed6d71746d",
  measurementId: "G-JZTJQJ2M5F"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
