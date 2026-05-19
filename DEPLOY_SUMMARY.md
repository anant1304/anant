# E³ Classes — Deploy Progress Summary
**Date:** 2026-05-09

---

## ✅ Jo Ho Chuka Hai
- App build ho gayi
- Firebase Hosting pe **LIVE** hai → https://e3-classes-8656d.web.app
- `firebase.js` sahi project se connected hai (`e3-classes-8656d`)
- Billing account linked hai (₹500 prepayment)

---

## ⏳ Jo Baaki Hai (In Order)

### Step 1 — Firestore Database Banao
Link: `console.firebase.google.com/project/e3-classes-8656d/firestore`
- Create database → Standard edition → Next
- Location: **asia-south1** → Next
- **Start in production mode** → Create

### Step 2 — Authentication Enable Karo
Link: `console.firebase.google.com/project/e3-classes-8656d/authentication`
- Get started → Email/Password → Enable → Save

### Step 3 — Admin User Banao
Same Authentication page:
- Add user → Email: `admin@e3.com` → Password: `Admin@123`
- Naye user ka **UID copy karo**

### Step 4 — Admin ka Firestore Record Banao
Link: `console.firebase.google.com/project/e3-classes-8656d/firestore`
- Start collection → Collection ID: `users`
- Document ID: **(paste UID from Step 3)**
- Fields:
  - `name` = `Admin`
  - `email` = `admin@e3.com`
  - `role` = `admin`
- Save

### Step 5 — App Test Karo
Open: https://e3-classes-8656d.web.app
- Admin tab → `admin@e3.com` / `Admin@123` se login karo

---

## 📋 Firestore Security Rules (Step 1 ke baad lagani hain)
Firestore → Rules → Paste karo:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isSignedIn() { return request.auth != null; }
    function role() { return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role; }
    match /users/{uid} {
      allow read: if isSignedIn();
      allow write: if isSignedIn() && (request.auth.uid == uid || role() == "admin" || role() == "teacher");
    }
    match /classes/{cid} {
      allow read: if isSignedIn();
      allow create, update, delete: if isSignedIn() && (role() == "admin" || role() == "teacher");
      match /tests/{tid} {
        allow read: if isSignedIn();
        allow write: if isSignedIn();
      }
    }
  }
}
```

---

## 🔑 Important Info
- **Project ID:** e3-classes-8656d
- **Live URL:** https://e3-classes-8656d.web.app
- **Admin Email:** admin@e3.com
- **Admin Password:** Admin@123
