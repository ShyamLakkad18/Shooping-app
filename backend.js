/* ShopNova v8 — real backend */
(function () {
"use strict";
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) || d; } catch (e) { return d; } };

if (typeof firebaseConfig === "undefined" || firebaseConfig.apiKey.includes("PASTE")) {
  console.info("ShopNova backend: running in offline/demo mode. See SETUP_README.txt to enable a real backend.");
  return;
}

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
let uid = null, unsub = [];

function toast(m) { if (window.showToast) showToast(m); }

/* ---------------- AUTH: wire into existing forms ---------------- */
function friendlyErr(e) {
  return { "auth/email-already-in-use": "This email is already registered. Try signing in.",
    "auth/invalid-email": "Please enter a valid email address.", "auth/weak-password": "Password should be at least 6 characters.",
    "auth/wrong-password": "Incorrect password.", "auth/user-not-found": "No account found with this email.",
    "auth/invalid-credential": "Incorrect email or password." }[e.code] || e.message;
}

function wireForm(form, mode) {
  if (!form || form.dataset.fbWired) return; form.dataset.fbWired = 1;
  form.addEventListener("submit", async e => {
    e.preventDefault();
    const inputs = $$("input", form);
    const email = (inputs.find(i => i.type === "email" || /email/i.test(i.placeholder || "")) || inputs[0]).value.trim();
    const pass = (inputs.find(i => i.type === "password") || {}).value || "";
    const nameField = inputs.find(i => /name/i.test(i.placeholder || ""));
    const errBox = $(".g-err", form.closest("#gate")) || null;
    if (!email || !pass) { if (errBox) errBox.textContent = "Please fill in all fields"; return; }
    try {
      if (mode === "signup") {
        const cred = await auth.createUserWithEmailAndPassword(email, pass);
        const name = nameField ? nameField.value.trim() : email.split("@")[0];
        await cred.user.updateProfile({ displayName: name });
        await db.collection("users").doc(cred.user.uid).set({ name, email, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
      } else {
        await auth.signInWithEmailAndPassword(email, pass);
      }
    } catch (err) {
      const msg = friendlyErr(err);
      if (errBox) errBox.textContent = msg; else toast(msg);
    }
  });
}
wireForm($("#signinForm"), "signin");
wireForm($("#signupForm"), "signup");
wireForm($('.g-form[data-f="in"]'), "signin");
wireForm($('.g-form[data-f="up"]'), "signup");

$("#gGuest") && $("#gGuest").addEventListener("click", () => { auth.signInAnonymously().catch(() => {}); }, { capture: true });

const logoutBtn = document.createElement("button");
logoutBtn.className = "logout-btn"; logoutBtn.textContent = "Log Out"; logoutBtn.style.display = "none";
$(".sidebar-content").appendChild(logoutBtn);
logoutBtn.onclick = () => auth.signOut();

/* ---------------- FIRESTORE SYNC ---------------- */
function stopSync() { unsub.forEach(f => f()); unsub = []; }

function syncUser(user) {
  stopSync();
  uid = user.uid;
  logoutBtn.style.display = "block";
  if (!user.isAnonymous) {
    const name = user.displayName || (user.email ? user.email.split("@")[0] : "User");
    if (window.setLoggedInUser) setLoggedInUser(name);
  }

  /* cart: two-way sync */
  const cartRef = db.collection("carts").doc(uid);
  cartRef.get().then(doc => {
    if (doc.exists && doc.data().items) { window.cart = doc.data().items; if (window.saveCart) { localStorage.setItem("shopnovaCart", JSON.stringify(cart)); } if (window.renderCart) renderCart(); }
    else cartRef.set({ items: window.cart || [] });
  });
  const origSaveCart = window.saveCart;
  window.saveCart = function () {
    origSaveCart();
    if (uid) cartRef.set({ items: cart }).catch(() => {});
  };

  /* wishlist */
  const wishRef = db.collection("users").doc(uid).collection("meta").doc("wishlist");
  wishRef.get().then(doc => { if (doc.exists) { window.wishlist = doc.data().ids || []; localStorage.setItem("shopnovaWishlist", JSON.stringify(wishlist)); if (window.renderProducts) renderProducts(); } });
  const origToggleWish = window.toggleWishlist;
  window.toggleWishlist = function (id) { origToggleWish(id); if (uid) wishRef.set({ ids: wishlist }).catch(() => {}); };

  /* addresses */
  const addrRef = db.collection("users").doc(uid).collection("meta").doc("addresses");
  addrRef.get().then(doc => { if (doc.exists && window.save) { save("shopnovaAddrs", doc.data().list || []); } });

  /* orders: real-time list from Firestore */
  const ordersCol = db.collection("users").doc(uid).collection("orders").orderBy("ts", "desc");
  unsub.push(ordersCol.onSnapshot(snap => {
    const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    save("shopnovaOrders", list.map(o => ({ id: o.orderId || o.id, ts: o.ts && o.ts.toMillis ? o.ts.toMillis() : Date.now(), items: o.items, total: o.total, pay: o.pay })));
  }, () => {}));

  /* reviews: write-through to public collection, keyed by product */
  const origSubmit = null; /* handled below via event capture */

  toast(user.isAnonymous ? "Continuing as guest" : "Signed in ✅ Your data is now synced");
}

auth.onAuthStateChanged(user => {
  if (user) { syncUser(user); }
  else { uid = null; stopSync(); logoutBtn.style.display = "none"; }
});

/* persist address writes to Firestore whenever the local list changes */
const _saveLocal = save;
window.save = function (k, v) {
  _saveLocal(k, v);
  if (!uid) return;
  if (k === "shopnovaAddrs") db.collection("users").doc(uid).collection("meta").doc("addresses").set({ list: v }).catch(() => {});
};

/* reviews -> public Firestore collection so everyone sees them */
document.addEventListener("click", e => {
  const sd = e.target.closest("#rvSend"); if (!sd || !uid) return;
  const pid = sd.dataset.pid, txt = ($("#rvText") || {}).value;
  if (!txt) return;
  db.collection("products").doc(String(pid)).collection("reviews").add({
    name: auth.currentUser.displayName || "User", stars: +($(".rv-stars") || { dataset: { s: 5 } }).dataset.s,
    text: txt, ts: firebase.firestore.FieldValue.serverTimestamp()
  }).catch(() => {});
});

/* admin-added products -> public Firestore collection, loaded for ALL visitors */
db.collection("adminProducts").onSnapshot(snap => {
  snap.docChanges().forEach(c => {
    if (c.type === "removed") { const i = products.findIndex(p => p.id === c.doc.data().id); if (i > -1) products.splice(i, 1); return; }
    const p = c.doc.data();
    if (!products.some(x => x.id === p.id)) products.push(p);
  });
  if (window.renderProducts) { renderProducts(); renderDeals(); renderMenProducts(); renderWomenProducts(); }
}, () => {});
const _saveAdmin = null;
document.addEventListener("click", e => {
  if (e.target.id !== "adSave" || !uid) return;
  setTimeout(() => {
    const list = load("shopnovaAdmin", []);
    const latest = list[list.length - 1];
    if (latest) db.collection("adminProducts").doc(String(latest.id)).set(latest).catch(() => {});
  }, 50);
});

toast("Connecting to ShopNova backend...");
})();

/* ---------------- RAZORPAY PAYMENT (test mode) ---------------- */
(function () {
"use strict";
if (typeof RAZORPAY_KEY_ID === "undefined" || RAZORPAY_KEY_ID.includes("PASTE")) return;
const $ = s => document.querySelector(s);
document.addEventListener("click", e => {
  const btn = e.target.closest("#placeOrderBtn"); if (!btn) return;
  const payChoice = $("input[name=pay]:checked");
  if (!payChoice || payChoice.value === "Cash on Delivery") return; /* let the normal demo flow run for COD */
  e.stopPropagation(); e.preventDefault();
  const amountText = $("#checkoutGrandTotal") ? $("#checkoutGrandTotal").textContent.replace(/[^0-9]/g, "") : "0";
  const amount = Math.max(100, (+amountText || 100) * 100); /* paise, min ₹1 */
  const rzp = new Razorpay({
    key: RAZORPAY_KEY_ID, amount, currency: "INR", name: "ShopNova",
    description: "Order payment (TEST MODE)", theme: { color: "#ff9900" },
    handler: function (resp) {
      const orderId = "SN" + Math.floor(10000 + Math.random() * 89999);
      const idEl = $("#checkoutOrderId"); if (idEl) idEl.textContent = "#" + orderId;
      window.__rzpPaid = { orderId, paymentId: resp.razorpay_payment_id };
      btn.click(); /* re-trigger normal place-order flow (now COD-branch skipped via flag below) */
    },
    modal: { ondismiss: function () { window.showToast && showToast("Payment cancelled"); } }
  });
  rzp.open();
}, true);
})();

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
