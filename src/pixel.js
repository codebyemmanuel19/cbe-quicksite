// Meta (Facebook) Pixel + TikTok Pixel. They only run on cbequicksite.com,
// never on a vendor's own shop address.
//
// Pixel IDs. They are not secrets.
const PIXEL_ID = "4473178182931578";
const TIKTOK_ID = "D913UO3C77UARCKAS790";

function initMeta() {
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

function initTikTok() {
  if (!TIKTOK_ID || window.ttq) return;

  /* eslint-disable */
  !function (w, d, t) {
    w.TiktokAnalyticsObject = t;
    var ttq = w[t] = w[t] || [];
    ttq.methods = ["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"];
    ttq.setAndDefer = function (t, e) {
      t[e] = function () {
        t.push([e].concat(Array.prototype.slice.call(arguments, 0)));
      };
    };
    for (var i = 0; i < ttq.methods.length; i++) ttq.setAndDefer(ttq, ttq.methods[i]);
    ttq.instance = function (t) {
      for (var e = ttq._i[t] || [], n = 0; n < ttq.methods.length; n++) ttq.setAndDefer(e, ttq.methods[n]);
      return e;
    };
    ttq.load = function (e, n) {
      var r = "https://analytics.tiktok.com/i18n/pixel/events.js";
      ttq._i = ttq._i || {};
      ttq._i[e] = [];
      ttq._i[e]._u = r;
      ttq._t = ttq._t || {};
      ttq._t[e] = +new Date();
      ttq._o = ttq._o || {};
      ttq._o[e] = n || {};
      n = document.createElement("script");
      n.type = "text/javascript";
      n.async = !0;
      n.src = r + "?sdkid=" + e + "&lib=" + t;
      e = document.getElementsByTagName("script")[0];
      e.parentNode.insertBefore(n, e);
    };
    ttq.load(TIKTOK_ID);
    ttq.page();
  }(window, document, "ttq");
  /* eslint-enable */
}

export function initPixel() {
  initMeta();
  initTikTok();
}

// track("CompleteRegistration"), track("Purchase", { value: 5000, currency: "NGN" })
export function track(event, data) {
  if (window.fbq) window.fbq("track", event, data);

  if (window.ttq) {
    // TikTok conversion "Signup" looks for status = signup
    const tiktokData =
      event === "CompleteRegistration" ? { status: "signup", ...data } : data;
    window.ttq.track(event, tiktokData);
  }
}