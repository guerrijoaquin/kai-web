import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyANL_LHC6jhS4vAA1-DrAO4-bmc_mm3Bf8",
  authDomain: "kai-system-a754d.firebaseapp.com",
  projectId: "kai-system-a754d",
  storageBucket: "kai-system-a754d.appspot.com",
  messagingSenderId: "653052123492",
  appId: "1:653052123492:web:c72805c3cb20fbd883c271",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
