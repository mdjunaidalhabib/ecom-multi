/**
 * POST /admin/logout
 */
export const logoutAdmin = async (req, res) => {
  try {
    const baseOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    };

    // ✅ admin (shop) আর super-admin app আলাদা cookie name ব্যবহার করে
    // ("admin_token" vs "super_admin_token") — logout route দুটো app-ই
    // শেয়ার করে বলে কোন portal থেকে কল হয়েছে তা না জেনেই দুটোই clear
    // করে দেওয়া হচ্ছে, যাতে কখনো stale session অন্য app-এ থেকে না যায়।
    const cookieNames = ["admin_token", "super_admin_token"];

    for (const name of cookieNames) {
      res.clearCookie(name, baseOptions);
      res.cookie(name, "", {
        ...baseOptions,
        expires: new Date(0),
        maxAge: 0,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error during logout",
    });
  }
};
