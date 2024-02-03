import firebase from "firebase/compat/app";
import "firebase/compat/storage";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyA-ADaZeGw9DvptZmgyO_B2eJPx5AZcqfc',
  authDomain: 'emrihsystem.firebaseapp.com',
  projectId: 'emrihsystem',
  storageBucket: 'emrihsystem.appspot.com',
  messagingSenderId: '786193719969',
  appId: '1:786193719969:web:fe6f1661cef48e4f1e06e0',
  measurementId: 'G-28MBC4QWTQ',
};


const app = firebase.initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
