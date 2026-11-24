import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ChevronDown, LayoutDashboard, LogOut, Menu, Settings } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { loginDemoRole, logoutUser } from "../../api/auth";
import { IS_DEMO_MODE } from "../../api/demoStore";
import Avatar from "../ds/Avatar";
import BottomSheet from "../ds/BottomSheet";
import Breadcrumb from "../ds/Breadcrumb";
import StatusBadge from "../ds/StatusBadge";
import { ISHARA_EASE, usePrefersReducedMotion } from "../ds/MotionPrimitives";

function getAdminBreadcrumbs(pathname) {
  const root = { label: "Administration", to: "/admin" };

  if (pathname === "/admin" || pathname === "/admin/") {
    return [{ label: "Administration" }, { label: "Overview" }];
  }
  if (pathname === "/admin/users") {
    return [root, { label: "Users" }];
  }
  if (pathname === "/admin/users/add") {
    return [root, { label: "Users", to: "/admin/users" }, { label: "Add user" }];
  }
  if (pathname.startsWith("/admin/users/edit/")) {
    return [root, { label: "Users", to: "/admin/users" }, { label: "Edit user" }];
  }
  if (pathname === "/admin/psl-dictionary") {
    return [root, { label: "PSL dictionary" }];
  }
  if (pathname === "/admin/psl-dictionary/add") {
    return [
      root,
      { label: "PSL dictionary", to: "/admin/psl-dictionary" },
      { label: "Add sign" },
    ];
  }
  if (pathname.startsWith("/admin/psl-dictionary/edit/")) {
    return [
      root,
      { label: "PSL dictionary", to: "/admin/psl-dictionary" },
      { label: "Edit sign" },
    ];
  }
  if (pathname === "/admin/knowledge-base") {
    return [root, { label: "Knowledge base" }];
  }
  if (pathname === "/admin/knowledge-base/add") {
    return [
      root,
      { label: "Knowledge base", to: "/admin/knowledge-base" },
      { label: "Add article" },
    ];
  }
  if (pathname.startsWith("/admin/knowledge-base/edit/")) {
    return [
      root,
      { label: "Knowledge base", to: "/admin/knowledge-base" },
      { label: "Edit article" },
    ];
  }
  if (pathname === "/admin/system-logs") {
    return [root, { label: "System logs" }];
  }
  if (pathname === "/admin/processing-activity") {
    return [root, { label: "Processing activity" }];
  }
  if (pathname === "/admin/profile-settings") {
    return [root, { label: "Profile & settings" }];
  }

  return [root];
}

function AdminHeader({ user, onOpenMobileMenu, mobileMenuOpen }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );
  const popoverRef = useRef(null);
  const reduced = usePrefersReducedMotion();

  const name = user?.full_name?.trim() || user?.email || "Administrator";
  const breadcrumbs = getAdminBreadcrumbs(location.pathname);
  const currentBreadcrumb = breadcrumbs[breadcrumbs.length - 1]?.label || "Administration";

  useEffect(() => {
    document.title = `${currentBreadcrumb} — ISHARA AI Admin`;
  }, [currentBreadcrumb]);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    function handleResize() {
      setIsMobileViewport(window.innerWidth < 768);
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!menuOpen || isMobileViewport) return undefined;

    function handleClickOutside(event) {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [menuOpen, isMobileViewport]);

  function handleLogout() {
    logoutUser();
    navigate("/login", { replace: true });
  }

  async function handleSwitchToDemoUser() {
    setMenuOpen(false);
    await loginDemoRole("user");
    navigate("/dashboard");
  }

  return (
    <header className="ds-admin-header">
      <div className="ds-admin-header-start">
        <button
          type="button"
          className="ds-icon-btn ds-admin-hamburger"
          onClick={onOpenMobileMenu}
          aria-label="Open navigation menu"
          aria-expanded={mobileMenuOpen}
        >
          <Menu size={22} strokeWidth={1.75} aria-hidden="true" />
        </button>

        <h3 className="sr-only">Administration</h3>
        <Breadcrumb items={breadcrumbs} />
      </div>

      <div className="ds-popover-wrap" ref={popoverRef}>
        <button
          type="button"
          className="ds-admin-account-trigger"
          onClick={() => setMenuOpen((open) => !open)}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          aria-label={`Account menu for ${name}`}
        >
          <Avatar name={name} size="sm" fallback="AD" />
          <div className="ds-admin-account-text">
            <strong>{name}</strong>
            {user?.email && <small>{user.email}</small>}
          </div>
          <ChevronDown
            size={16}
            strokeWidth={2}
            aria-hidden="true"
            style={{
              transform: menuOpen ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform var(--ds-dur-fast) var(--ds-ease-standard)",
            }}
          />
        </button>

        <AnimatePresence>
          {menuOpen && !isMobileViewport && (
            <motion.div
              className="ds-popover-menu"
              role="menu"
              aria-label="Account options"
              initial={reduced ? { opacity: 1 } : { opacity: 0, y: -6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, y: -4, scale: 0.98 }}
              transition={{ duration: reduced ? 0.01 : 0.16, ease: ISHARA_EASE }}
            >
              <div className="ds-popover-header">
                <Avatar name={name} size="md" fallback="AD" />
                <div className="ds-popover-identity">
                  <strong>{name}</strong>
                  {user?.email && <small>{user.email}</small>}
                  <div style={{ marginBlockStart: "0.25rem" }}>
                    <StatusBadge status="Admin" />
                  </div>
                </div>
              </div>

              <Link
                to="/admin/profile-settings"
                className="ds-menu-item"
                role="menuitem"
                onClick={() => setMenuOpen(false)}
              >
                <Settings size={17} strokeWidth={1.75} aria-hidden="true" />
                <span>Profile &amp; settings</span>
              </Link>
              {IS_DEMO_MODE ? (
                <button
                  type="button"
                  className="ds-menu-item"
                  role="menuitem"
                  onClick={handleSwitchToDemoUser}
                >
                  <LayoutDashboard size={17} strokeWidth={1.75} aria-hidden="true" />
                  <span>Switch to Demo User</span>
                </button>
              ) : (
                <Link
                  to="/dashboard"
                  className="ds-menu-item"
                  role="menuitem"
                  onClick={() => setMenuOpen(false)}
                >
                  <LayoutDashboard size={17} strokeWidth={1.75} aria-hidden="true" />
                  <span>User workspace</span>
                </Link>
              )}
              <button
                type="button"
                className="ds-menu-item ds-menu-item--danger"
                role="menuitem"
                onClick={handleLogout}
              >
                <LogOut size={17} strokeWidth={1.75} aria-hidden="true" />
                <span>Sign out</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {isMobileViewport && (
        <BottomSheet
          open={menuOpen}
          onClose={() => setMenuOpen(false)}
          title="Administrator account"
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--ds-space-4)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--ds-space-3)" }}>
              <Avatar name={name} size="md" fallback="AD" />
              <div style={{ minInlineSize: 0 }}>
                <strong style={{ display: "block" }}>{name}</strong>
                {user?.email && (
                  <span style={{ display: "block", fontSize: "0.875rem", color: "var(--ds-text-muted)", wordBreak: "break-word" }}>
                    {user.email}
                  </span>
                )}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "var(--ds-space-2)" }}>
              <Link
                to="/admin/profile-settings"
                className="ds-menu-item"
                onClick={() => setMenuOpen(false)}
              >
                <Settings size={18} strokeWidth={1.75} aria-hidden="true" />
                <span>Profile &amp; settings</span>
              </Link>
              {IS_DEMO_MODE ? (
                <button
                  type="button"
                  className="ds-menu-item"
                  onClick={handleSwitchToDemoUser}
                >
                  <LayoutDashboard size={18} strokeWidth={1.75} aria-hidden="true" />
                  <span>Switch to Demo User</span>
                </button>
              ) : (
                <Link
                  to="/dashboard"
                  className="ds-menu-item"
                  onClick={() => setMenuOpen(false)}
                >
                  <LayoutDashboard size={18} strokeWidth={1.75} aria-hidden="true" />
                  <span>User workspace</span>
                </Link>
              )}
              <button
                type="button"
                className="ds-menu-item ds-menu-item--danger"
                onClick={handleLogout}
              >
                <LogOut size={18} strokeWidth={1.75} aria-hidden="true" />
                <span>Sign out</span>
              </button>
            </div>
          </div>
        </BottomSheet>
      )}
    </header>
  );
}

export default AdminHeader;
