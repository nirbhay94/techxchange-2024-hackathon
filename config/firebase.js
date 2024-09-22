import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import Constants from "expo-constants";
import { getDatabase } from "firebase/database";


// Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyA4Y4KE5hC2IUKL748hrT5Qiv-QiGLgIJw",
    authDomain: "techxchange-hackathon-2024.firebaseapp.com",
    databaseURL: "https://techxchange-hackathon-2024-default-rtdb.firebaseio.com",
    projectId: "techxchange-hackathon-2024",
    storageBucket: "techxchange-hackathon-2024.appspot.com",
    messagingSenderId: "145902320091",
    appId: "1:145902320091:web:93cc891de68f11e9e4cffe",
    measurementId: "G-7QJVBF21GH"
};
// initialize firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth();
export const db = getFirestore(app);
export const database = getDatabase(app);


