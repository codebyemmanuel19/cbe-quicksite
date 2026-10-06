// Meta (Facebook) Pixel. It only runs on cbequicksite.com,
// never on a vendor's own shop address.
//
// Your Pixel ID from Meta Events Manager. It is not a secret.
const PIXEL_ID = "4473178182931578";

export function initPixel() {
  if (!PIXEL_ID || PIXEL_ID === "YOUR_PIXEL_ID" || window.fbq) return;

  /* eslint-disable */
  !function (f, b, e, v, n, t, s) {
    if (f.fbq) return;
    n = f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = !0;
    n.version = "2.0";
    n.queue = [];
    t = b.createElement(e);
    t.async = !0;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  }(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
  /* eslint-enable */

  window.fbq("init", PIXEL_ID);
  window.fbq("track", "PageView");
}

// track("CompleteRegistration"), track("Purchase", { value: 5000, currency: "NGN" })
export function track(event, data) {
  if (window.fbq) window.fbq("track", event, data);
}