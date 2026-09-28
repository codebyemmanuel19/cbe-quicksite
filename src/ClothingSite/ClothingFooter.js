// Turns "@kemisboutique" or a full link into a proper URL
function socialUrl(platform, value) {
  if (value.startsWith("http")) return value;
  const handle = value.replace(/^@/, "").trim();
  if (platform === "tiktok") return `https://www.tiktok.com/@${handle}`;
  if (platform === "facebook") return `https://www.facebook.com/${handle}`;
  return `https://www.instagram.com/${handle}`;
}

export default function ClothingFooter({ store }) {
  const year = new Date().getFullYear();

  const socials = [
    { id: "instagram", label: "Instagram", value: store.instagram },
    { id: "tiktok", label: "TikTok", value: store.tiktok },
    { id: "facebook", label: "Facebook", value: store.facebook },
  ].filter((s) => s.value);

  return (
    <footer className="cs-footer">
      <div className="cs-footer-top">
        <p className="cs-footer-name">{store.name}</p>
        {store.about && <p className="cs-footer-about">{store.about}</p>}
      </div>

      <div className="cs-footer-cols">
        <div>
          <p className="cs-footer-head">Contact</p>
          <a href={`https://wa.me/${store.whatsapp}`} target="_blank" rel="noreferrer">
            WhatsApp
          </a>
          {store.phone && (
            <a href={`tel:${store.phone.replace(/[^\d+]/g, "")}`}>{store.phone}</a>
          )}
          {store.email && <a href={`mailto:${store.email}`}>{store.email}</a>}
        </div>

        {socials.length > 0 && (
          <div>
            <p className="cs-footer-head">Follow</p>
            {socials.map((s) => (
              <a key={s.id} href={socialUrl(s.id, s.value)} target="_blank" rel="noreferrer">
                {s.label}
              </a>
            ))}
          </div>
        )}

        {store.address && (
          <div>
            <p className="cs-footer-head">Visit</p>
            <p className="cs-footer-address">{store.address}</p>
          </div>
        )}
      </div>

      <div className="cs-footer-bottom">
        <span>© {year} {store.name}</span>
        <a href="https://cbequicksite.com" target="_blank" rel="noreferrer">
          Powered by CBE QuickSite
        </a>
      </div>
    </footer>
  );
}