# Laundry & Dry Wash POS

A lightweight web-based point-of-sale and receipt printing app for laundry and dry wash businesses. The app lets staff create laundry orders, calculate totals with round-off adjustments, store orders in Firebase Cloud Firestore, export transactions, and print 80mm thermal receipts.

## Links

Live deployment: https://invoice-generator-sage-five.vercel.app

Repository: https://github.com/dhineshbuilder/Invoice_generator

## Screenshots

### Login

![Login screen](public/screenshots/login.png)

### New Order

![New order screen](public/screenshots/order.png)

### Dashboard

![Dashboard screen](public/screenshots/dashboard.png)

## Features

- Admin login flow stored locally in the browser.
- Create laundry orders with customer name, remark, order number, order date, delivery date, and line items.
- Item and customer suggestions for faster entry.
- Quantity, price, subtotal, round-off, and final total calculation.
- Firebase Cloud Firestore backed order storage.
- Recent transactions dashboard.
- Delete one order or clear all orders.
- Export orders to Excel.
- Export orders to PDF.
- 80mm thermal receipt print preview.
- Vercel-friendly single-page app routing.

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui and Radix UI
- React Router
- Firebase (Cloud Firestore)
- jsPDF and jspdf-autotable
- SheetJS/xlsx
- Vercel

## Architecture Overview

```text
src/
  App.tsx                 Route definitions and app providers
  main.tsx                React app entry point
  lib/
    firebase.ts           Firebase app & Firestore database setup
  store/
    orders.ts             Order CRUD operations against Cloud Firestore
  pages/
    Login.tsx             Admin login screen
    Order.tsx             New order form and receipt creation flow
    Dashboard.tsx         Order history, delete, Excel export, PDF export
    PrintPreview.tsx      80mm receipt preview and print action
  components/ui/          Shared shadcn/ui components
  styles/
    print.css             Receipt print styling
    index.css             Global styling and tailwind tokens
  utils/
    format.ts             INR and date formatting helpers

public/
  screenshots/            README screenshots
  logo.png                App logo assets
  logo1.png
```

The frontend talks directly to Firebase Cloud Firestore using the configuration variables in Vite environment variables. Order data is saved in an `orders` collection. Items are stored as an array of objects so each order keeps its line-item list together.

## Firestore Collection Schema

The app stores documents in the `orders` collection:

```typescript
interface FirestoreOrder {
  id: string;               // e.g. "ORD-101"
  customer_name: string;    // e.g. "JK Residency"
  remark: string;           // Notes or instructions
  created_at: string;       // ISO timestamp
  delivery_date: string;    // ISO timestamp or date string
  items: Array<{            // Line items
    id: string;
    name: string;
    qty: number;
    price: number;
  }>;
  round_off: number;        // Numeric round-off adjustment
  total: number;            // Grand total in INR (subtotal + round_off)
}
```

### Firestore Security Rules

To allow the POS client to read, write, and delete orders:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /orders/{orderId} {
      allow read, write, delete: if true;
    }
  }
}
```

## Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/dhineshbuilder/Invoice_generator.git
cd Invoice_generator
```

### 2. Install dependencies

```bash
npm install
```

On Windows PowerShell, use `npm.cmd` if script execution is blocked:

```powershell
npm.cmd install
```

### 3. Configure environment variables

Create a `.env` file in the project root:

```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
```

Use `.env.example` as the template. Do not commit real keys.

### 4. Create the Firestore database

1. Open your [Firebase Console](https://console.firebase.google.com).
2. Go to **Build > Firestore Database** and click **Create database**.
3. Choose a location and start in **Test mode** (or configure the security rules above).

### 5. Run the development server

```bash
npm run dev
```

Windows PowerShell:

```powershell
npm.cmd run dev
```

The app runs at:

```text
http://localhost:8080
```

### 6. Login

Default local login:

```text
Username: admin
Password: Admin1234
```

This is a simple frontend-only login for POS counter access.

## Available Scripts

```bash
npm run dev       # Start the Vite development server
npm run build     # Build for production
npm run preview   # Preview the production build locally
npm run lint      # Run ESLint
```

## Deployment

This project is ready for Vercel deployment.

1. Push the repository to GitHub.
2. Import the repository in Vercel.
3. Add these environment variables in Vercel Project Settings:

```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
```

4. Build command:

```bash
npm run build
```

5. Output directory:

```text
dist
```

The included `vercel.json` rewrites all routes to `index.html`, so direct links like `/order`, `/dashboard`, and `/print/:id` work correctly after deployment.

## Notes

- The app uses browser `localStorage` for admin login state.
- Firebase Cloud Firestore is used for real-time order persistence.
- Receipt printing depends on the browser print dialog and the styles in `src/styles/print.css`.
- Generated exports are created in the browser as `.xlsx` and `.pdf` files.
