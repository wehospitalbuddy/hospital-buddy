// =====================================================
// HOSPITAL BUDDY — FIREBASE
// =====================================================

const firebaseConfig = {
  apiKey: "AIzaSyDxfRCo3z0YLo_q5yrhnZHejYR41PzGDiw",
  authDomain: "hospital-buddy-2224d.firebaseapp.com",
  projectId: "hospital-buddy-2224d",
  storageBucket: "hospital-buddy-2224d.firebasestorage.app",
  messagingSenderId: "190919672635",
  appId: "1:190919672635:web:8fe14cc8036fd0cb542d1e",
  measurementId: "G-Z13TZ2EFFR"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.firestore();
