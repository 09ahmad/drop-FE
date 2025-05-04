
import { ReactNode } from "react";
import AdminNavbar from "./AdminNavbar";

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <AdminNavbar />
      <main className="flex-1 container mx-auto px-4 py-6">{children}</main>
    </div>
  );
};

export default AdminLayout;
