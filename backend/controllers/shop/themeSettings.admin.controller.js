import { getPlatformSettings } from "../../src/models/PlatformSettings.js";

const THEME_KEYS = ["classic", "aurora", "terra"];

/* -------------------------------------------------------
   GET /admin/theme-settings — plan → theme mapping পড়া
------------------------------------------------------- */
export const getThemeSettings = async (req, res) => {
  try {
    const settings = await getPlatformSettings();
    return res.json({ planThemeMap: settings.planThemeMap });
  } catch (err) {
    console.error("getThemeSettings error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/* -------------------------------------------------------
   PUT /admin/theme-settings — plan → theme mapping আপডেট
------------------------------------------------------- */
export const updateThemeSettings = async (req, res) => {
  try {
    const { planThemeMap } = req.body || {};
    if (!planThemeMap || typeof planThemeMap !== "object") {
      return res.status(400).json({ message: "planThemeMap প্রয়োজন" });
    }

    const settings = await getPlatformSettings();

    for (const plan of ["free", "starter", "pro"]) {
      const theme = planThemeMap[plan];
      if (theme !== undefined) {
        if (!THEME_KEYS.includes(theme)) {
          return res.status(400).json({ message: `${plan} প্ল্যানের জন্য অবৈধ theme: ${theme}` });
        }
        settings.planThemeMap[plan] = theme;
      }
    }

    await settings.save();
    return res.json({ planThemeMap: settings.planThemeMap });
  } catch (err) {
    console.error("updateThemeSettings error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
