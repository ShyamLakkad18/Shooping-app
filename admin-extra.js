/* ShopNova v9 — admin security, order dashboard, stock control */
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
