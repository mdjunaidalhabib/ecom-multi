import { getPlatformSettings } from "../../src/models/PlatformSettings.js";

export async function getPlatformProjects(req, res) {
  try {
    const settings = await getPlatformSettings();
    res.json({ projectPageUrl: settings.projectPageUrl || "" });
  } catch (error) {
    console.error("getPlatformProjects error:", error);
    res.status(500).json({ message: "প্রজেক্ট পেজের লিংক লোড করা যায়নি" });
  }
}

export async function updatePlatformProjects(req, res) {
  if (typeof req.body?.projectPageUrl !== "string") {
    return res.status(400).json({ message: "প্রজেক্ট পেজের সঠিক http/https লিংক দিন" });
  }
  const projectPageUrl = req.body.projectPageUrl.trim();
  if (projectPageUrl) {
    let valid = false;
    try {
      const parsed = new URL(projectPageUrl);
      valid = ["http:", "https:"].includes(parsed.protocol) && !!parsed.hostname && !parsed.username && !parsed.password;
    } catch { /* Invalid URL is handled below. */ }
    if (!valid || projectPageUrl.length > 2048) {
      return res.status(400).json({ message: "প্রজেক্ট পেজের সঠিক http/https লিংক দিন" });
    }
  }
  try {
    const settings = await getPlatformSettings();
    settings.projectPageUrl = projectPageUrl;
    await settings.save();
    res.json({ projectPageUrl });
  } catch (error) {
    console.error("updatePlatformProjects error:", error);
    res.status(500).json({ message: "লিংক সেভ করা যায়নি" });
  }
}
