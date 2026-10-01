"""
ShopNova v9 patcher — admin security, admin order dashboard, stock control,
legal pages, and Cloud Functions (server-side payment verification + email).
Run AFTER patch_shopnova_v8.py, in the same folder:
    python patch_shopnova_v9.py
"""
import sys, shutil, os

ADMIN_CONFIG = '''/* List the email address(es) that are allowed to use the Admin Panel
   and Admin Order Dashboard. Replace with your own email(s). */
const ADMIN_EMAILS = ["[email protected]"];
'''

ADMIN_JS = r'''/* ShopNova v9 — admin security, order dashboard, stock control */
(function () {
"use strict";
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const money = n => formatPrice(n);
function modal(t) {
  const o = document.createElement("div"); o.className = "ord-overlay";
  o.innerHTML = `<div class="ord-modal"><button class="modal-close">✕</button><h3>${t}</h3><div class="mb"></div></div>`;
  document.body.appendChild(o);
  o.addEventListener("click", e => { if (e.target === o || e.target.classList.contains("modal-close")) o.classList.remove("active"); });
  o.body = $(".mb", o); return o;
}
const hasBackend = typeof firebase !== "undefined" && typeof firebaseConfig !== "undefined" && !firebaseConfig.apiKey.includes("PASTE");
const isAdminEmail = () => hasBackend && firebase.auth().currentUser && !firebase.auth().currentUser.isAnonymous &&
  typeof ADMIN_EMAILS !== "undefined" && ADMIN_EMAILS.includes(firebase.auth().currentUser.email);

/* ---- gate the existing admin panel behind a real email check when backend is on ---- */
if (hasBackend) {
  const sbAdmin = $("#sbAdmin");
  if (sbAdmin) {
    const clone = sbAdmin.cloneNode(true); sbAdmin.parentNode.replaceChild(clone, sbAdmin);
    clone.onclick = () => {
      closeSidebar();
      if (!firebase.auth().currentUser) return showToast("Please sign in first");
      if (!isAdminEmail()) return showToast("⛔ Admin access is restricted to the store owner");
      window.__openLegacyAdmin ? window.__openLegacyAdmin() : showToast("Admin panel unavailable");
    };
  }
}

/* ---- Admin Order Dashboard (all customers' orders) ---- */
const dm = modal("📦 Admin Order Dashboard");
const STATUSES = ["Placed", "Packed", "Shipped", "Delivered", "Cancelled"];
function loadAllOrders() {
  dm.body.innerHTML = "<p class='ord-empty'>Loading orders...</p>";
  firebase.firestore().collectionGroup("orders").orderBy("ts", "desc").limit(100).get().then(snap => {
    if (snap.empty) { dm.body.innerHTML = "<p class='ord-empty'>No orders yet.</p>"; return; }
    dm.body.innerHTML = snap.docs.map(d => {
      const o = d.data(), ref = d.ref.path;
      return `<div class="ord"><div class="ord-h"><b>${o.orderId || d.id}</b><span>${o.ts && o.ts.toDate ? o.ts.toDate().toLocaleString("en-IN") : ""}</span></div>
      <div class="ord-h"><span>${o.email || "customer"}</span></div>
      ${(o.items || []).map(it => `<div class="ord-i"><span>${it.name || ("Item #" + it.id)} × ${it.quantity}</span></div>`).join("")}
      <div class="ord-f"><span><b>${money(o.total || 0)}</b> · ${o.pay || ""}</span>
      <select class="addr-sel" data-ref="${ref}" style="width:150px">${STATUSES.map(s => `<option ${s === o.status ? "selected" : ""}>${s}</option>`).join("")}</select></div></div>`;
    }).join("");
  }).catch(err => { dm.body.innerHTML = `<p class="ord-empty">Could not load orders.<br><small>${err.message}</small><br><small>Tip: Firestore may ask you to create an index the first time — check the browser console (F12) for a link to create it automatically.</small></p>`; });
}
dm.body.addEventListener("change", e => {
  const s = e.target.closest("select[data-ref]"); if (!s) return;
  firebase.firestore().doc(s.dataset.ref).update({ status: s.value }).then(() => showToast("Order status updated ✅")).catch(() => showToast("Could not update — check admin rules"));
});
if (hasBackend) {
  const link = document.createElement("button");
  link.id = "sbAdminOrders"; link.textContent = "📦 All Orders (Admin)";
  const anchor = $("#sbAdmin") || $("#sidebarHelp");
  if (anchor) anchor.insertAdjacentElement("afterend", link);
  link.onclick = () => {
    closeSidebar();
    if (!isAdminEmail()) return showToast("⛔ Admin access is restricted to the store owner");
    dm.classList.add("active"); loadAllOrders();
  };
}

/* ---- Customer order history: read live status from Firestore when signed in ---- */
if (hasBackend) {
  const om = $(".ord-overlay"); /* the existing "My Orders" modal from v3, reused if found */
  const origBtn = $(".header-action.orders"), sideBtn = $("#sidebarOrders");
  function realOrders() {
    const user = firebase.auth().currentUser;
    const list = modal("My Orders");
    if (!user) { list.body.innerHTML = "<p class='ord-empty'>Please sign in to see your orders.</p>"; list.classList.add("active"); return; }
    list.classList.add("active");
    firebase.firestore().collection("users").doc(user.uid).collection("orders").orderBy("ts", "desc").onSnapshot(snap => {
      if (snap.empty) { list.body.innerHTML = "<p class='ord-empty'>No orders yet.</p>"; return; }
      list.body.innerHTML = snap.docs.map(d => {
        const o = d.data();
        const step = Math.max(0, STATUSES.indexOf(o.status || "Placed"));
        const cancelled = o.status === "Cancelled";
        return `<div class="ord"><div class="ord-h"><b>${o.orderId || d.id}</b><span>${o.ts && o.ts.toDate ? o.ts.toDate().toLocaleString("en-IN") : "just now"}</span></div>
        ${(o.items || []).map(it => `<div class="ord-i"><span>${it.name || ("Item #" + it.id)} × ${it.quantity}</span></div>`).join("")}
        ${cancelled ? '<div class="ord-badge">Cancelled</div>' : `<div class="trk">${STATUSES.slice(0, 4).map((n, k) => `<i class="${k <= step ? "on" : ""}"><em></em>${n}</i>`).join("")}</div>`}
        <div class="ord-f"><span><b>${money(o.total || 0)}</b> · ${o.pay || ""}</span></div></div>`;
      }).join("");
    });
  }
  if (origBtn) { const c = origBtn.cloneNode(true); origBtn.parentNode.replaceChild(c, origBtn); c.onclick = realOrders; }
  if (sideBtn) { const c = sideBtn.cloneNode(true); sideBtn.parentNode.replaceChild(c, sideBtn); c.onclick = () => { closeSidebar(); realOrders(); }; }
}

/* ---- Stock-aware checkout: transactional decrement, write real order doc ---- */
if (hasBackend) {
  document.addEventListener("click", async e => {
    const btn = e.target.closest("#placeOrderBtn"); if (!btn) return;
    const user = firebase.auth().currentUser; if (!user) return; /* let old demo flow run if signed out */
    e.stopImmediatePropagation(); e.preventDefault();
    const db = firebase.firestore(), items = (window.cart || []).map(i => ({ ...i }));
    if (!items.length) return showToast("Your cart is empty");
    const full = items.map(i => ({ ...i, product: products.find(p => p.id === i.id) })).filter(i => i.product);
    const total = full.reduce((a, i) => a + i.product.price * i.quantity, 0);
    try {
      await db.runTransaction(async tx => {
        const refs = full.map(i => db.collection("stock").doc(String(i.id)));
        const docs = await Promise.all(refs.map(r => tx.get(r)));
        docs.forEach((d, idx) => { if (d.exists && d.data().qty < full[idx].quantity) throw new Error(`Only ${d.data().qty} left of "${full[idx].product.name}"`); });
        docs.forEach((d, idx) => { if (d.exists) tx.update(refs[idx], { qty: d.data().qty - full[idx].quantity }); });
      });
    } catch (err) { showToast(err.message || "Could not complete order — try again"); return; }
    const orderId = "SN" + Math.floor(10000 + Math.random() * 89999);
    const payEl = $("input[name=pay]:checked");
    const paid = window.__rzpPaid;
    const orderDoc = { orderId, email: user.email || "guest", items: full.map(i => ({ id: i.id, quantity: i.quantity, name: i.product.name })),
      total, pay: paid ? "Razorpay" : (payEl ? payEl.value : "COD"), status: "Placed", ts: firebase.firestore.FieldValue.serverTimestamp() };
    if (paid) { orderDoc.paymentId = paid.paymentId; window.__rzpPaid = null; }
    try { await db.collection("users").doc(user.uid).collection("orders").add(orderDoc); } catch (err) { showToast("Order placed, but could not save to history"); }
    const idEl = $("#checkoutOrderId"); if (idEl) idEl.textContent = "#" + orderId;
    window.cart.length = 0; if (window.saveCart) saveCart(); if (window.renderCart) renderCart();
    if (window.goToCheckoutStep) goToCheckoutStep(3);
  }, true);
}
})();
'''

ADMIN_CSS = r'''/* v9 admin styling reuses .ord, .ord-modal etc from earlier patches */
'''

LEGAL_JS = r'''/* ShopNova v9 — legal pages */
(function () {
"use strict";
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
function modal(t) {
  const o = document.createElement("div"); o.className = "ord-overlay";
  o.innerHTML = `<div class="ord-modal legal-modal"><button class="modal-close">✕</button><h3>${t}</h3><div class="mb"></div></div>`;
  document.body.appendChild(o);
  o.addEventListener("click", e => { if (e.target === o || e.target.classList.contains("modal-close")) o.classList.remove("active"); });
  o.body = $(".mb", o); return o;
}
const PAGES = {
  privacy: ["Privacy Policy", `<p>We collect only the information needed to run your account and orders: your name, email, address and order history.</p>
    <p>We never sell your personal data to third parties. Payment details are handled directly by our payment partner and are not stored on our servers.</p>
    <p>You can request deletion of your account and data at any time from the Help Center.</p><p><small>Last updated: 2026</small></p>`],
  terms: ["Terms &amp; Conditions", `<p>By using ShopNova you agree to shop responsibly and provide accurate delivery information.</p>
    <p>Prices and offers may change without notice. We reserve the right to cancel orders in case of pricing errors or stock issues.</p>
    <p>All product images are for illustration; actual products may vary slightly.</p><p><small>Last updated: 2026</small></p>`],
  shipping: ["Shipping Policy", `<p>Orders are typically delivered within 3-5 working days across India.</p>
    <p>Delivery is FREE on orders above ₹999. Orders below that amount carry a flat ₹49 delivery charge.</p>
    <p>You can track your order any time from "Returns &amp; Orders" in the header.</p>`],
  returns: ["Returns &amp; Refunds", `<p>Most items can be returned within 7 days of delivery, unused and in original packaging.</p>
    <p>To start a return, open "My Orders" and tap "Return / Refund" on the relevant order, or contact the Help Center.</p>
    <p>Refunds are processed within 3-5 business days to the original payment method (or as store credit for COD orders).</p>`],
  about: ["About ShopNova", `<p>ShopNova is a modern online store for fashion, electronics, home, beauty and more — built to make everyday shopping simple and affordable.</p>`]
};
const lm = modal("");
function openLegal(key) { const p = PAGES[key]; if (!p) return; $(".ord-modal h3", lm).innerHTML = p[0]; lm.body.innerHTML = p[1]; lm.classList.add("active"); }
$$(".footer-column a, .footer-bottom span").forEach(a => {
  const t = a.textContent.trim();
  const map = { "Privacy": "privacy", "Terms": "terms", "Shipping": "shipping", "Returns": "returns", "About ShopNova": "about" };
  if (map[t]) { a.href = "#"; a.addEventListener("click", e => { e.preventDefault(); openLegal(map[t]); }); }
});
})();
'''

LEGAL_CSS = r'''.legal-modal .mb p { color: #444; font-size: 13.5px; line-height: 1.8; margin-bottom: 12px; }
'''

FUNCTIONS_INDEX = r'''/* ShopNova Cloud Functions — payment verification + order email.
   Deploy with: firebase deploy --only functions   (needs Blaze plan, see SETUP_README.txt) */
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const crypto = require("crypto");
admin.initializeApp();

/* ---- 1. Verify a Razorpay payment signature (call this from the browser) ---- */
exports.verifyPayment = functions.https.onCall((data, context) => {
  const secret = functions.config().razorpay.secret;
  const body = data.orderId ? `${data.orderId}|${data.paymentId}` : `${data.paymentId}`;
  const expected = crypto.createHmac("sha256", secret).update(body).digest("hex");
  return { verified: expected === data.signature };
});

/* ---- 2. Send an order confirmation email whenever a new order is created ---- */
const nodemailer = require("nodemailer");
exports.sendOrderEmail = functions.firestore
  .document("users/{uid}/orders/{orderId}")
  .onCreate(async (snap, ctx) => {
    const order = snap.data();
    const cfg = functions.config().gmail;
    if (!cfg || !cfg.email || !cfg.password) { console.log("Gmail not configured, skipping email."); return null; }
    const transport = nodemailer.createTransport({ service: "gmail", auth: { user: cfg.email, pass: cfg.password } });
    const itemsHtml = (order.items || []).map(i => `<li>${i.name} × ${i.quantity}</li>`).join("");
    const mail = {
      from: `ShopNova <${cfg.email}>`, to: order.email,
      subject: `Order Confirmed - ${order.orderId}`,
      html: `<h2>Thanks for shopping with ShopNova!</h2><p>Your order <b>${order.orderId}</b> has been placed.</p><ul>${itemsHtml}</ul><p><b>Total: Rs ${order.total}</b></p><p>Payment: ${order.pay}</p>`
    };
    try { await transport.sendMail(mail); console.log("Email sent to", order.email); }
    catch (e) { console.error("Email failed:", e.message); }
    return null;
  });
'''

FUNCTIONS_PACKAGE = '''{
  "name": "functions",
  "engines": { "node": "18" },
  "main": "index.js",
  "dependencies": {
    "firebase-admin": "^12.0.0",
    "firebase-functions": "^4.9.0",
    "nodemailer": "^6.9.13"
  },
  "private": true
}
'''

RAZORPAY_VERIFY_PATCH = r'''
/* ---- v9: verify payment on the server before finishing the order ---- */
(function () {
"use strict";
const orig = Razorpay;
window.Razorpay = function (opts) {
  const origHandler = opts.handler;
  opts.handler = function (resp) {
    if (typeof firebase !== "undefined" && firebase.functions) {
      firebase.functions().httpsCallable("verifyPayment")({
        paymentId: resp.razorpay_payment_id, orderId: resp.razorpay_order_id || "", signature: resp.razorpay_signature || ""
      }).then(r => { if (r.data && r.data.verified === false) { showToast("⚠️ Payment could not be verified"); return; } origHandler(resp); })
        .catch(() => origHandler(resp)); /* if Functions aren't deployed yet, don't block the demo */
    } else { origHandler(resp); }
  };
  return new orig(opts);
};
})();
'''

README_APPEND = '''

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
'''

def read(p):
    with open(p, encoding="utf-8", newline=None) as f: return f.read()
def write(p, s):
    with open(p, "w", encoding="utf-8", newline="\n") as f: f.write(s)

try:
    html = read("index.html")
except FileNotFoundError as e:
    sys.exit(f"File not found: {e.filename}. Run this inside your ShopNova folder.")
if "backend.js" not in html:
    sys.exit("Run patch_shopnova_v8.py first, then this patch.")
if "admin-extra.js" in html:
    sys.exit("v9 already applied.")

shutil.copy("index.html", "index.v9.bak")

write("admin-config.js", ADMIN_CONFIG)
write("admin-extra.js", ADMIN_JS)
write("admin-extra.css", ADMIN_CSS)
write("legal.js", LEGAL_JS)
write("legal.css", LEGAL_CSS)

os.makedirs("functions", exist_ok=True)
write("functions/index.js", FUNCTIONS_INDEX)
write("functions/package.json", FUNCTIONS_PACKAGE)

# add a small script that wraps Razorpay to call server-side verification
with open("backend.js", "a", encoding="utf-8", newline="\n") as f:
    f.write(RAZORPAY_VERIFY_PATCH)

html = html.replace(
    '<script src="backend.js"></script>',
    '<script src="backend.js"></script>\n'
    '<script src="admin-config.js"></script>\n'
    '<script src="admin-extra.js"></script>\n'
    '<script src="legal.js"></script>\n'
    '<link rel="stylesheet" href="admin-extra.css">\n'
    '<link rel="stylesheet" href="legal.css">',
    1
)
write("index.html", html)

if os.path.exists("SETUP_README.txt"):
    with open("SETUP_README.txt", "a", encoding="utf-8", newline="\n") as f:
        f.write(README_APPEND)
else:
    write("SETUP_README.txt", README_APPEND)

print("Done! New files: admin-config.js, admin-extra.js, admin-extra.css, legal.js, legal.css,")
print("functions/index.js, functions/package.json. SETUP_README.txt updated with Steps 5-8.")
print("NEXT: edit admin-config.js with your email, then open SETUP_README.txt from Step 5 onward.")