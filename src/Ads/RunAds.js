import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { ListSkeleton } from "../components/Skeleton";
import "../RealEstateSite/dashboard/dashboard.css";
import "./RunAds.css";

const WHATSAPP = "2349027090880";
const FEE = 2900; // our fee for setting up one campaign
const TYPES = [
  "Fashion & clothing",
  "Beauty & skincare",
  "Hair",
  "Perfume",
  "Jewellery",
  "Bags & shoes",
  "Gadgets",
  "Furniture",
  "Food & restaurant",
  "Real estate",
  "Cars",
];
const BUDGETS = [2000, 3000, 5000, 10000];
const BUDGET_LABEL = {
  2000: "Good to test",
  3000: "Popular",
  5000: "More reach",
  10000: "Serious push",
};
// The business type the vendor picked at setup, in the words used here
const TYPE_LABEL = {
  clothing: "Fashion & clothing",
  skincare: "Beauty & skincare",
  hair: "Hair",
  perfume: "Perfume",
  jewellery: "Jewellery",
  bags: "Bags & shoes",
  gadgets: "Gadgets",
  furniture: "Furniture",
  restaurant: "Food & restaurant",
  realestate: "Real estate",
  cars: "Cars",
};
const MODES = [
  { id: "one", title: "One state", sub: "Best for reaching customers you can deliver to", rec: true },
  { id: "cities", title: "Lagos + Abuja + Port Harcourt", sub: "Reach the 3 main cities" },
  { id: "all", title: "All Nigeria", sub: "Widest reach, best if you deliver nationwide" },
  { id: "pick", title: "Choose several states", sub: "Pick exactly where you want" },
];

// Lagos, Abuja (FCT) and Rivers (Port Harcourt), as they are named in the state list
function cityList(all) {
  return [/lagos/i, /abuja|fct/i, /rivers/i].map((r) => all.find((s) => r.test(s))).filter(Boolean);
}

function guessMode(selected, all) {
  if (selected.length === 0 || selected.length === 1) return "one";
  if (all.length > 0 && selected.length === all.length) return "all";
  const cities = cityList(all);
  if (cities.length > 0 && selected.length === cities.length && cities.every((c) => selected.includes(c))) return "cities";
  return "pick";
}
const DURATIONS = [3, 7, 14, 30];
const STATUS_TEXT = {
  submitted: "Received",
  setup: "Setting up",
  running: "Running",
  done: "Finished",
  cancelled: "Cancelled",
};

function naira(n) {
  return "₦" + Number(n || 0).toLocaleString("en-NG");
}

const blank = {
  businessType: "",
  states: [],
  dailyBudget: 0,
  durationDays: 7,
  goal: "visits",
  promote: "",
  link: "",
  whatsapp: "",
  notes: "",
};

// Route: /dashboard/ads
export default function RunAds() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1); // 1 campaign, 2 ad details, 3 sent
  const [form, setForm] = useState(blank);
  const [states, setStates] = useState([]);
  const [requests, setRequests] = useState([]);
  const [siteUrl, setSiteUrl] = useState("");
  const [search, setSearch] = useState("");
  const [custom, setCustom] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [sent, setSent] = useState(null);
  const [agreed, setAgreed] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [mode, setMode] = useState("one");
  const [changeType, setChangeType] = useState(false);
  const [siteType, setSiteType] = useState("");
  const toastTimer = useRef(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [mine, ads] = await Promise.all([api.get("/sites/me"), api.get("/ads")]);
        if (cancelled) return;
        const site = mine.site;
        const d = ads.draft;
        setSiteUrl(site.url || "");
        setStates(ads.states || []);
        setRequests(ads.requests || []);
        const typeName = TYPE_LABEL[site.businessType] || "";
        setSiteType(typeName);
        setMode(guessMode((d && d.states) || [], ads.states || []));
        setForm({
          ...blank,
          ...(d || {}),
          businessType: (d && d.businessType) || typeName,
          link: (d && d.link) || site.url || "",
        });
        if (d && d.dailyBudget && !BUDGETS.includes(d.dailyBudget)) setCustom(String(d.dailyBudget));
      } catch (err) {
        if (cancelled) return;
        if (err.status === 401) return navigate("/login");
        if (err.status === 404 || err.status === 400) return navigate("/setup");
        setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));
  const total = (Number(form.dailyBudget) || 0) * form.durationDays;

  function say(msg) {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 2500);
  }

  function toggleState(s) {
    if (mode === "one") return set("states", form.states.includes(s) ? [] : [s]);
    set("states", form.states.includes(s) ? form.states.filter((x) => x !== s) : [...form.states, s]);
  }

  function chooseMode(id) {
    setMode(id);
    if (id === "cities") set("states", cityList(states));
    else if (id === "all") set("states", [...states]);
    else if (id === "one") set("states", form.states.slice(0, 1));
  }

  function pickBudget(n) {
    setCustom("");
    set("dailyBudget", n);
  }

  function typeBudget(v) {
    const digits = v.replace(/\D/g, "").slice(0, 7);
    setCustom(digits);
    set("dailyBudget", Number(digits) || 0);
  }

  async function saveDraft(silent) {
    setError("");
    try {
      await api.put("/ads/draft", form);
      if (!silent) say("Draft saved. You can continue later.");
      return true;
    } catch (err) {
      if (err.status === 401) navigate("/login");
      else setError(err.message);
      return false;
    }
  }

  async function onDraft() {
    setBusy(true);
    await saveDraft(false);
    setBusy(false);
  }

  async function toDetails() {
    setError("");
    if (!form.businessType.trim()) return setError("Tell us what type of business you run.");
    if (!form.states.length) return setError("Select at least one state to run your ads in.");
    if (form.dailyBudget < 1000) return setError("Daily budget starts from ₦1,000.");
    setBusy(true);
    const ok = await saveDraft(true);
    setBusy(false);
    if (ok) {
      setStep(2);
      window.scrollTo({ top: 0 });
    }
  }

  async function submit() {
    setError("");
    if (form.whatsapp.replace(/\D/g, "").length < 10) {
      return setError("Enter the WhatsApp number where customers will message you.");
    }
    if (!agreed) return setError("Please tick the box to confirm you understand.");
    setBusy(true);
    try {
      const res = await api.post("/ads/submit", { ...form, agreed });
      setSent(res.request);
      setRequests((r) => [res.request, ...r]);
      setStep(3);
      window.scrollTo({ top: 0 });
    } catch (err) {
      if (err.status === 401) return navigate("/login");
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  function startNew() {
    setForm({ ...blank, businessType: siteType, link: siteUrl });
    setMode("one");
    setChangeType(false);
    setCustom("");
    setSent(null);
    setAgreed(false);
    setStep(1);
  }

  if (loading) return <div className="rd"><ListSkeleton rows={4} /></div>;

  const shownStates = states.filter((s) => s.toLowerCase().includes(search.trim().toLowerCase()));
  const allSelected = states.length > 0 && form.states.length === states.length;

  // Step 3: sent
  if (step === 3 && sent) {
    const msg =
      `Hi, I just sent an ad request on CBE QuickSite.\n` +
      `Business: ${sent.businessType}\n` +
      `States: ${sent.states.length === states.length ? "All states" : sent.states.join(", ")}\n` +
      `Budget: ${naira(sent.dailyBudget)}/day for ${sent.durationDays} days`;
    return (
      <div className="rd ra">
        <div className="ra-done">
          <div className="ra-check">✓</div>
          <h1>Request sent</h1>
          <p>We received your ad request. Message us on WhatsApp now. We will send the payment details for the ₦2,900 setup fee and start.</p>
          <a className="rd-btn" href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`} target="_blank" rel="noreferrer">
            Message us on WhatsApp
          </a>
        </div>

        <section className="ra-card">
          <h2>Get ready while we reply</h2>
          <p className="ra-help">Do these so we can start your campaign quickly. You never share a password.</p>
          <ol className="ra-steps">
            <li>Make sure your business has a Facebook Page. Link your Instagram to it if you want ads there too.</li>
            <li>Download the <b>Meta Business Suite</b> app and open your Page.</li>
            <li>Add a payment card in <b>Ads Manager → Billing</b>. You pay Meta directly for your ads.</li>
            <li>Message us on WhatsApp. We will send the payment details for the ₦2,900 setup fee, and tell you how to give us access to your Page and ad account.</li>
          </ol>
        </section>
        <section className="ra-card">
          <h2>What we do</h2>
          <p className="ra-help" style={{ margin: 0 }}>
            We set up your campaign: the targeting, budget and schedule. You watch the views and results in your own
            account. We do not guarantee sales or results.
          </p>
        </section>
        <button className="ra-link" onClick={startNew}>Create another request</button>
      </div>
    );
  }

  return (
    <div className="rd ra">
      <h1>Run Ads</h1>
      <p className="ra-sub">Get more customers for your business with Meta ads</p>

      <div className="ra-progress">
        <span className={step >= 1 ? "on" : ""}>1 Campaign</span>
        <span className={step >= 2 ? "on" : ""}>2 Ad details</span>
      </div>

      {step === 1 && (
        <>
          <section className="ra-card">
            <h2>Your business</h2>
            <div className="ra-biz">
              <b>{form.businessType || "Choose your business type"}</b>
              <button type="button" onClick={() => setChangeType(!changeType)}>
                {changeType ? "Done" : "Change"}
              </button>
            </div>
            {(changeType || !form.businessType) && (
              <>
                <div className="ra-chips" style={{ marginTop: 12 }}>
                  {TYPES.map((t) => (
                    <button type="button" key={t} className={form.businessType === t ? "on" : ""} onClick={() => set("businessType", t)}>
                      {t}
                    </button>
                  ))}
                </div>
                <input
                  className="ra-input"
                  maxLength={60}
                  placeholder="Or type your own, for example Bakery"
                  value={TYPES.includes(form.businessType) ? "" : form.businessType}
                  onChange={(e) => set("businessType", e.target.value)}
                />
              </>
            )}
          </section>

          <section className="ra-card">
            <h2>Where should we show your ad?</h2>
            <p className="ra-help">Start with one state, then grow.</p>
            <div className="ra-opts">
              {MODES.map((m) => (
                <button type="button" key={m.id} className={mode === m.id ? "ra-opt on" : "ra-opt"} onClick={() => chooseMode(m.id)}>
                  <span className="ra-rad" />
                  <span>
                    <b>
                      {m.title}
                      {m.rec && <i className="ra-rec">RECOMMENDED</i>}
                    </b>
                    <small>{m.sub}</small>
                  </span>
                </button>
              ))}
            </div>

            {(mode === "one" || mode === "pick") && (
              <>
                <p className="ra-label">{mode === "one" ? "Choose your state" : "Choose your states"}</p>
                <input className="ra-input" placeholder="Search states" value={search} onChange={(e) => setSearch(e.target.value)} />
                {mode === "pick" && (
                  <div className="ra-tools">
                    <button type="button" onClick={() => set("states", allSelected ? [] : [...states])}>
                      {allSelected ? "Clear all" : "Select all states"}
                    </button>
                    {form.states.length > 0 && !allSelected && (
                      <button type="button" onClick={() => set("states", [])}>Clear</button>
                    )}
                  </div>
                )}
                <div className="ra-chips ra-states">
                  {shownStates.map((s) => (
                    <button type="button" key={s} className={form.states.includes(s) ? "on" : ""} onClick={() => toggleState(s)}>
                      {s}
                    </button>
                  ))}
                  {shownStates.length === 0 && <p className="ra-help">No state found.</p>}
                </div>
              </>
            )}

            <p className="ra-picked">
              {form.states.length === 0
                ? "No state selected yet"
                : form.states.length === states.length
                ? "All states selected"
                : `${form.states.length} selected: ${form.states.join(", ")}`}
            </p>
          </section>

          <section className="ra-card">
            <h2>Campaign settings</h2>

            <p className="ra-label">Daily budget</p>
            <div className="ra-budgets">
              {BUDGETS.map((n) => (
                <button type="button" key={n} className={form.dailyBudget === n && !custom ? "ra-bud on" : "ra-bud"} onClick={() => pickBudget(n)}>
                  <b>{naira(n)}</b>
                  <small>{BUDGET_LABEL[n]}</small>
                </button>
              ))}
            </div>
            <p className="ra-note">More budget means more people see your ad. We can't promise how many, and we can't promise sales.</p>
            <input
              className="ra-input"
              inputMode="numeric"
              placeholder="Or type your own amount (₦)"
              value={custom}
              onChange={(e) => typeBudget(e.target.value)}
            />

            <p className="ra-label">Duration</p>
            <div className="ra-chips">
              {DURATIONS.map((n) => (
                <button type="button" key={n} className={form.durationDays === n ? "on" : ""} onClick={() => set("durationDays", n)}>
                  {n} days
                </button>
              ))}
            </div>

            <div className="ra-total">
              <span>You will spend about</span>
              <b>{naira(total)}</b>
              <small>
                {naira(form.dailyBudget)} a day for {form.durationDays} days. You pay this directly to Meta from your own ad
                account. We never hold your ad money.
              </small>
            </div>
            <div className="ra-fee">
              <span>Campaign setup fee (paid to us)</span>
              <b>{naira(FEE)}</b>
            </div>
            <p className="ra-note" style={{ textAlign: "center" }}>We set up your campaign. No sales are guaranteed.</p>
          </section>
        </>
      )}

      {step === 2 && (
        <>
          <section className="ra-card">
            <h2>Ad details</h2>

            <p className="ra-label">What do you want people to do?</p>
            <div className="ra-chips">
              <button type="button" className={form.goal === "visits" ? "on" : ""} onClick={() => set("goal", "visits")}>Visit my website</button>
              <button type="button" className={form.goal === "messages" ? "on" : ""} onClick={() => set("goal", "messages")}>Message me on WhatsApp</button>
            </div>

            <p className="ra-label">What should we advertise?</p>
            <input
              className="ra-input"
              maxLength={200}
              placeholder="My whole website, or one product like Leather handbag"
              value={form.promote}
              onChange={(e) => set("promote", e.target.value)}
            />

            <p className="ra-label">Your website link</p>
            <input className="ra-input" maxLength={200} value={form.link} onChange={(e) => set("link", e.target.value)} />

            <p className="ra-label">WhatsApp number for customers</p>
            <input
              className="ra-input"
              inputMode="tel"
              maxLength={20}
              placeholder="2348012345678"
              value={form.whatsapp}
              onChange={(e) => set("whatsapp", e.target.value)}
            />

            <p className="ra-label">Anything else we should know? (optional)</p>
            <textarea
              className="ra-input"
              rows={3}
              maxLength={500}
              placeholder="Example: Target women between 20 and 40."
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
            />
          </section>

          <section className="ra-card ra-sum">
            <h2>Your campaign</h2>
            <p><span>Business</span><b>{form.businessType}</b></p>
            <p><span>States</span><b>{form.states.length === states.length ? "All states" : form.states.join(", ")}</b></p>
            <p><span>Budget</span><b>{naira(form.dailyBudget)} a day for {form.durationDays} days</b></p>
            <p><span>Estimated ad spend</span><b>{naira(total)}</b></p>
            <p><span>Campaign setup fee</span><b>{naira(FEE)}</b></p>
          </section>

          <label className="ra-agree">
            <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
            <span>
              I understand that CBE QuickSite sets up my campaign and does not guarantee sales or results. I pay my ad
              budget directly to Meta.
            </span>
          </label>
        </>
      )}

      {error && <p className="rd-err">{error}</p>}

      <div className="ra-actions">
        {step === 1 ? (
          <>
            <button type="button" className="ra-ghost" onClick={onDraft} disabled={busy}>Save as draft</button>
            <button type="button" className="rd-btn" onClick={toDetails} disabled={busy}>
              {busy ? "Please wait..." : "Continue to ad details →"}
            </button>
          </>
        ) : (
          <>
            <button type="button" className="ra-ghost" onClick={() => setStep(1)} disabled={busy}>← Back</button>
            <button type="button" className="rd-btn" onClick={submit} disabled={busy}>
              {busy ? "Sending..." : "Send to CBE QuickSite"}
            </button>
          </>
        )}
      </div>
      {toast && <p className="ra-toast">{toast}</p>}

      {step === 1 && requests.length > 0 && (
        <section className="ra-card">
          <h2>Your requests</h2>
          {(showAll ? requests : requests.slice(0, 3)).map((r) => (
            <div key={r.id} className="ra-req">
              <div>
                <p className="ra-t1">{r.businessType}</p>
                <p className="ra-t2">
                  {r.states.length} {r.states.length === 1 ? "state" : "states"} · {naira(r.dailyBudget)}/day · {r.durationDays} days
                </p>
              </div>
              <span className={`ra-status ${r.status}`}>{STATUS_TEXT[r.status] || r.status}</span>
            </div>
          ))}
          {requests.length > 3 && (
            <button type="button" className="ra-link" onClick={() => setShowAll(!showAll)}>
              {showAll ? "Show less" : `Show all (${requests.length})`}
            </button>
          )}
        </section>
      )}
    </div>
  );
}