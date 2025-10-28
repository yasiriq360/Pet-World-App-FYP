import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getDatabase } from "firebase/database"
import { getStorage } from "firebase/storage"

const firebaseConfig = {
  apiKey: "AIzaSyCYfabEdc3IHq9FmQ1SvHV_jAnq1T-sIiM",
  authDomain: "pet-world-app123.firebaseapp.com",
  databaseURL: "https://pet-world-app123-default-rtdb.firebaseio.com",
  projectId: "pet-world-app123",
  storageBucket: "pet-world-app123.firebasestorage.app",
  messagingSenderId: "561603020974",
  appId: "1:561603020974:web:a47886e78b29ab55d7c53f",
  measurementId: "G-W06WMD4YPW",
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const database = getDatabase(app)
export const storage = getStorage(app)

export default app
