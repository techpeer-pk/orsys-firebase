# ORSYS-ARY v3.0 — Firebase Edition

React + Vite + Firebase (Auth + Firestore + Hosting) — No backend server needed.

---

## ⚡ Quick Start

### Step 1 — Firebase Project banao

1. https://console.firebase.google.com → **Add project**
2. Project name: `orsys-ary`
3. Google Analytics: optional (off kar sakte ho)
4. Project ban jayega

### Step 2 — Firebase services enable karo

**Authentication:**
- Build → Authentication → Get started
- Sign-in method → **Email/Password** → Enable → Save

**Firestore:**
- Build → Firestore Database → Create database
- **Start in production mode** → Next
- Location: `asia-south1` (Pakistan ke liye best) → Enable

**Hosting:**
- Build → Hosting → Get started → follow steps

### Step 3 — Firebase config copy karo

Project Settings (gear icon) → General → Your apps → **Add app** → Web (`</>`)
- App nickname: `orsys-ary-web`
- Firebase SDK snippet: **Config** copy karo

### Step 4 — .env file banao

```bash
cp .env.example .env
```

`.env` mein apni values daalo:

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=orsys-ary.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=orsys-ary
VITE_FIREBASE_STORAGE_BUCKET=orsys-ary.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

### Step 5 — Dependencies install karo

```bash
npm install
```

### Step 6 — Pehla Admin user banao

Firebase Console → Authentication → Users → **Add user**
- Email: `admin@aryservices.com.pk`
- Password: `Admin@1234` (baad mein zaroor change karo)
- **UID copy karo** (user ke samne show hoga)

Phir Firestore → **users** collection → **Add document**
- Document ID: (woh UID jo copy kiya)
- Fields:
  ```
  name:   "Admin User"       (string)
  email:  "admin@aryservices.com.pk" (string)
  role:   "admin"            (string)
  status: "active"           (string)
  ```

Ab se Admin Panel se nayi users directly bana sakte ho — yeh sirf pehli dafa karna hai.

### Step 7 — Run karo

```bash
npm run dev
# → http://localhost:5173
```

---

## 🔐 Firestore Security Rules

Firebase Console → Firestore → **Rules** tab mein yeh paste karo:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper functions
    function isAuth() {
      return request.auth != null;
    }
    function getUser() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data;
    }
    function hasRole(roles) {
      return isAuth() && getUser().role in roles && getUser().status == 'active';
    }

    // Users collection
    match /users/{userId} {
      allow read:  if isAuth();
      allow write: if hasRole(['admin']);
      // Allow user to read own doc
      allow read:  if request.auth.uid == userId;
    }

    // Vouchers collection
    match /vouchers/{voucherId} {
      allow read:   if isAuth();
      allow create: if hasRole(['admin', 'manager', 'cashier']);
      allow update: if hasRole(['admin', 'manager']);
      allow delete: if hasRole(['admin']);
    }

    // Heads collection
    match /heads/{headId} {
      allow read:  if isAuth();
      allow write: if hasRole(['admin']);
    }
  }
}
```

**Publish** button dabao — rules live ho jayenge.

---

## 🔑 Firestore Indexes

Reports page ke liye compound indexes chahiye.
Firebase Console → Firestore → **Indexes** → Add index:

| Collection | Field 1 | Field 2 | Field 3 | Query scope |
|------------|---------|---------|---------|-------------|
| vouchers   | paymentStatus (Asc) | entryDate (Asc) | — | Collection |
| vouchers   | entryDate (Asc) | createdAt (Desc) | — | Collection |

Ya jab app run karo toh console mein error aayega jisme direct link hoga — woh click karo aur index auto-ban jayega.

---

## 🚀 Firebase Hosting Deploy

```bash
# Firebase CLI install (ek baar)
npm install -g firebase-tools

# Login
firebase login

# Init (project folder mein)
firebase init hosting
# → Use existing project → orsys-ary
# → Public directory: dist
# → Single-page app: YES
# → GitHub auto-deploy: optional

# Build + Deploy
npm run deploy
# → https://orsys-ary.web.app
```

---

## 🗄️ Firestore Collections

```
users/          {uid}  → name, email, role, status
vouchers/       {id}   → slipNo, paymentFrom, pointPerson, paymentMode,
                         paymentStatus, totalAmount, denominations[],
                         headId, headName, remarks, entryDate, createdAt,
                         createdById, createdByName
heads/          {id}   → name, code, category, description, status
```

---

## 🔐 Role Permissions

| Action         | admin | manager | cashier | reports |
|----------------|-------|---------|---------|---------|
| View vouchers  | ✅    | ✅      | ✅      | ✅      |
| Create voucher | ✅    | ✅      | ✅      | ❌      |
| Edit voucher   | ✅    | ✅      | ❌      | ❌      |
| Delete voucher | ✅    | ❌      | ❌      | ❌      |
| View reports   | ✅    | ✅      | ❌      | ✅      |
| Export Excel   | ✅    | ✅      | ❌      | ✅      |
| Admin panel    | ✅    | ❌      | ❌      | ❌      |

---

## 📅 Firebase Free Tier Limits (Spark Plan)

| Service       | Free Limit        | ORSYS-ARY usage |
|---------------|-------------------|-----------------|
| Auth users    | Unlimited         | ~10 users ✅    |
| Firestore reads | 50,000/day      | ~500/day ✅     |
| Firestore writes | 20,000/day     | ~50/day ✅      |
| Hosting       | 10 GB/month       | ~5 MB ✅        |

**ARY ke liye free tier kaafi hai** — upgrade ki zaroorat nahi.

---

*Built with ❤️ by TechPeer for ARY Services*
