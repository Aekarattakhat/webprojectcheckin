// firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyDriZHkql1Yp-F-Fg8_b5rpDDskobHIqJU",
    authDomain: "webproject-51262.firebaseapp.com",
    projectId: "webproject-51262",
    storageBucket: "webproject-51262.firebasestorage.app",
    messagingSenderId: "318273993725",
    appId: "1:318273993725:web:f63b3ac40ab995131e3794",
    measurementId: "G-YMQK2EXYY5"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);


export {db,auth}
