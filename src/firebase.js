// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyCjzelKyO33bM7WfTR4ww-xD3W_sYJhB1Y",
    authDomain: "xklaz-labs.firebaseapp.com",
    projectId: "xklaz-labs",
    storageBucket: "xklaz-labs.firebasestorage.app",
    messagingSenderId: "1005997150240",
    appId: "1:1005997150240:web:f25b85cae93a34e62eac45",
    measurementId: "G-CYVFYQ6VQD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);