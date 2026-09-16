function pdp(slug) {
  const p = findProduct(slug);
  if (!p) return `<section class="wrap"><h1>Not found</h1><a href="/products">Back to Products</a></section>`;
  const vId = new URLSearchParams(location.search).get("v") || p.variants[0].id;
  const v = p.variants.find((x) => x.id === vId) || p.variants[0];
  const related = catalogItems().filter((i) => i.product.category === p.category && i.product.slug !== p.slug).slice(0,4);
  const chips = ["Fast shipping","Same-day dispatch","Third-party tested","U.S. accredited labs","99%+ purity","HPLC verified"];
  return `<section class="wrap"><a class="back" href="/products">← Back to Products</a>
    <div class="pdp"><div class="photo"><a class="coa" href="/verify">VIEW COA</a><img src="${v.photo}" alt="${p.name}"></div>
    <div>
      <p class="kicker">Research Peptide</p>
      <h1>${p.name} (${v.strength})</h1>
      <p style="margin-top:12px">Research Grade · Third-Party Verified</p>
      <p class="mono">CAS: ${p.cas || "—"}<br>${p.formula || ""}<br>≥${v.purity || 99}% Pure</p>
      <p style="margin-top:24px;max-width:420px;line-height:1.6">${p.desc || ""}</p>
      ${p.variants.length > 1 ? `<p style="margin-top:28px;font-weight:500">Select Strength</p><div class="sizes">${p.variants.map((opt)=>`<button data-size="${opt.id}" class="${opt.id===v.id?"on":""}">${opt.strength}<br><small>${money(opt.price)}</small></button>`).join("")}</div>` : ""}
      <p style="margin-top:28px;font-weight:500">Quantity</p>
      <div class="qty"><div class="step"><button data-q="-">−</button><span id="qty">1</span><button data-q="+">+</button></div></div>
      <div class="pdp-total"><strong id="pdp-total">${money(v.price)}</strong><span>TOTAL</span></div>
      <button class="btn" id="add-pdp" data-id="${v.id}" data-price="${v.price}" style="width:100%;margin-top:16px">Add to Cart</button>
      ${payMarks()}
      <dl class="sku"><div><dt>Size</dt><dd>${v.strength}</dd></div><div><dt>SKU</dt><dd>${v.sku}</dd></div></dl>
      <div class="chips">${chips.map((c)=>`<span>${c}</span>`).join("")}</div>
    </div></div>
    <div class="research">
      <p class="kicker">Research</p>
      <h2>Research overview</h2>
      <h3>About this research material</h3>
      <p>${p.desc || ""}</p>
      <p>Supplied as a lyophilized reference for in-vitro and laboratory work only. Not for human or veterinary use.</p>
      <h3>Analytical characterization</h3>
      <p>Each lot is documented by reversed-phase HPLC for chromatographic purity and mass spectrometry for identity. Molecular weight ${p.mw || "—"}. Match the lot printed on the vial to the COA listed under Verify.</p>
      <p class="muted">Research use only. Not evaluated by the FDA.</p>
    </div>
    ${related.length ? `<h2 style="margin-top:64px">You Might Also Like</h2><div class="grid" style="margin-top:24px">${related.map(card).join("")}</div>` : ""}
  </section>`;
}
function simple(title, html) { return `<section class="wrap"><h1>${title}</h1><div style="max-width:640px;margin-top:24px;line-height:1.7">${html}</div></section>`; }
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
      <p class="logo">nueva</p>
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
      ${url ? `<button class="btn" id="pay-now" style="width:100%;margin-top:20px">Pay now</button>` : `<p class="muted">Shopify variants are not linked.</p>`}
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
  if (p === "/about") return simple("About", "<p>Nueva Research supplies research-grade peptides with HPLC/MS lot documentation. USA fulfilled. Research use only.</p>");
  if (p === "/contact") return simple("Contact", '<p>Email <a href="mailto:support@nuevaresearch.com">support@nuevaresearch.com</a>.</p>');
  if (p === "/wholesale") return simple("Wholesale", "<p>For laboratory procurement and volume fills, email support@nuevaresearch.com.</p>");
  if (p === "/verify") return simple("Verify / COA", "<p>Match the lot code on the vial to the COA listed on each product page.</p>");
  if (p === "/legal") return simple("Research disclaimer", "<p>All materials are sold strictly as laboratory research chemicals. Not for human or veterinary use.</p>");
  return simple("Page not found", '<p><a href="/">Go home</a></p>');
}
function renderChrome() { const host = $("#chrome"); if (host) host.innerHTML = chrome(); }
function renderGate() {
  if (!$("#gate")) return;
  if (sessionStorage.getItem(AGE_KEY) === "1") { $("#gate").innerHTML = ""; return; }
  $("#gate").innerHTML = `<div class="gate"><div class="panel">
    <div class="brand">nueva</div>
    <p class="sub">Research use only</p>
    <h2>Researcher verification</h2>
    <p class="muted" style="margin-top:16px;line-height:1.6">Nueva Research supplies peptides exclusively to qualified researchers and laboratories for in-vitro use.</p>
    <label><input type="checkbox" id="g1"> I confirm I am a qualified researcher purchasing for laboratory research only — not for human or veterinary use.</label>
    <label><input type="checkbox" id="g2"> I confirm I am 21 years of age or older.</label>
    <button class="btn" id="g-enter" disabled style="width:100%;margin-top:24px">Enter site →</button>
    <p class="muted" style="text-align:center;font-size:12px;margin-top:20px">Not evaluated by the FDA.</p>
  </div></div>`;
}
function openMenu() {
  $("#drawers").innerHTML = `<div class="drawer-bg" data-close></div><aside class="drawer left">
    <header><span class="logo">nueva</span><button data-close>${icon("x")}</button></header>
    <div class="body"><p><a href="/products">Products</a></p><p><a href="/about">About</a></p><p><a href="/verify">COAs</a></p><p><a href="/wholesale">Wholesale</a></p><p><a href="/contact">Contact</a></p></div>
  </aside>`;
}
function openCart() {
  const lines = loadCart();
  let body = "";
  if (!lines.length) body = `<div class="empty"><p><strong>Your cart is empty</strong></p><p class="muted">Add your favorite items to your cart.</p><a class="btn" href="/products" data-close>View Catalog</a></div>`;
  else {
    const total = lines.reduce((n, l) => { const hit = findVariant(l.id); return n + (hit ? hit.variant.price * l.qty : 0); }, 0);
    body = lines.map((l) => {
      const hit = findVariant(l.id); if (!hit) return "";
      return `<div class="line"><img src="${hit.variant.photo}" alt=""><div style="flex:1"><strong>${hit.product.name} (${hit.variant.strength})</strong>
        <div class="step" style="margin-top:8px;display:inline-flex;border:1px solid var(--line);border-radius:999px;height:32px">
          <button data-qty="${l.id}" data-n="${l.qty-1}">−</button><span style="padding:0 8px">${l.qty}</span><button data-qty="${l.id}" data-n="${l.qty+1}">+</button>
        </div></div><div>${money(hit.variant.price * l.qty)}</div></div>`;
    }).join("");
    const url = checkoutUrl();
    body += `<div class="sum" style="margin-top:16px"><span class="muted">Subtotal</span><strong>${money(total)}</strong></div>`;
    body += url ? `<a class="btn" style="width:100%;margin-top:16px" href="${url}">Checkout</a>` : `<p class="muted">Shopify not linked.</p>`;
    body += `<a class="btn ghost" style="width:100%;margin-top:8px" href="/checkout" data-close>Review order</a>`;
    body += payMarks();
  }
  $("#drawers").innerHTML = `<div class="drawer-bg" data-close></div><aside class="drawer right">
    <header><span>Your cart</span><button data-close>${icon("x")}</button></header>
    <div class="body">${body}</div></aside>`;
}
function render() {
  renderChrome();
  $("#app").innerHTML = pageHTML() + footer();
  renderGate();
  window.scrollTo(0, 0);
}
function go(href) { const url = new URL(href, location.origin); history.pushState({}, "", url.pathname + url.search); render(); }
document.addEventListener("click", (e) => {
  const a = e.target.closest("a");
  if (a && a.getAttribute("href") && a.getAttribute("href").startsWith("/") && !a.target) { e.preventDefault(); go(a.getAttribute("href")); }
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
    const el = $("#qty"); let n = Number(el.textContent);
    n = qbtn.dataset.q === "+" ? n + 1 : Math.max(1, n - 1);
    el.textContent = n;
    const btn = $("#add-pdp");
    if (btn) $("#pdp-total").textContent = money(Number(btn.dataset.price) * n);
  }
  if (e.target.id === "add-pdp") addToCart(e.target.dataset.id, Number($("#qty").textContent || 1));
  const qty = e.target.closest("[data-qty]");
  if (qty) { setQty(qty.dataset.qty, Number(qty.dataset.n)); if (path() === "/checkout") render(); else openCart(); }
  if (e.target.id === "g-enter") { sessionStorage.setItem(AGE_KEY, "1"); renderGate(); }
  if (e.target.id === "pay-now") {
    const email = ($("#ck-email") && $("#ck-email").value) || "";
    const url = checkoutUrl(email);
    if (url) location.assign(url);
  }
});
document.addEventListener("change", (e) => {
  if (e.target.id === "sort") { const p = new URLSearchParams(location.search); if (e.target.value === "popular") p.delete("sort"); else p.set("sort", e.target.value); go("/products" + (p.toString() ? "?" + p : "")); }
  if (e.target.id === "g1" || e.target.id === "g2") { const b = $("#g-enter"); if (b) b.disabled = !($("#g1") && $("#g1").checked && $("#g2") && $("#g2").checked); }
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
fetch("/js/catalog.json").then((r) => r.json()).then((d) => { DATA = d; render(); });
