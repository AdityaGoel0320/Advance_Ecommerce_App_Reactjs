// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB5vkCuNls2VbCZasKXefJlhMEkvLHxIA0",

  authDomain: "ecommerceyt-2646a.firebaseapp.com",

  projectId: "ecommerceyt-2646a",

  storageBucket: "ecommerceyt-2646a.appspot.com",

  messagingSenderId: "24433186801",

  appId: "1:24433186801:web:106ca28b2ff282fe105650",

};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

export const auth = getAuth();
export const db = getFirestore();
export const storage = getStorage();
