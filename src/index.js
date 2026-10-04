import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// A saved home screen app can hold on to an old version of the site.
// This checks what the server has now, and reloads once if it is different.
async function checkForNewBuild() {
  try {
    const res = await fetch("/asset-manifest.json", { cache: "no-store" });
    const data = await res.json();

    const latest = data.files && data.files["main.js"];
    const current = document.querySelector('script[src*="/static/js/main"]');
    if (!latest || !current) return;
    if (current.getAttribute("src") === latest) return;

    // Only once per new build, so it can never reload in a loop
    if (sessionStorage.getItem("build") === latest) return;
    sessionStorage.setItem("build", latest);
    window.location.reload();
  } catch {
    // Offline or blocked. Nothing to do.
  }
}

checkForNewBuild();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();