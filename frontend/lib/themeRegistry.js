import ClassicNavbar from "../components/navbar/Navbar";
import ClassicFooter from "../components/home/footer";
import ClassicHomeLayout from "../components/themes/classic/HomeLayout";
import AuroraNavbar from "../components/themes/aurora/Navbar";
import AuroraFooter from "../components/themes/aurora/Footer";
import AuroraHomeLayout from "../components/themes/aurora/HomeLayout";
import TerraNavbar from "../components/themes/terra/Navbar";
import TerraFooter from "../components/themes/terra/Footer";
import TerraHomeLayout from "../components/themes/terra/HomeLayout";

// Each entry is a full, independent component set for that storefront theme —
// completely different layout/markup per theme, not just recolored classic.
// A theme key with no registered components here falls back to "classic".
const THEMES = {
  classic: {
    Navbar: ClassicNavbar,
    Footer: ClassicFooter,
    HomeLayout: ClassicHomeLayout,
    mainClassName: "bg-pink-50",
  },
  aurora: {
    Navbar: AuroraNavbar,
    Footer: AuroraFooter,
    HomeLayout: AuroraHomeLayout,
    mainClassName: "bg-white",
  },
  terra: {
    Navbar: TerraNavbar,
    Footer: TerraFooter,
    HomeLayout: TerraHomeLayout,
    mainClassName: "bg-amber-50/40",
  },
};

export function getTheme(themeKey) {
  return THEMES[themeKey] || THEMES.classic;
}
