import { useEffect, useState } from "react";
import { api } from "./api";
import { useShop } from "./shop/useShop";
import ClothingSite from "./ClothingSite/ClothingSite";
import HairSite from "./HairSite/HairSite";
import SkincareSite from "./SkincareSite/SkincareSite";
import PerfumeSite from "./PerfumeSite/PerfumeSite";
import JewellerySite from "./JewellerySite/JewellerySite";
import GadgetsSite from "./GadgetsSite/GadgetsSite";
import RealEstateSite from "./RealEstateSite/Site";
import CarSite from "./CarSite/Site";
import RestaurantSite from "./RestaurantSite/Site";

// The business type the vendor picked at setup decides the look
const TEMPLATES = {
  clothing: ClothingSite,
  hair: HairSite,
  skincare: SkincareSite,
  perfume: PerfumeSite,
  jewellery: JewellerySite,
  gadgets: GadgetsSite,
  realestate: RealEstateSite,
  cars: CarSite,
  restaurant: RestaurantSite,
};


// The page for a website that cannot open. Says clearly whether it is offline or does not exist.
function Unavailable({ slug }) {
  const [info, setInfo] = useState(null);

  useEffect(() => {
    if (!slug) return;
    api.get(`/public/shop/${slug}/status`)
      .then(setInfo)
      .catch(() => setInfo({ state: "missing" }));
  }, [slug]);

  const offline = info && info.state === "offline";
  const missing = info && info.state !== "offline";

  return (
    <div className="un">
      <style>{`
        .un { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px; background: #f6f7fb; font-family: system-ui, -apple-system, "Segoe UI", sans-serif; color: #0f172a; }
        .un-card { width: 100%; max-width: 420px; padding: 34px 26px; text-align: center; background: #fff; border-radius: 22px; box-shadow: 0 10px 40px rgba(15, 23, 42, .08); animation: un-in .3s ease-out; }
        .un-ico { width: 64px; height: 64px; margin: 0 auto 18px; display: grid; place-items: center; border-radius: 50%; background: #fff7ed; font-size: 30px; }
        .un h1 { margin: 0 0 10px; font-size: 24px; line-height: 1.25; }
        .un p { margin: 0 0 8px; color: #475569; font-size: 15px; line-height: 1.55; }
        .un-name { font-weight: 700; color: #0f172a; }
        .un-owner { margin-top: 22px; padding-top: 18px; border-top: 1px solid #eef0f4; font-size: 13.5px; color: #64748b; }
        .un a { color: #2563eb; font-weight: 700; text-decoration: none; }
        @keyframes un-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
      `}</style>

      {info && (
        <div className="un-card">
          <div className="un-ico">{offline ? "🔒" : "🔎"}</div>

          {offline && (
            <>
              <h1>This website is currently offline</h1>
              <p>
                <span className="un-name">{info.name}</span> is not available right now.
              </p>
              <p>Please check back later.</p>
              <div className="un-owner">
                Are you the owner? <a href="https://cbequicksite.com/login">Log in</a> to bring your website back online.
              </div>
            </>
          )}

          {missing && (
            <>
              <h1>We can't find this website</h1>
              <p>Check the address and try again.</p>
              <div className="un-owner">
                Want a website like this? <a href="https://cbequicksite.com">Create yours</a>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// What people see for a moment while the shop loads: the shape of a website, softly pulsing
function ShopLoader() {
  return (
    <div className="sl" aria-busy="true" aria-label="Loading">
      <style>{`
        .sl { min-height: 100vh; background: #f8f7f4; padding: 0 0 40px; animation: sl-in .25s ease-out; }
        .sl-bar { display: flex; align-items: center; justify-content: space-between; padding: 16px 18px; background: #fff; border-bottom: 1px solid #eeece6; }
        .sl-logo { display: flex; align-items: center; gap: 10px; }
        .sl-b { background: linear-gradient(90deg, #ebe8e1 25%, #f5f3ee 50%, #ebe8e1 75%); background-size: 200% 100%; animation: sl-shine 1.3s linear infinite; }
        .sl-dot { width: 34px; height: 34px; border-radius: 50%; }
        .sl-line { height: 12px; border-radius: 6px; }
        .sl-hero { margin: 16px 18px; height: 210px; border-radius: 20px; }
        .sl-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 0 18px; }
        .sl-card { border-radius: 16px; background: #fff; padding: 10px; }
        .sl-img { height: 120px; border-radius: 12px; margin-bottom: 10px; }
        @media (min-width: 720px) { .sl-grid { grid-template-columns: repeat(4, 1fr); max-width: 1000px; margin: 0 auto; } .sl-hero { max-width: 964px; margin: 18px auto; } }
        @keyframes sl-shine { to { background-position: -200% 0; } }
        @keyframes sl-in { from { opacity: 0; } to { opacity: 1; } }
      `}</style>

      <div className="sl-bar">
        <div className="sl-logo">
          <div className="sl-b sl-dot" />
          <div className="sl-b sl-line" style={{ width: 110 }} />
        </div>
        <div className="sl-b sl-dot" />
      </div>

      <div className="sl-b sl-hero" />

      <div className="sl-grid">
        {[0, 1, 2, 3].map((i) => (
          <div className="sl-card" key={i}>
            <div className="sl-b sl-img" />
            <div className="sl-b sl-line" style={{ width: "80%", marginBottom: 8 }} />
            <div className="sl-b sl-line" style={{ width: "45%" }} />
          </div>
        ))}
      </div>
    </div>
  );
}

// kemisboutique.cbequicksite.com loads this. It asks the API which
// kind of shop this is, then hands over to that template.
export default function ShopRouter({ basePath = "" }) {
  const { slug, store, loading, notFound } = useShop();

  if (loading) {
    return <ShopLoader />;
  }

  if (notFound || !store) {
    return <Unavailable slug={slug} />;
  }

  const Template = TEMPLATES[store.businessType] || ClothingSite;
  return <Template basePath={basePath} slug={slug} />;
}