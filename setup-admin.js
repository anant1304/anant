// E3 Classes — Admin Setup Script
// Run this AFTER: 1) Firestore created, 2) Email/Password auth enabled
// Command: node setup-admin.js

const { initializeApp } = require("firebase/app");
const { getAuth, createUserWithEmailAndPassword } = require("firebase/auth");
const { getFirestore, doc, setDoc } = require("firebase/firestore");

const firebaseConfig = {
  apiKey: "AIzaSyARCXFT9pph3BFns8wh0J8Y1pQMfgw_6c4",
  authDomain: "e3-classes-8656d.firebaseapp.com",
  projectId: "e3-classes-8656d",
  storageBucket: "e3-classes-8656d.firebasestorage.app",
  messagingSenderId: "178425663692",
  appId: "1:178425663692:web:8c596ea081b31249dcb269",
};

const ADMIN_EMAIL    = "admin@e3.com";
const ADMIN_PASSWORD = "Admin@123";
const ADMIN_NAME     = "Admin";

async function setupAdmin() {
  console.log("🚀 E3 Classes Admin Setup Starting...\n");

  const app  = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db   = getFirestore(app);

  try {
    // Step 1: Create admin user
    console.log("📧 Creating admin user:", ADMIN_EMAIL);
    const userCredential = await createUserWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
    const uid = userCredential.user.uid;
    console.log("✅ Admin user created! UID:", uid);

    // Step 2: Write Firestore profile
    console.log("\n📝 Writing Firestore profile...");
    await setDoc(doc(db, "users", uid), {
      name:  ADMIN_NAME,
      email: ADMIN_EMAIL,
      role:  "admin",
    });
    console.log("✅ Firestore profile saved!");

    console.log("\n🎉 Setup complete!");
    console.log("─────────────────────────────");
    console.log("Login URL : https://e3-classes-8656d.web.app");
    console.log("Email     :", ADMIN_EMAIL);
    console.log("Password  :", ADMIN_PASSWORD);
    console.log("─────────────────────────────");
    process.exit(0);

  } catch (err) {
    if (err.code === "auth/email-already-in-use") {
      console.log("⚠️  Admin user already exists — setup already done!");
      process.exit(0);
    }
    if (err.code === "auth/configuration-not-found" || err.code === "auth/operation-not-allowed") {
      console.error("\n❌ Email/Password auth is NOT enabled yet!");
      console.error("   → Go to: console.firebase.google.com/project/e3-classes-8656d/authentication");
      console.error("   → Click Get started → Email/Password → Enable → Save");
      console.error("   → Then run this script again.\n");
    } else {
      console.error("\n❌ Error:", err.code, err.message);
    }
    process.exit(1);
  }
}

setupAdmin();
