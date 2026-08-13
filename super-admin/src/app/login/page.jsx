import LoginPortal from "../../../components/LoginPortal";

export default function SuperAdminLoginPage() {
  return (
    <LoginPortal
      title="Super Admin Login"
      subtitle="স্বাগতম! নিরাপদে সাইন ইন করে পুরো প্ল্যাটফর্ম পরিচালনা করুন"
      endpoint="/api/admin/super-login"
      successPath="/dashboard"
    />
  );
}
