// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getMessaging } from "firebase/messaging";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA_NB1erHnYVbouM0aZggDmwA1IhVNne4M",
  authDomain: "test-project-2df42.firebaseapp.com",
  projectId: "test-project-2df42",
  storageBucket: "test-project-2df42.firebasestorage.app",
  messagingSenderId: "989014393122",
  appId: "1:989014393122:web:d00605dad0bae54416a57b",
  measurementId: "G-CR8GKVV8QN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const messaging = getMessaging(app)


export {app,messaging}