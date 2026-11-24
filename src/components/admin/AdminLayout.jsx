import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import { PageTransition } from "../ds/MotionPrimitives";

function applyAdminAccessibilityPrefs() {
  try {
    const stored = JSON.parse(localStorage.getItem("isharaAdminSettings") || "{}");
    document.body.classList.toggle("ds-pref-larger-text", Boolean(stored.largerText));
    document.body.classList.toggle("ds-pref-reduce-motion", Boolean(stored.reduceMotion));
  } catch {
    // Ignore storage read issues
  }
}

function AdminLayout({ user }) {
  const location = useLocation();
  const [displayUser, setDisplayUser] = useState(user);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    applyAdminAccessibilityPrefs();

    function handleProfileUpdate(event) {
      const updated = event.detail;
      if (!updated) return;
      setDisplayUser((current) => ({
        ...current,
        full_name: updated.full_name ?? current?.full_name,
        email: updated.email ?? current?.email,
      }));
    }

    function handleStorage() {
      applyAdminAccessibilityPrefs();
    }

    window.addEventListener("ishara:admin-profile-updated", handleProfileUpdate);
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("ishara:admin-profile-updated", handleProfileUpdate);
      window.removeEventListener("storage", handleStorage);
      document.body.classList.remove("ds-pref-larger-text", "ds-pref-reduce-motion");
    };
  }, []);

  return (
    <div className="ds-admin-layout">
      <a className="ds-skip-link" href="#admin-main-content">
        Skip to main content
      </a>

      <AdminSidebar
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      <div className="ds-admin-main">
        <AdminHeader
          user={displayUser}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          mobileMenuOpen={mobileMenuOpen}
        />

        <main
          id="admin-main-content"
          tabIndex={-1}
          className="ds-admin-content"
        >
          <PageTransition key={location.pathname}>
            <Outlet context={displayUser} />
          </PageTransition>
        </main>

        <footer className="ds-admin-footer">
          <span>ISHARA AI Administration Panel</span>
          <span>© 2026 ISHARA AI</span>
        </footer>
      </div>
    </div>
  );
}

export default AdminLayout;
