import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth"

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: "login-teesx.firebaseapp.com",
  projectId: "login-teesx",
  storageBucket: "login-teesx.firebasestorage.app",
  messagingSenderId: "527741156553",
  appId: "1:527741156553:web:628cbb2c8e2a093b872118"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app)
const provider = new GoogleAuthProvider()

export { auth, provider }