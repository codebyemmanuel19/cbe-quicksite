import { useEffect, useState } from "react";

// Three different phones, three different ways in:
//   Chrome on Android gives us a real install button
//   Other Android browsers need the menu steps
//   iPhone only allows this from Safari, never Chrome
export default function InstallCard() {
  const [prompt, setPrompt] = useState(null);
  const [hidden, setHidden] = useState(false);

  const ua = window.navigator.userAgent;
  const isIphone = /iphone|ipad|ipod/i.test(ua);

  // Already installed: running from the home screen, not the browser
  const installed =
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true;

  useEffect(() => {
    function onPrompt(e) {
      e.preventDefault(); // stop the browser showing its own bar
      setPrompt(e);
    }
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  // They closed it: remember that for this browser
  useEffect(() => {
    try {
      if (localStorage.getItem("hideInstallCard") === "yes") setHidden(true);
    } catch {
      // private browsing, never mind
    }
  }, []);

  function close() {
    setHidden(true);
    try {
      localStorage.setItem("hideInstallCard", "yes");
    } catch {
      // private browsing, never mind
    }
  }

  async function install() {
    if (!prompt) return;
    prompt.prompt();
    await prompt.userChoice;
    setPrompt(null);
    close();
  }

  if (installed || hidden) return null;

  return (
    <section className="install-card">
      <button className="install-close" onClick={close} aria-label="Close">✕</button>

      <p className="install-title">Put this on your phone</p>
      <p className="install-sub">
        Open your dashboard in one tap, like a normal app.
      </p>

      {prompt && (
        <button className="install-btn" onClick={install}>
          Add to home screen
        </button>
      )}

      {!prompt && isIphone && (
        <ol className="install-steps">
          <li>Make sure you are in <strong>Safari</strong>, not Chrome</li>
          <li>Tap the share button at the bottom of the screen</li>
          <li>Scroll down and tap <strong>Add to Home Screen</strong></li>
        </ol>
      )}

      {!prompt && !isIphone && (
        <ol className="install-steps">
          <li>Tap the three dots at the top of your browser</li>
          <li>Tap <strong>Add to Home screen</strong> or <strong>Install app</strong></li>
          <li>Tap <strong>Add</strong> to finish</li>
        </ol>
      )}
    </section>
  );
}