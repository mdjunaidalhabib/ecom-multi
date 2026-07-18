import Sidebar from "../../../../components/Sidebar";
import Header from "../../../../components/Header";
import "../../globals.css";

export default function SuperAdminLayout({ children }) {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Header />
        <main className="flex-1 overflow-auto p-2 sm:p-4">{children}</main>
      </div>
    </div>
  );
}
