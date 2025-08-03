import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from 'firebase/app';
import { getAuth, getReactNativePersistence, initializeAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: 'AIzaSyAI9Np3XipXFZPCM0681bHKMmYggGJmkMk',
  authDomain: 'myexpenses-9e460.firebaseapp.com',
  projectId: 'myexpenses-9e460',
  storageBucket: 'myexpenses-9e460.appspot.com',
  messagingSenderId: '1096065644201',
  appId: '1:1096065644201:android:bdd0b362f3f243a4921bb8',
};

const app = initializeApp(firebaseConfig);

// ✅ Use platform-specific auth initialization
let auth: any;
if (Platform.OS === 'web') {
  auth = getAuth(app); // Web: no persistence needed
} else {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
}
const db = getFirestore(app); 
export { app, auth, db };
