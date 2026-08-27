import Theme, { FONT_PRESETS, listActiveThemes } from "../../src/models/Theme.js";
import Plan from "../../src/models/Plan.js";
import Shop from "../../src/models/Shop.js";

const BASE_LAYOUTS = ["classic", "aurora", "terra"];
const COLOR_KEYS = [
  "primary",
  "primaryDark",
  "secondary",
  "background",
  "surface",
  "text",
  "accent",
];
const HEX_COLOR_RE = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

function normalizeKey(value = "") {
  return value
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function generateUniqueKey(name) {
  const base = normalizeKey(name) || "theme";
  let key = base;
  let counter = 1;

  // eslint-disable-next-line no-await-in-loop
  while (await Theme.findOne({ key })) {
    counter += 1;
    key = `${base}-${counter}`;
  }

  return key;
}

function parseColors(input = {}) {
  const colors = {};
  for (const key of COLOR_KEYS) {
    if (input[key] === undefined) continue;
    const value = String(input[key]).trim();
    if (!HEX_COLOR_RE.test(value)) {
      throw new Error(`${key}-এর জন্য অবৈধ রং কোড: ${value}`);
    }
    colors[key] = value;
  }
  return colors;
}

function parseFonts(input = {}) {
  const fonts = {};
  for (const key of ["heading", "body"]) {
    if (input[key] === undefined) continue;
    if (!FONT_PRESETS.includes(input[key])) {
      throw new Error(`${key}-এর জন্য অবৈধ ফন্ট: ${input[key]}`);
    }
    fonts[key] = input[key];
  }
  return fonts;
}

/* -------------------------------------------------------
   GET /admin/themes — সব theme preset (super-admin only —
   Plans/Shops পেজের dropdown-এর জন্য দরকার)
------------------------------------------------------- */
export const listThemes = async (req, res) => {
  try {
    const themes = await listActiveThemes();
    return res.json(themes);
  } catch (err) {
    console.error("listThemes error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/* -------------------------------------------------------
   POST /admin/themes — নতুন theme preset তৈরি (super-admin only)
------------------------------------------------------- */
export const createTheme = async (req, res) => {
  try {
    const { name, baseLayout, colors, fonts } = req.body || {};
    const trimmedName = (name || "").toString().trim();
    if (!trimmedName) {
      return res.status(400).json({ message: "থিমের নাম প্রয়োজন" });
    }

    if (!BASE_LAYOUTS.includes(baseLayout)) {
      return res.status(400).json({ message: `অবৈধ baseLayout: ${baseLayout}` });
    }

    let parsedColors;
    let parsedFonts;
    try {
      parsedColors = parseColors(colors);
      parsedFonts = parseFonts(fonts);
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }

    const key = await generateUniqueKey(trimmedName);

    const theme = await Theme.create({
      key,
      name: trimmedName,
      baseLayout,
      colors: parsedColors,
      fonts: parsedFonts,
      isSystem: false,
    });

    return res.status(201).json(theme);
  } catch (err) {
    console.error("createTheme error:", err);
    return res.status(500).json({ message: err.message || "Server error" });
  }
};

/* -------------------------------------------------------
   PATCH /admin/themes/:id — theme আপডেট (super-admin only)
   key/baseLayout-এর isSystem status immutable — নাম/baseLayout/রং/ফন্ট বদলানো যায়
------------------------------------------------------- */
export const updateTheme = async (req, res) => {
  try {
    const theme = await Theme.findById(req.params.id);
    if (!theme) return res.status(404).json({ message: "Theme not found" });

    const { name, baseLayout, colors, fonts } = req.body || {};

    if (name !== undefined) {
      const trimmedName = String(name).trim();
      if (!trimmedName) {
        return res.status(400).json({ message: "থিমের নাম খালি রাখা যাবে না" });
      }
      theme.name = trimmedName;
    }

    if (baseLayout !== undefined) {
      if (!BASE_LAYOUTS.includes(baseLayout)) {
        return res.status(400).json({ message: `অবৈধ baseLayout: ${baseLayout}` });
      }
      theme.baseLayout = baseLayout;
    }

    try {
      if (colors && typeof colors === "object") {
        Object.assign(theme.colors, parseColors(colors));
      }
      if (fonts && typeof fonts === "object") {
        Object.assign(theme.fonts, parseFonts(fonts));
      }
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }

    await theme.save();
    return res.json(theme);
  } catch (err) {
    console.error("updateTheme error:", err);
    return res.status(500).json({ message: err.message || "Server error" });
  }
};

/* -------------------------------------------------------
   DELETE /admin/themes/:id — theme ডিলিট (super-admin only)
   ব্লক করা হয়: (ক) system (seed করা) থিম হলে, (খ) কোনো plan/shop এখনও
   এই থিম ব্যবহার করলে
------------------------------------------------------- */
export const deleteTheme = async (req, res) => {
  try {
    const theme = await Theme.findById(req.params.id);
    if (!theme) return res.status(404).json({ message: "Theme not found" });

    if (theme.isSystem) {
      return res.status(400).json({ message: "বেস থিম ডিলিট করা যাবে না।" });
    }

    const [plansUsing, shopsUsing] = await Promise.all([
      Plan.countDocuments({ theme: theme.key }),
      Shop.countDocuments({ "branding.theme": theme.key }),
    ]);

    if (plansUsing > 0 || shopsUsing > 0) {
      return res.status(400).json({
        message: `${plansUsing}টি প্ল্যান ও ${shopsUsing}টি শপ এখনও এই থিমে আছে — আগে সেগুলোকে অন্য থিমে সরিয়ে নিন।`,
      });
    }

    await theme.deleteOne();
    return res.json({ message: "থিম ডিলিট হয়েছে" });
  } catch (err) {
    console.error("deleteTheme error:", err);
    return res.status(500).json({ message: err.message || "Server error" });
  }
};
