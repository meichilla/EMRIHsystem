import * as admin from 'firebase-admin';
import * as serviceAccount from 'src/common/utils/emrihsystem-firebase.json';
import { initializeApp } from 'firebase/app';
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

const app = initializeApp(firebaseConfig);

try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  });
} catch (error) {
  console.error('Error initializing Firebase Admin SDK:', error);
}

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage, admin };
