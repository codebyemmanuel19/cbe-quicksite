import { useEffect, useState } from "react";

const MAX_QTY = 20;

function load(slug) {
  try {
    return JSON.parse(localStorage.getItem(`cbe-cart-${slug}`)) || [];
  } catch {
    return [];
  }
}

// One bag per shop, kept even if the customer refreshes
export function useCart(slug) {
  const [cart, setCart] = useState(() => load(slug));

  useEffect(() => {
    if (!slug) return;
    try {
      localStorage.setItem(`cbe-cart-${slug}`, JSON.stringify(cart));
    } catch {
      // ignore: the bag just won't survive a refresh
    }
  }, [cart, slug]);

  function addToCart(item) {
    // Two lengths of the same wig are two different lines in the bag
    const key = `${item.productId}-${item.variant || ""}-${item.size}-${item.color}`;
    setCart((current) => {
      const existing = current.find((c) => c.key === key);
      if (existing) {
        return current.map((c) =>
          c.key === key ? { ...c, qty: Math.min(c.qty + 1, MAX_QTY) } : c
        );
      }
      return [...current, { ...item, key, qty: 1 }];
    });
  }

  function updateQty(key, change) {
    setCart((current) =>
      current
        .map((c) => (c.key === key ? { ...c, qty: Math.min(c.qty + change, MAX_QTY) } : c))
        .filter((c) => c.qty > 0)
    );
  }

  const cartCount = cart.reduce((sum, i) => sum + i.qty, 0);
  const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);

  return { cart, addToCart, updateQty, clearCart: () => setCart([]), cartCount, subtotal };
}

// Used by the bag, the checkout and the WhatsApp message
export function itemDetails(item) {
  return [item.variant, item.size && `Size ${item.size}`, item.color].filter(Boolean).join(", ");
}