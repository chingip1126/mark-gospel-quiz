// 1. 到 Firebase Console 建立 Web App。
// 2. 把 Firebase 提供的 firebaseConfig 完整貼到下方。
// 3. 不要把私人牧養資料放進資料庫；本網站只儲存暱稱和分數。

export const firebaseConfig = {
  apiKey: "PASTE_YOUR_API_KEY_HERE",
  authDomain: "PASTE_YOUR_PROJECT.firebaseapp.com",
  databaseURL: "https://PASTE_YOUR_PROJECT-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "PASTE_YOUR_PROJECT",
  storageBucket: "PASTE_YOUR_PROJECT.firebasestorage.app",
  messagingSenderId: "PASTE_YOUR_SENDER_ID",
  appId: "PASTE_YOUR_APP_ID"
};

export const isFirebaseConfigured =
  Boolean(firebaseConfig.apiKey) &&
  !firebaseConfig.apiKey.includes("PASTE_") &&
  Boolean(firebaseConfig.databaseURL) &&
  !firebaseConfig.databaseURL.includes("PASTE_");
