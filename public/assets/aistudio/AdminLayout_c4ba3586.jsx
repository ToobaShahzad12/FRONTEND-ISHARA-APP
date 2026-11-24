import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import "./AdminLayout.css";

function AdminLayout({ user }) {
  const [displayUser, setDisplayUser] = useState(user);

  useEffect(() => {
    function handleProfileUpdate(event) {
      const updated = event.detail;
      if (!updated) return;
      setDisplayUser((current) => ({
        ...current,
        full_name: updated.full_name ?? current?.full_name,
        email: updated.email ?? current?.email,
      }));
    }

    window.addEventListener("ishara:admin-profile-updated", handleProfileUpdate);
    return () => {
      window.removeEventListener("ishara:admin-profile-updated", handleProfileUpdate);
    };
  }, []);

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <div className="admin-main">
        <AdminHeader user={displayUser} />

        <main className="admin-content">
          <Outlet context={displayUser} />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
