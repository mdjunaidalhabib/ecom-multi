import LoginPortal from "../../../components/LoginPortal";

export default function AdminLoginPage() {
  return (
    <LoginPortal
      title="Shop Admin Login"
      subtitle="আপনার assigned shop পরিচালনা করতে লগইন করুন"
      endpoint="/api/admin/login"
      successPath="/admin/dashboard"
      accent="blue"
    />
  );
}
