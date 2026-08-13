import LoginPortal from "../../../components/LoginPortal";

export default function AdminLoginPage() {
  return (
    <LoginPortal
      title="Shop Admin Login"
      subtitle="আপনার শপে স্বাগতম! নিরাপদে সাইন ইন করে ব্যবসা পরিচালনা করুন"
      endpoint="/api/admin/login"
      successPath="/admin/dashboard"
      accent="orange"
    />
  );
}
