const SHOP = "xk10qi-6m.myshopify.com";

exports.handler = async (event) => {
  const q = event.queryStringParameters || {};
  const items = q.items || "";
  if (!/^\d+:\d+(,\d+:\d+)*$/.test(items)) {
    return { statusCode: 400, body: "Missing cart items" };
  }
  const params = new URLSearchParams({ discount: q.discount || "BOGO" });
  if (q.email) params.set("checkout[email]", q.email);
  const target = `https://${SHOP}/cart/${items}?${params.toString()}`;
  const res = await fetch(target, {
    headers: {
      Accept: "application/json",
      "User-Agent": "NuevaCheckout/1.0",
    },
    redirect: "manual",
  });
  const loc = res.headers.get("location");
  if (!loc) {
    return { statusCode: 502, body: "Shopify checkout unavailable" };
  }
  return {
    statusCode: 302,
    headers: { Location: loc, "Cache-Control": "no-store" },
  };
};
