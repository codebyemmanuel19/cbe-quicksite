export default function HairFooter({ store }) {
  const year = new Date().getFullYear();

  const socials = [
    store.instagram && { name: "Instagram", url: `https://instagram.com/${String(store.instagram).replace("@", "")}` },
    store.tiktok && { name: "TikTok", url: `https://tiktok.com/@${String(store.tiktok).replace("@", "")}` },
    store.facebook && { name: "Facebook", url: `https://facebook.com/${String(store.facebook).replace("@", "")}` },
  ].filter(Boolean);

  return (
    <footer className="hs-footer">
      <div className="hs-footer-top">
        <p className="hs-footer-name">{store.name}</p>
        {store.about && <p className="hs-footer-about">{store.about}</p>}
      </div>

      <div className="hs-footer-cols">
        <div>
          <p className="hs-footer-head">Contact</p>
          <a href={`https://wa.me/${store.whatsapp}`} target="_blank" rel="noreferrer">
            WhatsApp
          </a>
          {store.phone && <a href={`tel:${store.phone}`}>{store.phone}</a>}
          {store.email && <a href={`mailto:${store.email}`}>{store.email}</a>}
        </div>

        {socials.length > 0 && (
          <div>
            <p className="hs-footer-head">Follow</p>
            {socials.map((s) => (
              <a key={s.name} href={s.url} target="_blank" rel="noreferrer">{s.name}</a>
            ))}
          </div>
        )}

        {store.address && (
          <div>
            <p className="hs-footer-head">Visit</p>
            <p className="hs-footer-address">{store.address}</p>
          </div>
        )}
      </div>

      <div className="hs-footer-bottom">
        <span>© {year} {store.name}</span>
        <a href="https://cbequicksite.com" target="_blank" rel="noreferrer">
          Powered by CBE QuickSite
        </a>
      </div>
    </footer>
  );
}