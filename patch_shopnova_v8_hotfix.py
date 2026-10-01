"""
ShopNova v8 hotfix — removes the yellow "Backend not configured" banner
and keeps the site fully working in offline demo mode (like before v8).
Run this in the same folder as your other files:
    python patch_shopnova_v8_hotfix.py

You do NOT need Firebase or Razorpay accounts to use this fix.
If you later want the real backend (Firebase login/database, Razorpay
payments), just open SETUP_README.txt and follow it — the code is still
there and will turn on automatically once you fill in the config files.
"""
import sys, re

def read(p):
    with open(p, encoding="utf-8", newline=None) as f: return f.read()
def write(p, s):
    with open(p, "w", encoding="utf-8", newline="\n") as f: f.write(s)

try:
    backend = read("backend.js")
except FileNotFoundError:
    sys.exit("backend.js not found. Run patch_shopnova_v8.py first, then this hotfix.")

old = '''if (typeof firebaseConfig === "undefined" || firebaseConfig.apiKey.includes("PASTE")) {
  console.warn("ShopNova backend: firebase-config.js is not filled in yet. Running in offline/demo mode. See SETUP_README.txt.");
  const banner = document.createElement("div");
  banner.className = "backend-warn";
  banner.innerHTML = "⚠️ Backend not configured yet — running in offline demo mode. See <b>SETUP_README.txt</b> to enable real login, database and payments.";
  document.body.prepend(banner);
  return;
}'''

new = '''if (typeof firebaseConfig === "undefined" || firebaseConfig.apiKey.includes("PASTE")) {
  console.info("ShopNova backend: running in offline/demo mode. See SETUP_README.txt to enable a real backend.");
  return;
}'''

if old not in backend:
    if "console.info(\"ShopNova backend: running in offline" in backend:
        sys.exit("Hotfix already applied.")
    sys.exit("Could not find the banner code in backend.js (it may already be edited). No changes made.")

write("backend.js", backend.replace(old, new, 1))
print("Done! The banner is removed. Reload index.html with Ctrl+F5 — everything else keeps working as before.")