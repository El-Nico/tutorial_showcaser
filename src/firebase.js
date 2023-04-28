// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB-vWG-kJzphftUOvcY8xP-wKT0ZqDd2qQ",
  authDomain: "tutorial-showcaser.firebaseapp.com",
  projectId: "tutorial-showcaser",
  storageBucket: "tutorial-showcaser.appspot.com",
  messagingSenderId: "417331006189",
  appId: "1:417331006189:web:cf86287a95f78de6145ae4",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
