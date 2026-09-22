// Turns "@kemisboutique" or a full link into a proper URL
function socialUrl(platform, value) {
  if (value.startsWith("http")) return value;
  const handle = value.replace(/^@/, "").trim();
  if (platform === "tiktok") return `https://www.tiktok.com/@${handle}`;
  if (platform === "facebook") return `https://www.facebook.com/${handle}`;
  return `https://www.instagram.com/${handle}`;
}

export default function ClothingFooter({ store }) {
  const socials = [
    { id: "tiktok", label: "TikTok", value: store.tiktok },
    { id: "facebook", label: "Facebook", value: store.facebook },
    { id: "instagram", label: "Instagram", value: store.instagram },
  ].filter((s) => s.value);

  return (
    <footer className="cs-footer">
      <p className="cs-logo">{store.name}</p>
      {store.about && <p className="cs-footer-about">{store.about}</p>}

      <div className="cs-footer-contact">
        {store.phone && (
          <a href={`tel:${store.phone.replace(/[^\d+]/g, "")}`}>{store.phone}</a>
        )}
        {store.email && <a href={`mailto:${store.email}`}>{store.email}</a>}
        {store.address && <p>{store.address}</p>}
        <a href={`https://wa.me/${store.whatsapp}`} target="_blank" rel="noreferrer">
          Chat on WhatsApp
        </a>
      </div>

      {socials.length > 0 && (
        <div className="cs-footer-links">
          {socials.map((s) => (
            <a key={s.id} href={socialUrl(s.id, s.value)} target="_blank" rel="noreferrer">
              {s.label}
            </a>
          ))}
        </div>
      )}

      <a className="cs-powered" href="https://cbequicksite.com" target="_blank" rel="noreferrer">
        Powered by CBE QuickSite
      </a>
    </footer>
  );
}