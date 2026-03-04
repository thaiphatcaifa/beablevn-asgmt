import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Cấu hình Firebase bạn vừa cung cấp
const firebaseConfig = {
  apiKey: "AIzaSyA6AsTi8cf7JpvZByapPyJ2pPOXfnKlaUQ",
  authDomain: "beablevn-asgmt.firebaseapp.com",
  projectId: "beablevn-asgmt",
  storageBucket: "beablevn-asgmt.firebasestorage.app",
  messagingSenderId: "16902127503",
  appId: "1:16902127503:web:576a8f8858327e14c395fa"
};

// Khởi tạo Firebase App
const app = initializeApp(firebaseConfig);

// Khởi tạo và xuất các dịch vụ để dùng ở các component khác
export const auth = getAuth(app);
export const db = getFirestore(app);