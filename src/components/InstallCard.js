import { useEffect, useState } from "react";

// Chrome on Android lets us offer a real install button.
// iPhone does not, so there we show the three steps instead.
export default function InstallCard() {
  const [prompt, setPrompt] = useState(null);
  const [hidden, setHidden] = useState(false);

  const isIphone = /iphone|ipad|ipod/i.test(window.navigator.userAgent);

  // Already installed: running from the home screen, not the browser
  const installed =
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true;

  useEffect(() => {
    function onPrompt(e) {
      e.preventDefault(); // stop Chrome showing its own bar
      setPrompt(e);
    }
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  // They closed it: remember that for this browser
  useEffect(() => {
    if (localStorage.getItem("hideInstallCard") === "yes") setHidden(true);
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
  if (!prompt && !isIphone) return null; // nothing useful to offer

  return (
    <section className="install-card">
      <button className="install-close" onClick={close} aria-label="Close">✕</button>

      <p className="install-title">Put this on your phone</p>

      {isIphone ? (
        <p className="install-sub">
          Tap the share button at the bottom of Safari, then choose
          {" "}<strong>Add to Home Screen</strong>. It opens like a normal app.
        </p>
      ) : (
        <>
          <p className="install-sub">
            Open your dashboard in one tap, like a normal app.
          </p>
          <button className="install-btn" onClick={install}>
            Add to home screen
          </button>
        </>
      )}
    </section>
  );
}