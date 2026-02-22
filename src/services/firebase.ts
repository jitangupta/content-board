import { initializeApp } from 'firebase/app';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyCRGZZVgVY11Gy5oQ4kmPof8dgVA9uQr-A',
  authDomain: 'content-board-d3888.firebaseapp.com',
  projectId: 'content-board-d3888',
  storageBucket: 'content-board-d3888.firebasestorage.app',
  messagingSenderId: '406953087970',
  appId: '1:406953087970:web:a9fc2aba6539e426859fbb',
};

const app = initializeApp(firebaseConfig);

export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
});

export const auth = getAuth(app);
