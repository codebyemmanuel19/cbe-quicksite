export default function GadgetsFooter({ store }) {
  const year = new Date().getFullYear();

  const socials = [
    store.instagram && { name: "Instagram", url: `https://instagram.com/${String(store.instagram).replace("@", "")}` },
    store.tiktok && { name: "TikTok", url: `https://tiktok.com/@${String(store.tiktok).replace("@", "")}` },
    store.facebook && { name: "Facebook", url: `https://facebook.com/${String(store.facebook).replace("@", "")}` },
  ].filter(Boolean);

  return (
    <footer className="gd-footer">
      <div className="gd-footer-cols">
        <div className="gd-footer-brand">
          <p className="gd-footer-name">{store.name}</p>
          {store.about && <p className="gd-footer-about">{store.about}</p>}
        </div>

        <div>
          <p className="gd-footer-head">Contact</p>
          <a href={`https://wa.me/${store.whatsapp}`} target="_blank" rel="noreferrer">
            WhatsApp
          </a>
          {store.phone && <a href={`tel:${store.phone}`}>{store.phone}</a>}
          {store.email && <a href={`mailto:${store.email}`}>{store.email}</a>}
        </div>

        {socials.length > 0 && (
          <div>
            <p className="gd-footer-head">Follow</p>
            {socials.map((s) => (
              <a key={s.name} href={s.url} target="_blank" rel="noreferrer">{s.name}</a>
            ))}
          </div>
        )}

        {store.address && (
          <div>
            <p className="gd-footer-head">Store</p>
            <p className="gd-footer-address">{store.address}</p>
          </div>
        )}
      </div>

      <div className="gd-footer-bottom">
        <span>© {year} {store.name}</span>
        <a href="https://cbequicksite.com" target="_blank" rel="noreferrer">
          Powered by CBE QuickSite
        </a>
      </div>
    </footer>
  );
}