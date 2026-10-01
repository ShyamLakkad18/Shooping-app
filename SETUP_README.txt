===========================================================================
ShopNova — REAL BACKEND setup (Firebase + Razorpay)
===========================================================================
This connects your site to a REAL, free backend:
  - Real sign up / sign in (Firebase Authentication)
  - Real database: cart, orders, wishlist, addresses, reviews sync across
    devices (Firestore) and admin-added products become visible to everyone
  - Real payments in TEST mode (Razorpay) — no actual money moves until you
    complete Razorpay's business KYC and switch to live keys yourself.

Total time: about 15-20 minutes. Everything is free.

---------------------------------------------------------------------------
STEP 1 — Create your Firebase project (free)
---------------------------------------------------------------------------
1. Go to https://console.firebase.google.com and sign in with any Google account.
2. Click "Add project" -> give it a name (e.g. "shopnova") -> continue -> you can
   disable Google Analytics -> Create project.
3. In the left sidebar click "Build > Authentication" -> "Get started".
   Under "Sign-in method" enable "Email/Password" and also enable
   "Anonymous" (this powers the "Continue as Guest" button). Save.
4. In the left sidebar click "Build > Firestore Database" -> "Create database"
   -> choose "Start in test mode" (we will tighten rules in Step 3) -> pick
   any location close to you -> Enable.
5. Click the gear icon (top left) -> "Project settings" -> scroll down to
   "Your apps" -> click the </> (Web) icon -> give it a nickname -> Register app.
   Firebase will show you a `firebaseConfig` object. Copy those values into
   firebase-config.js (in this folder), replacing the PASTE_... placeholders.

---------------------------------------------------------------------------
STEP 2 — Create your Razorpay TEST key (free, no KYC needed for test mode)
---------------------------------------------------------------------------
1. Go to https://dashboard.razorpay.com/signup and sign up (any email).
2. You will land in TEST MODE by default (toggle top-left says "Test Mode").
3. Go to Settings -> API Keys -> "Generate Test Key".
4. Copy the "Key Id" (starts with rzp_test_...) into razorpay-config.js,
   replacing the PASTE_... placeholder. You do NOT need the Key Secret for
   this site (it is only used for a browser checkout popup).
5. Test payments: on the Razorpay checkout popup, use card number
   4111 1111 1111 1111, any future expiry, any CVV, and any OTP — no real
   money is charged in test mode.
   NOTE: real (live) payments require Razorpay's business verification
   (PAN, bank account, GST if applicable) which only you can complete on
   their dashboard — I cannot do this step for you.

---------------------------------------------------------------------------
STEP 3 — Firestore security rules (protects your database)
---------------------------------------------------------------------------
In the Firebase console, go to Firestore Database -> Rules, delete
everything there, paste the block below, then click "Publish":

  rules_version = '2';
  service cloud.firestore {
    match /databases/{database}/documents {
      match /users/{uid} {
        allow read, write: if request.auth != null && request.auth.uid == uid;
        match /orders/{orderId} {
          allow read, write: if request.auth != null && request.auth.uid == uid;
        }
        match /meta/{doc} {
          allow read, write: if request.auth != null && request.auth.uid == uid;
        }
      }
      match /carts/{uid} {
        allow read, write: if request.auth != null && request.auth.uid == uid;
      }
      match /products/{pid}/reviews/{rid} {
        allow read: if true;
        allow create: if request.auth != null;
      }
      match /adminProducts/{pid} {
        allow read: if true;
        allow write: if request.auth != null;
      }
    }
  }

---------------------------------------------------------------------------
STEP 4 — Put your site online for real (free hosting + a real URL)
---------------------------------------------------------------------------
1. Install Node.js from https://nodejs.org if you don't have it.
2. Open a terminal in this folder and run:
       npm install -g firebase-tools
       firebase login
   (this opens your browser to sign in with the SAME Google account you
   used in Step 1 — this is why I cannot run it for you.)
3. Then run:
       firebase init hosting
   - Choose "Use an existing project" -> pick the project you made in Step 1.
   - Public directory: type   .   (a single dot, meaning this folder)
   - Configure as a single-page app: No
   - Do NOT overwrite index.html
4. Deploy:
       firebase deploy
   Firebase will print a real live URL like https://shopnova-xxxx.web.app
   — open it, and share it with anyone.
5. Whenever you make changes to your files, just run "firebase deploy" again.

---------------------------------------------------------------------------
That's it. Once Steps 1-2 are done and files are filled in, reload
index.html (Ctrl+F5) — the "⚠️ Backend not configured" banner will
disappear and real login / database / payments will work immediately,
even before you deploy (deploying just gives you a public URL).
===========================================================================


---------------------------------------------------------------------------
STEP 5 — Restrict the Admin Panel to only you
---------------------------------------------------------------------------
1. Open admin-config.js (in this folder) and replace the placeholder email
   with the email you will sign up with on this site (e.g. "[email protected]").
2. In Firebase console -> Firestore Database -> Rules, replace your rules
   with the block below (adds admin + stock + order-status rules), then
   Publish. Replace YOUR_EMAIL_HERE with the SAME email as admin-config.js:

  rules_version = '2';
  service cloud.firestore {
    match /databases/{database}/documents {
      function isAdmin() { return request.auth != null && request.auth.token.email == "YOUR_EMAIL_HERE"; }
      match /users/{uid} {
        allow read, write: if request.auth != null && request.auth.uid == uid;
        match /orders/{orderId} {
          allow read: if request.auth != null && (request.auth.uid == uid || isAdmin());
          allow create: if request.auth != null && request.auth.uid == uid;
          allow update: if isAdmin();
        }
        match /meta/{doc} {
          allow read, write: if request.auth != null && request.auth.uid == uid;
        }
      }
      match /carts/{uid} {
        allow read, write: if request.auth != null && request.auth.uid == uid;
      }
      match /products/{pid}/reviews/{rid} {
        allow read: if true;
        allow create: if request.auth != null;
      }
      match /adminProducts/{pid} {
        allow read: if true;
        allow write: if isAdmin();
      }
      match /stock/{pid} {
        allow read: if true;
        allow write: if isAdmin();
      }
    }
  }

3. In the Firebase console under Firestore, you can create documents in a
   "stock" collection (doc id = product id, field qty = number) for any
   product whose stock you want to actually enforce. Products with no
   matching "stock" doc are treated as always in stock.

---------------------------------------------------------------------------
STEP 6 — Enable Cloud Functions (needed for real payment verification and
          order confirmation emails). This requires Firebase's "Blaze"
          (pay-as-you-go) plan — you must add a card, but ShopNova's usage
          is tiny and stays within the free monthly quota (normally Rs 0).
---------------------------------------------------------------------------
1. In the Firebase console, click "Upgrade" (bottom-left) -> choose Blaze.
2. In a terminal in this folder, run:
       npm install -g firebase-tools     (skip if already installed)
       firebase login
       firebase init functions
   - Choose "Use an existing project" -> your project
   - Language: JavaScript
   - When it asks to overwrite functions/index.js and functions/package.json,
     choose YES (this patch already created those two files for you with
     the correct code — just let the wizard link them into your project).
3. Get a Gmail "App Password" (for sending confirmation emails):
   - Go to https://myaccount.google.com/apppasswords (requires 2-Step
     Verification turned on for that Gmail account)
   - Create an app password named "ShopNova" and copy the 16-character code.
4. Get your Razorpay Key Secret (for verifying payments):
   - Razorpay dashboard -> Settings -> API Keys -> next to your test key,
     reveal and copy the "Key Secret".
5. Set your config and deploy:
       firebase functions:config:set gmail.email="[email protected]" gmail.password="your16charapppassword"
       firebase functions:config:set razorpay.secret="your_razorpay_key_secret"
       firebase deploy --only functions
   This deploys two functions: verifyPayment and sendOrderEmail. Once
   deployed, payments are verified server-side automatically, and a
   confirmation email is sent whenever a real order is created.

---------------------------------------------------------------------------
STEP 7 — Legal pages
---------------------------------------------------------------------------
Privacy Policy, Terms, Shipping and Returns pages are now wired to the
footer links automatically (legal.js). Edit the text inside legal.js
(the PAGES object) to match your real business details before going live.

---------------------------------------------------------------------------
STEP 8 — Recap: what needs a real account/plan vs what is already free
---------------------------------------------------------------------------
FREE, no extra signup needed (works as soon as Steps 1-2 are done):
  - Real login/signup, database sync, admin dashboard, stock, legal pages.
REQUIRES Firebase Blaze plan (card on file, normally Rs 0 billed):
  - Server-verified payments, order confirmation emails (Step 6).
REQUIRES Razorpay business KYC (only you can do this, on their dashboard):
  - Accepting REAL money instead of test-mode payments.
===========================================================================
