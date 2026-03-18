# ORSYS — Online Cash Management System

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![Firebase](https://img.shields.io/badge/Firebase-11-FFCA28?logo=firebase)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite)

A modern, open-source cash receipt and voucher management system built with React, Vite, and Firebase. Designed for small to medium organizations that need a simple, reliable way to manage cash collections.

## ✨ Features

- 🔐 **Role-based Authentication** — Admin, Manager, Cashier, Reports roles
- 📄 **Voucher Management** — Create, edit, delete, and view cash receipts
- 💰 **Denomination Tracking** — Detailed cash breakdown by note value (PKR)
- 📊 **Reports & Export** — Date-range reports with Excel export
- 🔍 **Receipt Verification** — Public voucher verification by slip number
- 🎯 **Admin Panel** — Manage users and payment heads
- 📱 **PWA Support** — Installable app, works offline

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite 5, TypeScript |
| Styling | Tailwind CSS |
| Backend | Firebase (Auth + Firestore) |
| Hosting | Firebase Hosting |
| State | Zustand, TanStack Query |
| Forms | React Hook Form + Zod |

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- A Firebase project — [console.firebase.google.com](https://console.firebase.google.com)

### 1. Clone & Install

```bash
git clone https://github.com/your-username/orsys.git
cd orsys
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Fill in your Firebase credentials in `.env`:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

### 3. Firebase Setup

1. Enable **Authentication** → Email/Password
2. Enable **Firestore Database** → Production mode
3. Enable **Hosting**
4. Apply [Security Rules](#-security-rules)

### 4. Create First Admin

Firebase Console → Authentication → Add user, then in Firestore create a document in the `users` collection with the user's UID as the document ID:

```json
{
  "name": "Your Name",
  "email": "your@email.com",
  "role": "admin",
  "status": "active"
}
```

### 5. Run

```bash
npm run dev
# → http://localhost:5173
```

## 📦 Deploy

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
npm run deploy
```

## 🔐 Security Rules

Paste in Firebase Console → Firestore → Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isAuth() { return request.auth != null; }
    function getUser() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data;
    }
    function hasRole(roles) {
      return isAuth() && getUser().role in roles && getUser().status == 'active';
    }

    match /users/{userId} {
      allow read:  if isAuth();
      allow write: if hasRole(['admin']);
    }
    match /vouchers/{voucherId} {
      allow read:   if isAuth();
      allow create: if hasRole(['admin', 'manager', 'cashier']);
      allow update: if hasRole(['admin', 'manager']);
      allow delete: if hasRole(['admin']);
    }
    match /heads/{headId} {
      allow read:  if isAuth();
      allow write: if hasRole(['admin']);
    }
  }
}
```

## 👥 Role Permissions

| Action         | admin | manager | cashier | reports |
|----------------|:-----:|:-------:|:-------:|:-------:|
| View vouchers  | ✅ | ✅ | ✅ | ✅ |
| Create voucher | ✅ | ✅ | ✅ | ❌ |
| Edit voucher   | ✅ | ✅ | ❌ | ❌ |
| Delete voucher | ✅ | ❌ | ❌ | ❌ |
| View reports   | ✅ | ✅ | ❌ | ✅ |
| Export Excel   | ✅ | ✅ | ❌ | ✅ |
| Admin panel    | ✅ | ❌ | ❌ | ❌ |

## 🗄️ Data Schema

```
users/       {uid}  → name, email, role, status
vouchers/    {id}   → slipNo, paymentFrom, pointPerson, paymentMode,
                      paymentStatus, totalAmount, denominations[],
                      headId, headName, remarks, entryDate, createdAt
heads/       {id}   → name, code, category, description, status
```

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) before submitting a pull request.

## 📋 Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history.

## 📄 License

This project is licensed under the MIT License — see [LICENSE](LICENSE) for details.
