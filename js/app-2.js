function pdp(slug) {
  const p = findProduct(slug);
  if (!p) return `<section class="wrap"><h1>Not found</h1><a href="/products">Back to Products</a></section>`;
  const vId = new URLSearchParams(location.search).get("v") || p.variants[0].id;
  const v = p.variants.find((x) => x.id === vId) || p.variants[0];
  const dose = (v.strength || "").replace(/\s+/g, "");
  const coaPdf = variantCoa(v.id);
  const coaImg = variantCoaImg(v.id);
  const strength = p.variants.length > 1
    ? p.variants.map((opt)=>`<button type="button" data-size="${opt.id}" class="strength ${opt.id===v.id?"on":""}">${opt.strength.replace(/\s+/g,"")} <span class="bogo-pill">BOGO</span></button>`).join("")
    : `<button type="button" class="strength on">Standard <span class="bogo-pill">BOGO</span></button>`;
  return `<main class="amino-pdp">
    <div class="amino-gallery">
      <div class="amino-well"><span class="amino-sale">-15%</span><img id="pdp-hero" src="${v.photo}" alt="${p.name} ${v.strength}"></div>
      <div class="amino-thumbs">
        <button type="button" class="on" data-hero="${v.photo}"><img src="${v.photo}" alt=""></button>
        ${coaImg ? `<button type="button" data-coa data-hero="${coaImg}"><img src="${coaImg}" alt="COA" class="coa-thumb"></button>` : ""}
      </div>
    </div>
    <div class="amino-buy">
      <div class="amino-buy-head"><p class="amino-kicker">Research Peptide</p></div>
      <h1 class="amino-title">${p.name} (${dose})</h1>
      <div class="amino-verified">Research Grade · Third-Party Verified</div>
      <div class="amino-chips"><span>CAS: ${p.cas || "—"}</span><span>${p.formula || ""}</span><span class="pure">≥${Math.floor(v.purity || 99)}% Pure</span></div>
      <p class="amino-short">${p.name} Research Kit.</p>
      <div class="bogo-banner"><strong>Buy 1 Get 1 FREE!</strong><p>Every vial you order automatically ships with a second vial FREE.</p></div>
      <form class="add-to-cart-form" id="add-to-cart-form">
        <div class="amino-field"><p>Select Strength</p><div class="amino-strength">${strength}</div></div>
        <p class="amino-price">${money(v.price)}<small>per vial</small><s class="was">${money(compareAt(v.price))}</s></p>
        <p class="bogo-copy">Buy 1, get 1 free — every vial you order automatically ships with a second vial FREE.</p>
        <div class="amino-field"><p>Quantity</p>
          <div class="amino-qty"><button type="button" class="qty-btn" data-q="-">-</button><span id="qty">1</span><button type="button" class="qty-btn" data-q="+">+</button></div>
        </div>
        <div class="amino-total"><div><strong>We'll ship you 2 vials</strong><span>You pay for 1 — 1 ships free</span><em class="amino-save">You save ${money(v.price)}</em></div><div class="amino-total-price">${money(v.price)}<small>TOTAL</small></div></div>
        <button type="submit" class="amino-atc" id="add-pdp" data-id="${v.id}" data-price="${v.price}">Add to Cart</button>
        ${coaPdf ? `<button type="button" class="amino-coa" data-coa>View Certificate of Analysis (COA)</button>` : ""}
      </form>
    </div>
  </main>
  <div id="coa-modal" class="modal-overlay" style="display:none"><div class="modal-content"><div class="modal-header"><h2>Certificate of Analysis (COA)</h2><button class="close-modal" type="button">&times;</button></div><div class="modal-body">${coaImg ? `<img src="${coaImg}" class="coa-image" alt="Certificate of Analysis">` : ""}${coaPdf ? `<a class="coa-download" href="${coaPdf}" download>Download COA PDF ↓</a>` : ""}</div></div></div>`;
}
function simple(title, html) { return `<section class="wrap"><h1>${title}</h1><div style="max-width:640px;margin-top:24px;line-height:1.7">${html}</div></section>`; }
function checkoutHop() {
  return `<section class="wrap" style="text-align:center;padding:4.5rem 1.2rem">
    <h1>Taking you to secure checkout…</h1>
    <p class="muted" style="margin-top:10px">Shopify Checkout · BOGO applied automatically.</p>
    <p style="margin-top:1.5rem"><a class="btn" id="checkout-continue" href="#">Continue to checkout</a></p>
  </section>`;
}
function shopifyPayUrl(email) {
  const p = path();
  if (p.startsWith("/cart/")) {
    const items = decodeURIComponent(p.slice(6).split("/")[0]).replace(/[^\d:,]/g, "");
    if (/^\d+:\d+(,\d+:\d+)*$/.test(items)) {
      const params = new URLSearchParams({ items, discount: "BOGO" });
      if (email) params.set("email", email);
      return "/.netlify/functions/checkout?" + params.toString();
    }
  }
  return checkoutUrl(email);
}
function checkoutPage() {
  const lines = loadCart();
  if (!lines.length) return `<section class="wrap" style="max-width:640px;text-align:center"><h1>Your cart is empty</h1><p class="muted">Add your favorite items to your cart.</p><a class="btn" href="/products" style="margin-top:24px">View Catalog</a></section>`;
  const rows = lines.map((l) => {
    const hit = findVariant(l.id); if (!hit) return "";
    return `<div class="line"><img src="${hit.variant.photo}" alt=""><div style="flex:1"><strong>${hit.product.name} (${hit.variant.strength})</strong>
      <div class="step" style="margin-top:8px;display:inline-flex;border:1px solid var(--line);border-radius:999px;height:28px">
        <button data-qty="${l.id}" data-n="${l.qty-1}">−</button><span style="padding:0 8px">${l.qty}</span><button data-qty="${l.id}" data-n="${l.qty+1}">+</button>
      </div></div><div>${money(hit.variant.price * l.qty)}</div></div>`;
  }).join("");
  const total = lines.reduce((n, l) => { const hit = findVariant(l.id); return n + (hit ? hit.variant.price * l.qty : 0); }, 0);
  const url = checkoutUrl();
  return `<section class="check wrap">
    <div>
      <p class="logo"><img src="/img/nueva-mark.svg?v=2" alt="NUEVA"></p>
      <h1>Checkout</h1>
      <p class="muted">Payment is completed on Shopify Checkout. Card data never touches this site.</p>
      <h3>Contact</h3>
      <input id="ck-email" type="email" placeholder="Email">
      <h3>Delivery</h3>
      <div class="two"><input placeholder="First name"><input placeholder="Last name"></div>
      <input value="United States" placeholder="Country / region">
      <p class="muted">Address, shipping method and tax are collected on the next step.</p>
      <h3>Shipping method</h3>
      <div class="ship">Standard · 2–5 business days <span class="muted">Calculated next</span></div>
      <h3>Payment</h3>
      ${payMarks()}
      ${url ? `<a class="btn" id="pay-now" href="${url}" style="width:100%;margin-top:20px">Pay now</a>` : `<p class="muted">Shopify variants are not linked.</p>`}
      <p class="muted" style="text-align:center;font-size:12px;margin-top:12px">Secure checkout on Shopify. Research use only.</p>
    </div>
    <aside class="summary">
      <h3>Order summary</h3>
      ${rows}
      <div class="sum"><span class="muted">Subtotal</span><span>${money(total)}</span></div>
      <div class="sum"><span class="muted">Shipping</span><span class="muted">Calculated next</span></div>
      <div class="sum total"><span>Total</span><span>${money(total)} USD</span></div>
    </aside>
  </section>`;
}
function pageHTML() {
  const p = path();
  if (p === "/") return home();
  if (p === "/products" || p === "/catalog") return productsPage();
  if (p.startsWith("/products/")) return pdp(p.split("/")[2]);
  if (p === "/checkout") return checkoutPage();
  if (p.startsWith("/cart/") || p.startsWith("/checkouts/")) return checkoutHop();
  if (p === "/about") return simple("About", "<p>Nueva Research supplies research-grade peptides with HPLC/MS lot documentation. USA fulfilled. Research use only.</p>");
  if (p === "/contact") return simple("Contact", '<p>Email <a href="mailto:support@nuevaresearch.com">support@nuevaresearch.com</a>.</p>');
  if (p === "/wholesale") return simple("Wholesale", "<p>For laboratory procurement and volume fills, email support@nuevaresearch.com.</p>");
  if (p === "/verify") return simple("Verify / COA", "<p>Match the lot code on the vial to the COA listed on each product page.</p>");
  if (p === "/legal") return simple("Research disclaimer", "<p>All materials are sold strictly as laboratory research chemicals. Not for human or veterinary use.</p>");
  return simple("Page not found", '<p><a href="/">Go home</a></p>');
}
function renderChrome() { const host = $("#chrome"); if (host) host.innerHTML = chrome(); }
function openMenu() {
  $("#drawers").innerHTML = `<div class="drawer-bg" data-close></div><aside class="drawer left">
    <header><img src="/img/nueva-mark.svg?v=2" alt="NUEVA" style="height:28px"><button data-close>${icon("x")}</button></header>
    <div class="body"><p><a href="/products">Products</a></p><p><a href="/about">About</a></p><p><a href="/verify">COAs</a></p><p><a href="/wholesale">Wholesale</a></p><p><a href="/contact">Contact</a></p></div>
  </aside>`;
}
let cartProtect = true;
let cartSkip = false;
const UPSELL_PAIRS = {
  tirzepatide: ["bac-water-10ml", "nad-100mg", "tesamorelin-10mg"],
  tesamorelin: ["bac-water-10ml", "tesa-ipa-14mg", "ghk-cu-50mg"],
  "tesamorelin-ipamorelin": ["bac-water-10ml", "tesamorelin-10mg"],
  "bpc-157": ["tb-500-10mg", "bpc-tb-20mg", "bac-water-10ml"],
  "tb-500": ["bpc-157-10mg", "ghk-cu-50mg", "bac-water-10ml"],
  "bpc-157-tb-500-blend": ["ghk-cu-50mg", "klow-80mg", "bac-water-10ml"],
  klow: ["bac-water-10ml", "bpc-157-10mg"],
  "glow-blend": ["bac-water-10ml", "ghk-cu-50mg"],
  "ghk-cu": ["bpc-157-10mg", "tb-500-10mg", "bac-water-10ml"],
  semax: ["selank-10mg", "pinealon-10mg"],
  selank: ["semax-10mg", "epitalon-50mg"],
  epitalon: ["pinealon-10mg", "semax-10mg"],
  pinealon: ["epitalon-50mg", "selank-10mg"],
  nad: ["tirzepatide-10mg", "bac-water-10ml"],
  "slu-pp-332": ["tirzepatide-10mg", "nad-100mg"],
  "thymosin-alpha-1": ["bpc-157-10mg", "bac-water-10ml"],
  "bacteriostatic-water": ["ghk-cu-50mg", "bpc-157-10mg"]
};
const UPSELL_FALLBACK = ["bac-water-10ml", "ghk-cu-50mg", "bpc-157-10mg", "semax-10mg", "tesamorelin-10mg", "tb-500-10mg"];
function cartUpsells(lineIds, limit) {
  const inCart = new Set(lineIds);
  const slugs = lineIds.map((id) => { const h = findVariant(id); return h && h.product.slug; }).filter(Boolean);
  const ranked = [];
  const push = (id) => { if (!inCart.has(id) && ranked.indexOf(id) < 0) ranked.push(id); };
  if (slugs.some((s) => s !== "bacteriostatic-water")) push("bac-water-10ml");
  slugs.forEach((slug) => (UPSELL_PAIRS[slug] || []).forEach(push));
  UPSELL_FALLBACK.forEach(push);
  return ranked.map(findVariant).filter(Boolean).slice(0, limit || 2);
}
function icoShield() {
  return `<svg class="cart-ico" viewBox="0 0 32 32" aria-hidden="true"><path fill="#1e3a5f" d="M16 2.5 28 7v9.2c0 7.1-5.1 13.2-12 14.8C9.1 29.4 4 23.3 4 16.2V7l12-4.5Z"/><path fill="#c2410c" d="M16 5.2 24.5 8.4v7.4c0 5-3.5 9.3-8.5 10.5-5-1.2-8.5-5.5-8.5-10.5V8.4L16 5.2Z"/><path fill="#fbbf24" d="M16 11.2 18.1 16h4.2L18.9 18.7 20.4 24 16 20.9 11.6 24l1.5-5.3L9.7 16h4.2L16 11.2Z"/></svg>`;
}
function icoBolt() {
  return `<svg class="cart-ico" viewBox="0 0 32 32" aria-hidden="true"><path fill="#fbbf24" d="M18.2 3 8 18.2h7.1L12.4 29 24.8 12.4h-7.4L18.2 3Z"/><path fill="#f59e0b" d="M18.2 3 14.8 12.4h7.4L18 18.2h-2.9L18.2 3Z"/></svg>`;
}
function icoTag() {
  return `<svg class="cart-ico-line" viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="#9ca3af" stroke-width="1.8" stroke-linejoin="round" d="M20 13.4 12.4 21a2 2 0 0 1-2.8 0L3 14.4V4h10.4l6.6 6.6a2 2 0 0 1 0 2.8Z"/><circle cx="8.2" cy="8.2" r="1.3" fill="#9ca3af"/></svg>`;
}
function payApple() {
  return `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M16.4 12.6c0-2.4 2-3.6 2.1-3.7-1.1-1.7-2.9-1.9-3.5-1.9-1.5-.2-2.9.9-3.6.9-.8 0-1.9-.9-3.2-.8-1.6 0-3.1 1-3.9 2.5-1.7 2.9-.4 7.3 1.2 9.7.8 1.2 1.7 2.5 3 2.4 1.2 0 1.6-.8 3.1-.8s1.8.8 3.2.7c1.3 0 2.1-1.2 2.9-2.4.9-1.3 1.3-2.6 1.3-2.6s-2.5-1-2.6-3.9Zm-2.4-7c.7-.8 1.1-2 1-3.1-1 .1-2.2.7-2.9 1.5-.6.7-1.2 1.9-1 3 1.1.1 2.2-.5 2.9-1.4Z"/></svg>`;
}
function payGoogle() {
  return `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M21.6 12.2c0-.8-.1-1.6-.2-2.3H12v4.4h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.6Z"/><path fill="#34A853" d="M12 22c2.7 0 5-0.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22Z"/><path fill="#FBBC05" d="M6.4 13.9a6 6 0 0 1 0-3.8V7.5H3.1a10 10 0 0 0 0 9l3.3-2.6Z"/><path fill="#EA4335" d="M12 5.9c1.5 0 2.8.5 3.8 1.5l2.9-2.9C16.9 2.9 14.7 2 12 2A10 10 0 0 0 3.1 7.5l3.3 2.6C7.2 7.7 9.4 5.9 12 5.9Z"/></svg>`;
}
function openCart() {
  const lines = loadCart();
  const FREE_BAC = 155, FREE_SHIP = 250, PROTECT = 4.99, SKIP = 4.99;
  let body = "";
  let foot = "";
  if (!lines.length) body = `<div class="empty"><p><strong>Your cart is empty</strong></p><p class="muted">Add your favorite items to your cart.</p><a class="btn" href="/products" data-close>View Catalog</a></div>`;
  else {
    const paid = lines.reduce((n, l) => { const hit = findVariant(l.id); return n + (hit ? hit.variant.price * l.qty : 0); }, 0);
    const saved = lines.reduce((n, l) => {
      const hit = findVariant(l.id); if (!hit) return n;
      return n + compareAt(hit.variant.price) * shipQty(l.qty) - hit.variant.price * l.qty;
    }, 0);
    const upsells = cartUpsells(lines.map((l) => l.id), 2);
    body = lines.map((l) => {
      const hit = findVariant(l.id); if (!hit) return "";
      const strike = compareAt(hit.variant.price) * shipQty(l.qty);
      return `<article class="cart-line"><img src="${hit.variant.photo}" alt="">
        <div class="cart-line-info"><p class="cart-line-name">${hit.product.name} — ${hit.variant.strength}</p>
          <div class="cart-qty"><button data-qty="${l.id}" data-n="${l.qty-1}">−</button><span>${l.qty}</span><button data-qty="${l.id}" data-n="${l.qty+1}">+</button></div>
        </div>
        <div class="cart-line-price"><strong>${money(hit.variant.price * l.qty)}</strong><s>${money(strike)}</s>
          <button class="cart-remove" data-qty="${l.id}" data-n="0">×</button></div>
      </article>`;
    }).join("");
    body += `<label class="cart-addon ${cartProtect ? "on" : ""}"><input type="checkbox" id="cart-protect" ${cartProtect ? "checked" : ""}>${icoShield()}<span><b>Shipping protection</b><small>Covers loss, theft & damage in transit</small></span><em>+${money(PROTECT)}</em></label>`;
    body += `<label class="cart-addon ${cartSkip ? "on" : ""}"><input type="checkbox" id="cart-skip" ${cartSkip ? "checked" : ""}>${icoBolt()}<span><b>Skip the line</b><small>Your order is packed first</small></span><em>+${money(SKIP)}</em></label>`;
    if (upsells.length) {
      body += `<div class="cart-upsell-list"><p class="cart-upsell-label">You may also like</p>` +
        upsells.map((item) => `<article class="cart-upsell"><img src="${item.variant.photo}" alt=""><div><p>${item.product.name}</p><small>${item.variant.strength}</small></div><div class="cart-upsell-price"><s>${money(compareAt(item.variant.price))}</s><strong>${money(item.variant.price)}</strong></div><button data-add="${item.variant.id}">Add</button></article>`).join("") +
        `</div>`;
    }
    const total = paid + (cartProtect ? PROTECT : 0) + (cartSkip ? SKIP : 0);
    const url = checkoutUrl();
    const bacLeft = Math.max(0, FREE_BAC - paid);
    const shipLeft = Math.max(0, FREE_SHIP - paid);
    foot = `<footer class="cart-foot">
      <label class="cart-promo">${icoTag()}<input placeholder="Add promo code"></label>
      <div class="cart-bar"><p><span class="cart-gift">🎁</span> Free BAC Water <span>${bacLeft ? money(bacLeft) + " away" : "Unlocked"}</span></p><i><b style="width:${Math.min(100, paid / FREE_BAC * 100)}%"></b></i></div>
      <div class="cart-bar ship"><p>Free shipping <span>${shipLeft ? money(shipLeft) + " away" : "Unlocked"}</span></p><i><b style="width:${Math.min(100, paid / FREE_SHIP * 100)}%"></b></i></div>
      <div class="cart-sub"><span>Subtotal</span><strong>${money(total)}</strong></div>
      <p class="cart-tax">Shipping & taxes calculated at checkout</p>
      <p class="cart-saved">You saved ${money(saved)} · Earn ${Math.round(total * 10)} points</p>
      <div class="cart-pays">
        ${url ? `<a class="pay-apple" href="${url}">${payApple()}Pay</a>
        <a class="pay-google" href="${url}">${payGoogle()}Pay</a>
        <a class="pay-paypal" href="${url}">Pay<span>Pal</span></a>
        <a class="pay-checkout" href="${url}">Checkout</a>` : `<a class="pay-checkout" href="/checkout">Checkout</a>`}
      </div>
      <a class="cart-full" href="/checkout" data-close>View full cart →</a>
    </footer>`;
  }
  $("#drawers").innerHTML = `<div class="drawer-bg" data-close></div><aside class="cart-drawer">
    <header class="cart-head"><h3>Your cart${lines.length ? `<span>${lines.reduce((n, l) => n + l.qty, 0)}</span>` : ""}</h3><button data-close>${icon("x")}</button></header>
    <div class="cart-body">${body}</div>${foot}</aside>`;
}
function render() {
  renderChrome();
  $("#app").innerHTML = pageHTML() + footer();
  window.scrollTo(0, 0);
  const hop = shopifyPayUrl();
  if ((path().startsWith("/cart/") || path().startsWith("/checkouts/")) && hop) {
    const btn = $("#checkout-continue");
    if (btn) btn.setAttribute("href", hop);
    location.replace(hop);
  }
}
function go(href) { const url = new URL(href, location.origin); history.pushState({}, "", url.pathname + url.search); render(); }
function isAppRoute(href) {
  if (!href || !href.startsWith("/") || href.startsWith("//")) return false;
  if (href.startsWith("/.netlify/") || href.startsWith("/api/") || href.startsWith("/coa/")) return false;
  return true;
}
document.addEventListener("click", (e) => {
  const a = e.target.closest("a");
  if (a && isAppRoute(a.getAttribute("href")) && !a.target) { e.preventDefault(); go(a.getAttribute("href")); }
  const add = e.target.closest("[data-add]");
  if (add) { e.preventDefault(); addToCart(add.dataset.add, 1); }
  const act = e.target.closest("[data-act]");
  if (act) {
    if (act.dataset.act === "menu") openMenu();
    if (act.dataset.act === "cart") openCart();
    if (act.dataset.act === "search") { const d = $("#search-drop"); d.hidden = !d.hidden; if (!d.hidden) $("#header-q").focus(); }
  }
  if (e.target.closest("[data-close]")) $("#drawers").innerHTML = "";
  const fmt = e.target.closest("[data-format]");
  if (fmt) { const p = new URLSearchParams(location.search); if (fmt.dataset.format === "all") p.delete("format"); else p.set("format", fmt.dataset.format); go("/products" + (p.toString() ? "?" + p : "")); }
  const size = e.target.closest("[data-size]");
  if (size) go("/products/" + path().split("/")[2] + "?v=" + size.dataset.size);
  const qbtn = e.target.closest("[data-q]");
  if (qbtn) {
    const el = $("#quantity") || $("#qty");
    let n = Number(el.value || el.textContent);
    n = qbtn.dataset.q === "+" ? n + 1 : Math.max(1, n - 1);
    if (el.value !== undefined) el.value = n; else el.textContent = n;
    const btn = $("#add-pdp");
    if (btn) btn.textContent = "Add to Cart - " + money(Number(btn.dataset.price) * n);
  }
  if (e.target.id === "add-pdp") {
    e.preventDefault();
    addToCart(e.target.dataset.id, Number(($("#quantity") || $("#qty")).value || $("#qty") && $("#qty").textContent || 1));
  }
  const qty = e.target.closest("[data-qty]");
  if (qty) { setQty(qty.dataset.qty, Number(qty.dataset.n)); if (path() === "/checkout") render(); else openCart(); }
  if (e.target.id === "pay-now" || e.target.closest("#pay-now") || e.target.id === "checkout-continue") {
    const email = ($("#ck-email") && $("#ck-email").value) || "";
    const url = shopifyPayUrl(email) || checkoutUrl(email);
    if (url) {
      e.preventDefault();
      location.assign(url);
    }
  }
});
document.addEventListener("change", (e) => {
  if (e.target.id === "sort") { const p = new URLSearchParams(location.search); if (e.target.value === "popular") p.delete("sort"); else p.set("sort", e.target.value); go("/products" + (p.toString() ? "?" + p : "")); }
  if (e.target.id === "cart-protect") { cartProtect = e.target.checked; openCart(); }
  if (e.target.id === "cart-skip") { cartSkip = e.target.checked; openCart(); }
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && (e.target.id === "q" || e.target.id === "header-q")) {
    e.preventDefault();
    const p = new URLSearchParams(location.search);
    const v = e.target.value.trim();
    if (v) p.set("q", v); else p.delete("q");
    go("/products" + (p.toString() ? "?" + p : ""));
  }
});
window.addEventListener("popstate", render);
document.addEventListener("submit", (e) => {
  if (e.target.id === "add-to-cart-form") {
    e.preventDefault();
    const btn = $("#add-pdp");
    const el = $("#qty") || $("#quantity");
    const n = Number((el && (el.value || el.textContent)) || 1);
    if (btn) addToCart(btn.dataset.id, n);
  }
});
document.addEventListener("click", (e2) => {
  const thumb = e2.target.closest(".amino-thumbs button");
  if (thumb && thumb.dataset.hero) {
    const hero = $("#pdp-hero");
    if (hero) hero.src = thumb.dataset.hero;
    document.querySelectorAll(".amino-thumbs button").forEach((b) => b.classList.toggle("on", b === thumb));
  }
  if (e2.target.closest("[data-coa]")) { const m = $("#coa-modal"); if (m) m.style.display = "flex"; }
  if (e2.target.classList && (e2.target.classList.contains("close-modal") || e2.target.id === "coa-modal")) {
    const m = $("#coa-modal"); if (m) m.style.display = "none";
  }
});
fetch("/js/catalog.json").then((r) => r.json()).then((d) => { DATA = d; render(); });
