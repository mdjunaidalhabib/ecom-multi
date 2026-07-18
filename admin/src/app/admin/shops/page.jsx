"use client";

import Shops from "../../../../components/Shops";
import useAdminMe from "../../../../hooks/useAdminMe";

export default function AdminShopsPage() {
  const { admin, loading, isSuperAdmin } = useAdminMe();

  if (loading) {
    return <div className="p-4 text-center text-gray-500">লোড হচ্ছে...</div>;
  }

  if (!isSuperAdmin) {
    return (
      <div className="p-4 text-center text-gray-500 py-10">
        🔒 এই পেজটা শুধু Super Admin-এর জন্য।
      </div>
    );
  }

  return (
    <div className="p-4">
      <Shops />
    </div>
  );
}
