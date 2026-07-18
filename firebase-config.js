// 1. 到 Firebase Console 建立 Web App。
// 2. 把 Firebase 提供的 firebaseConfig 完整貼到下方。
// 3. 不要把私人牧養資料放進資料庫；本網站只儲存暱稱和分數。

export const firebaseConfig = {
apiKey: "AIzaSyBCD3zeYdEU5QbQ6dhqbvgRRJWkl7wPEu4",
authDomain: "mark-gospel-quiz.firebaseapp.com",
projectId: "mark-gospel-quiz",
storageBucket: "mark-gospel-quiz.firebasestorage.app",
messagingSenderId: "57489876607",
appId: "1:57489876607:web:dd4f1cc9977046490f814a",
measurementId: "G-RB01F30D6J"
};

export const isFirebaseConfigured =
  Boolean(firebaseConfig.apiKey) &&
  !firebaseConfig.apiKey.includes("AIzaSyBCD3zeYdEU5QbQ6dhqbvgRRJWkl7wPEu4") &&
  Boolean(firebaseConfig.databaseURL) &&
  !firebaseConfig.databaseURL.includes("https://mark-gospel-quiz-default-rtdb.asia-southeast1.firebasedatabase.app/");
