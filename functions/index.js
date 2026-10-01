/* ShopNova Cloud Functions — payment verification + order email.
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
