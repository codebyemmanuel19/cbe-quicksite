import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import "./InstallCard.css";

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
}

function isIos() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

function readHidden() {
  try {
    return localStorage.getItem("installHidden") === "1";
  } catch {
    return false;
  }
}

export default function InstallCard() {
  // window.deferredInstallPrompt is saved early in main.jsx, so the event
  // is not lost if it fired before this card appeared.
  const [promptEvent, setPromptEvent] = useState(() => window.deferredInstallPrompt || null);
  const [installed, setInstalled] = useState(isStandalone());
  const [hidden, setHidden] = useState(readHidden());
  const [showSteps, setShowSteps] = useState(false);

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

  if (installed || hidden) return null;

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

  function handleLater() {
    try {
      localStorage.setItem("installHidden", "1");
    } catch {
      // Storage blocked: it just comes back next visit
    }
    setHidden(true);
  }

  const ios = isIos();

  return (
    <>
      <section className="dl-card">
        <button type="button" className="dl-btn" onClick={handleInstall}>
          Download the App
        </button>
        <button type="button" className="dl-later" onClick={handleLater}>
          Maybe later
        </button>
      </section>

      {showSteps &&
        createPortal(
          <div className="dl-overlay" onClick={() => setShowSteps(false)}>
            <div className="dl-sheet" onClick={(e) => e.stopPropagation()}>
              <h3 className="dl-sheet-title">Add to your home screen</h3>

              {ios ? (
                <ol className="dl-steps">
                  <li>Tap the <b>Share</b> button at the bottom of Safari</li>
                  <li>Scroll down and tap <b>Add to Home Screen</b></li>
                  <li>Tap <b>Add</b> at the top right</li>
                </ol>
              ) : (
                <ol className="dl-steps">
                  <li>Tap the <b>three dots</b> at the top of your browser</li>
                  <li>Tap <b>Install app</b> or <b>Add to Home screen</b></li>
                  <li>Tap <b>Install</b> or <b>Add</b> to finish</li>
                </ol>
              )}

              <button type="button" className="dl-btn" onClick={() => setShowSteps(false)}>
                Got it
              </button>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}