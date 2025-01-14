// filepath: /c:/Users/ntrus/website/firebase-init.js
import { initializeApp } from "firebase/app";
import { getDatabase, ref, push, onChildAdded } from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCk8RJvB6AmAFfWKZ-YdZa5oGZj1dmxGUw",
    authDomain: "nateforum-102fa.firebaseapp.com",
    projectId: "nateforum-102fa",
    storageBucket: "nateforum-102fa.firebasestorage.app",
    messagingSenderId: "530438819695",
    appId: "1:530438819695:web:8d3de6806b34c91bc4629a",
    measurementId: "G-3RM09BJKLV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Export the database for use in other files
export { database, ref, push, onChildAdded };