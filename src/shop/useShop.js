import { useEffect, useState } from "react";
import { api } from "../api";

// kemisboutique.cbequicksite.com -> kemisboutique
// On your laptop use ?slug=kemisboutique once, and it's remembered
export function detectSlug() {
  const fromQuery = new URLSearchParams(window.location.search).get("slug");
  if (fromQuery) {
    const clean = fromQuery.trim().toLowerCase();
    try {
      sessionStorage.setItem("cbe-preview-slug", clean);
    } catch {
      // private mode: the slug just won't survive a page change
    }
    return clean;
  }

  const parts = window.location.hostname.split(".");
  if (parts.length > 2 && parts[0] !== "www") return parts[0].toLowerCase();

  try {
    return sessionStorage.getItem("cbe-preview-slug") || "";
  } catch {
    return "";
  }
}

// Every template calls this. It loads one vendor's shop and products.
export function useShop(slugProp) {
  const [slug] = useState(() => slugProp || detectSlug());
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!slug) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      try {
        const [shopRes, productRes] = await Promise.all([
          api.get(`/public/shop/${slug}`),
          api.get(`/public/shop/${slug}/products`),
        ]);
        if (cancelled) return;

        const s = shopRes.shop;
        setStore({
          slug: s.slug,
          businessType: s.businessType,
          name: s.businessName,
          symbol: s.symbol,
          dialCode: s.dialCode,
          whatsapp: s.whatsapp,
          phoneCode: s.dialCode,
          about: s.about,
          email: s.email,
          phone: s.phone,
          address: s.address,
          logo: s.logo,
          instagram: s.instagram,
          facebook: s.facebook,
          tiktok: s.tiktok,
          hero: { image: s.cover, label: s.heroLabel, headline: s.heroHeadline },
          categories: shopRes.categories.map((c) => c.name),
          settings: shopRes.checkout,
          products: productRes.products,
        });
      } catch (err) {
        if (!cancelled) setNotFound(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  return { slug, store, loading, notFound };
}