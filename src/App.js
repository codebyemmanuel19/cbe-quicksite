import { useState } from "react";
import { BrowserRouter, Routes, Route, NavLink, Outlet, Navigate } from "react-router-dom";
import Signup from "./components/Signup";
import Setup from "./components/Setup";
import Login from "./components/Login";
import DashboardHome from "./components/DashboardHome";
import BusinessInfo from "./components/BusinessInfo";
import Products from "./components/Products";
import Orders from "./components/Orders";
import OrderSettings from "./components/OrderSettings";
import Support from "./components/Support";
import "./App.css";

const Page = ({ title }) => <h1 className="page-title">{title}</h1>;

const menu = [
  { group: "WEBSITE", items: [
    { to: "/dashboard", label: "Dashboard", end: true },
    { to: "/dashboard/business", label: "Business Info" },
    { to: "/dashboard/products", label: "Products" },
  ]},
  { group: "SALES", items: [
    { to: "/dashboard/orders", label: "Orders" },
    { to: "/dashboard/order-settings", label: "Order Settings" },
  ]},
  { group: "ACCOUNT", items: [
    { to: "/dashboard/billing", label: "Plans & Billing" },
    { to: "/dashboard/support", label: "Support" },
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
        <span className="brand">CBE QuickSite</span>
      </header>

      {open && <div className="overlay" onClick={() => setOpen(false)} />}

      <aside className={open ? "sidebar open" : "sidebar"}>
        <div className="sidebar-head">
          <span className="brand">CBE QuickSite</span>
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
                {item.label}
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
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Page title="Landing page" />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<Page title="Reset password" />} />
        <Route path="/setup" element={<Setup />} />
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardHome />} />
          <Route path="business" element={<BusinessInfo />} />
          <Route path="products" element={<Products />} />
          <Route path="orders" element={<Orders />} />
          <Route path="order-settings" element={<OrderSettings />} />
          <Route path="billing" element={<Page title="Plans & Billing" />} />
          <Route path="support" element={<Support />} />
        </Route>
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  );
}