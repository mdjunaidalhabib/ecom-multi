import LoginPortal from "../../../../components/LoginPortal";

export default function SuperAdminLoginPage() {
  return (
    <LoginPortal
      title="Super Admin Login"
      subtitle="Platform, shops এবং shop admins পরিচালনা করতে লগইন করুন"
      endpoint="/api/admin/super-login"
      successPath="/super-admin/dashboard"
      accent="violet"
    />
  );
}
