import { useShop } from "./shop/useShop";
import ClothingSite from "./ClothingSite/ClothingSite";
import HairSite from "./HairSite/HairSite";
import SkincareSite from "./SkincareSite/SkincareSite";
import PerfumeSite from "./PerfumeSite/PerfumeSite";
import JewellerySite from "./JewellerySite/JewellerySite";
import GadgetsSite from "./GadgetsSite/GadgetsSite";

// The business type the vendor picked at setup decides the look
const TEMPLATES = {
  clothing: ClothingSite,
  hair: HairSite,
  skincare: SkincareSite,
  perfume: PerfumeSite,
  jewellery: JewellerySite,
  gadgets: GadgetsSite,
};

// kemisboutique.cbequicksite.com loads this. It asks the API which
// kind of shop this is, then hands over to that template.
export default function ShopRouter() {
  const { slug, store, loading, notFound } = useShop();

  if (loading) {
    return <div className="shop-loading">Loading...</div>;
  }

  if (notFound || !store) {
    return (
      <div className="shop-missing">
        <h1>Shop not found</h1>
        <p>This website address doesn't belong to any shop.</p>
        <a href="https://cbequicksite.com">Create your own website</a>
      </div>
    );
  }

  const Template = TEMPLATES[store.businessType] || ClothingSite;
  return <Template basePath="" slug={slug} />;
}
