import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import "./Welcome.css";

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
}

function isIos() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

// Facebook, Instagram and TikTok open links in their own browser,
// and none of them can install an app.
function inAppBrowser() {
  return /FBAN|FBAV|FB_IAB|Instagram|TikTok|musical_ly/i.test(window.navigator.userAgent);
}

// Where they go next: adding their first product
function nextPath(site) {
  return site && site.businessType === "realestate"
    ? "/dashboard/properties"
    : "/dashboard/products";
}

export default function Welcome() {
  const navigate = useNavigate();
  const [site, setSite] = useState(null);
  const [error, setError] = useState("");

  // window.deferredInstallPrompt is saved early in src/index.js
  const [promptEvent, setPromptEvent] = useState(() => window.deferredInstallPrompt || null);
  const [installed, setInstalled] = useState(isStandalone());
  const [showSteps, setShowSteps] = useState(false);

  useEffect(() => {
    let cancelled = false;

    api
      .get("/sites/me")
      .then((res) => {
        if (!cancelled) setSite(res.site);
      })
      .catch((err) => {
        if (cancelled) return;
        if (err.status === 401) return navigate("/login");
        if (err.status === 404) return navigate("/setup");
        setError(err.message);
      });

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  useEffect(() => {
    function onPrompt(e) {
      e.preventDefault();
      window.deferredInstallPrompt = e;
      setPromptEvent(e);
    }
    function onInstalled() {
      window.deferredInstallPrompt = null;
      setPromptEvent(null);
      setInstalled(true);
    }

    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  // Once the app is added, carry on to the next step by themselves
  useEffect(() => {
    if (!installed || !site) return;
    const timer = setTimeout(() => navigate(nextPath(site)), 1200);
    return () => clearTimeout(timer);
  }, [installed, site, navigate]);

  async function handleInstall() {
    // Android / Chrome: one tap opens the real install popup
    if (promptEvent) {
      promptEvent.prompt();
      const { outcome } = await promptEvent.userChoice;
      window.deferredInstallPrompt = null;
      setPromptEvent(null);
      if (outcome === "accepted") setInstalled(true);
      return;
    }
    // iPhone and other browsers can't be prompted, so show the steps
    setShowSteps(true);
  }

  if (error) {
    return (
      <div className="wl-page">
        <div className="wl-card">
          <p className="wl-text">{error}</p>
          <button type="button" className="wl-btn" onClick={() => navigate("/dashboard")}>
            Go to my dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!site) {
    return (
      <div className="wl-page">
        <p className="wl-text">Loading...</p>
      </div>
    );
  }

  const next = nextPath(site);
  const ios = isIos();

  return (
    <div className="wl-page">
      <div className="wl-card">
        <p className="wl-emoji" aria-hidden="true">🎉</p>
        <h1 className="wl-title">Your website is ready!</h1>

        <div className="wl-live">
          <span className="wl-live-label">Your website is live</span>
          <span className="wl-live-url">{site.slug}.cbequicksite.com</span>
        </div>

        {installed ? (
          <p className="wl-done">App added. Taking you to your products...</p>
        ) : (
          <>
            <p className="wl-text">
              Add it to your phone, so you can add products and see your orders any time.
            </p>

            {inAppBrowser() ? (
              <p className="wl-note">
                To add the app, open cbequicksite.com in Chrome or Safari later.
              </p>
            ) : (
              <button type="button" className="wl-btn" onClick={handleInstall}>
                Add to my phone
              </button>
            )}

            <button type="button" className="wl-skip" onClick={() => navigate(next)}>
              Skip for now
            </button>
          </>
        )}
      </div>

      {showSteps &&
        createPortal(
          <div className="wl-overlay" onClick={() => setShowSteps(false)}>
            <div className="wl-sheet" onClick={(e) => e.stopPropagation()}>
              <h3 className="wl-sheet-title">Add to your home screen</h3>

              {ios ? (
                <ol className="wl-steps">
                  <li>Tap the <b>Share</b> button at the bottom of Safari</li>
                  <li>Scroll down and tap <b>Add to Home Screen</b></li>
                  <li>Tap <b>Add</b> at the top right</li>
                </ol>
              ) : (
                <ol className="wl-steps">
                  <li>Tap the <b>three dots</b> at the top of your browser</li>
                  <li>Tap <b>Install app</b> or <b>Add to Home screen</b></li>
                  <li>Tap <b>Install</b> or <b>Add</b> to finish</li>
                </ol>
              )}

              {/* iPhone can't tell us the app was added, so they tell us */}
              <button type="button" className="wl-btn" onClick={() => navigate(next)}>
                I've added it
              </button>
              <button type="button" className="wl-skip" onClick={() => setShowSteps(false)}>
                Close
              </button>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}