import { fbConfig } from "./env";

import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { getDatabase, ref as databaseRef, set as databaseSet, onValue as databaseOnValue, get as databaseGet, child as databaseChild, off as databaseOff } from "firebase/database";

// TODO: Replace the following with your app's Firebase project configuration
const firebaseConfig = {
  apiKey: `${fbConfig.apiKey}`,
  authDomain: `${fbConfig.authDomain}`,
  projectId: `${fbConfig.projectId}`,
  storageBucket: `${fbConfig.storageBucket}`,
  messagingSenderId: `${fbConfig.messagingSenderId}`,
  appId: `${fbConfig.appId}`,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const storage = getStorage(app);
const database = getDatabase(app);

export {
  storage,
  storageRef,
  uploadBytesResumable,
  getDownloadURL,

  auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,

  database,
  databaseRef,
  databaseSet,
  databaseOnValue,
  databaseGet,
  databaseChild,
  databaseOff
};