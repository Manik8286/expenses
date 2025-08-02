import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: "AIzaSyAI9Np3XipXFZPCM0681bHKMmYggGJmkMk",
  authDomain: "myexpenses-9e460.firebaseapp.com",
  projectId: "myexpenses-9e460",
  storageBucket: "myexpenses-9e460.appspot.com",
  messagingSenderId: "1096065644201",
  appId: "1:1096065644201:android:bdd0b362f3f243a4921bb8",
};

export const app = initializeApp(firebaseConfig);