import ClassicNavbar from "../components/navbar/Navbar";
import ClassicFooter from "../components/home/footer";
import ClassicHomeLayout from "../components/themes/classic/HomeLayout";
import ClassicProductCard from "../components/home/ProductCard";
import SharedCategoryBrowser from "../components/categories/CategoryBrowserClient";
import TerraNavbar from "../components/themes/terra/Navbar";
import TerraFooter from "../components/themes/terra/Footer";
import TerraHomeLayout from "../components/themes/terra/HomeLayout";
import TerraContactFab from "../components/themes/terra/ContactFab";
import TerraProductCard from "../components/themes/terra/ProductCard";
import FirstCartNavbar from "../components/themes/firstcart/Navbar";
import FirstCartFooter from "../components/themes/firstcart/Footer";
import FirstCartHomeLayout from "../components/themes/firstcart/HomeLayout";
import FirstCartContactFab from "../components/themes/firstcart/ContactFab";
import FirstCartProductCard from "../components/themes/firstcart/ProductCard";
import FirstCartCategoryBrowser from "../components/themes/firstcart/CategoryBrowser";
import SharedProductDetails from "../components/product-details/ProductDetailsClient";
import TerraProductDetails from "../components/themes/terra/ProductDetails";
import FirstCartProductDetails from "../components/themes/firstcart/ProductDetails";

// Each entry is a full, independent component set for that storefront theme —
// completely different layout/markup per theme, not just recolored classic.
// A theme key with no registered components here falls back to "classic".
const THEMES = {
  classic: {
    Navbar: ClassicNavbar,
    Footer: ClassicFooter,
    HomeLayout: ClassicHomeLayout,
    ProductCard: ClassicProductCard,
    CategoryBrowser: SharedCategoryBrowser,
    ProductDetails: SharedProductDetails,
    mainClassName: "bg-[var(--theme-bg)]",
  },
  terra: {
    Navbar: TerraNavbar,
    Footer: TerraFooter,
    HomeLayout: TerraHomeLayout,
    ContactFab: TerraContactFab,
    ProductCard: TerraProductCard,
    CategoryBrowser: SharedCategoryBrowser,
    ProductDetails: TerraProductDetails,
    mainClassName: "bg-[var(--theme-bg)]",
  },
  firstcart: {
    Navbar: FirstCartNavbar,
    Footer: FirstCartFooter,
    HomeLayout: FirstCartHomeLayout,
    ContactFab: FirstCartContactFab,
    ProductCard: FirstCartProductCard,
    CategoryBrowser: FirstCartCategoryBrowser,
    ProductDetails: FirstCartProductDetails,
    mainClassName: "bg-[var(--theme-bg)]",
  },
};

export function getTheme(themeKey) {
  return THEMES[themeKey] || THEMES.classic;
}
