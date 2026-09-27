import { useState } from "react";
import { BrowserRouter, Routes, Route, NavLink, Outlet, Navigate } from "react-router-dom";
import Signup from "./components/Signup";
import Setup from "./components/Setup";
import Login from "./components/Login";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import DashboardHome from "./components/DashboardHome";
import BusinessInfo from "./components/BusinessInfo";
import Products from "./components/Products";
import Orders from "./components/Orders";
import OrderSettings from "./components/OrderSettings";
import Billing from "./components/Billing";
import Support from "./components/Support";
import ClothingSite from "./ClothingSite/ClothingSite";
import HairSite from "./HairSite/HairSite";
import SkincareSite from "./SkincareSite/SkincareSite";
import PerfumeSite from "./PerfumeSite/PerfumeSite";
import JewellerySite from "./JewellerySite/JewellerySite";
import GadgetsSite from "./GadgetsSite/GadgetsSite";
import ShopRouter from "./ShopRouter";
import "./App.css";

// True on kemisboutique.cbequicksite.com, false on cbequicksite.com and localhost
function isVendorSubdomain() {
  const parts = window.location.hostname.split(".");
  return parts.length > 2 && parts[0] !== "www";
}

const Brand = () => (
  <span className="brand">
    <span className="brand-dark">CBE</span><span className="brand-blue">QuickSite</span>
  </span>
);

const icons = {
  dashboard: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </svg>
  ),
  business: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="7" width="18" height="14" rx="2" />
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  ),
  products: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 7l9-4 9 4-9 4-9-4z" />
      <path d="M3 7v10l9 4 9-4V7" />
      <path d="M12 11v10" />
    </svg>
  ),
  orders: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 2h9l3 3v17H6z" />
      <path d="M15 2v3h3" />
      <path d="M9 12h6M9 16h6" />
    </svg>
  ),
  orderSettings: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
  billing: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20" />
    </svg>
  ),
  support: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 2-3 4" />
      <path d="M12 17h.01" />
    </svg>
  ),
};

const menu = [
  { group: "WEBSITE", items: [
    { to: "/dashboard", label: "Dashboard", end: true, icon: icons.dashboard },
    { to: "/dashboard/business", label: "Business Info", icon: icons.business },
    { to: "/dashboard/products", label: "Products", icon: icons.products },
  ]},
  { group: "SALES", items: [
    { to: "/dashboard/orders", label: "Orders", icon: icons.orders },
    { to: "/dashboard/order-settings", label: "Order Settings", icon: icons.orderSettings },
  ]},
  { group: "ACCOUNT", items: [
    { to: "/dashboard/billing", label: "Plans & Billing", icon: icons.billing },
    { to: "/dashboard/support", label: "Support", icon: icons.support },
  ]},
];

function DashboardLayout() {
  const [open, setOpen] = useState(false);

  return (
    <div className="layout">
      <header className="topbar">
        <button className="menu-btn" onClick={() => setOpen(true)} aria-label="Open menu">
          ☰
        </button>
        <Brand />
      </header>

      {open && <div className="overlay" onClick={() => setOpen(false)} />}

      <aside className={open ? "sidebar open" : "sidebar"}>
        <div className="sidebar-head">
          <Brand />
          <button className="close-btn" onClick={() => setOpen(false)} aria-label="Close menu">
            ✕
          </button>
        </div>

        {menu.map((section) => (
          <div key={section.group || "main"} className="menu-group">
            {section.group && <p className="menu-label">{section.group}</p>}
            {section.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => (isActive ? "menu-link active" : "menu-link")}
                onClick={() => setOpen(false)}
              >
                <span className="menu-icon">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </aside>

      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}

export default function App() {
  // A vendor's own address shows their shop and nothing else.
  // No dashboard, no signup: those live on cbequicksite.com.
  if (isVendorSubdomain()) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/*" element={<ShopRouter />} />
        </Routes>
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* For testing: the main link opens the dashboard. Switch back when the landing page is built. */}
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/setup" element={<Setup />} />

        {/* Test the real subdomain behaviour on your laptop:
            /shop?slug=kemisboutique picks the template by business type */}
        <Route path="/shop/*" element={<ShopRouter basePath="/shop" />} />

        {/* Template previews. Add ?slug=yourshop to load a real shop's data. */}
        <Route path="/preview/clothing/*" element={<ClothingSite basePath="/preview/clothing" />} />
        <Route path="/preview/hair/*" element={<HairSite basePath="/preview/hair" />} />
        <Route path="/preview/skincare/*" element={<SkincareSite basePath="/preview/skincare" />} />
        <Route path="/preview/perfume/*" element={<PerfumeSite basePath="/preview/perfume" />} />
        <Route path="/preview/jewellery/*" element={<JewellerySite basePath="/preview/jewellery" />} />
        <Route path="/preview/gadgets/*" element={<GadgetsSite basePath="/preview/gadgets" />} />

        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardHome />} />
          <Route path="business" element={<BusinessInfo />} />
          <Route path="products" element={<Products />} />
          <Route path="orders" element={<Orders />} />
          <Route path="order-settings" element={<OrderSettings />} />
          <Route path="billing" element={<Billing />} />
          <Route path="support" element={<Support />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  );
}