import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ChevronDown,
  History,
  LayoutDashboard,
  LogOut,
  Settings,
  ShieldCheck,
  Upload,
  UserRound,
  Video,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { loginDemoRole, logoutUser } from "../../api/auth";
import { IS_DEMO_MODE } from "../../api/demoStore";
import Avatar from "./Avatar";
import BottomSheet from "./BottomSheet";
import Logo from "./Logo";
import StatusBadge from "./StatusBadge";
import {
  ISHARA_EASE,
  NavActiveIndicator,
  PageTransition,
  usePrefersReducedMotion,
} from "./MotionPrimitives";

function applyUserAccessibilityPrefs() {
  try {
    const stored = JSON.parse(localStorage.getItem("isharaUserSettings") || "{}");
    document.body.classList.toggle("ds-pref-larger-text", Boolean(stored.largerText));
    document.body.classList.toggle("ds-pref-reduce-motion", Boolean(stored.reduceMotion));
  } catch {
    // Ignore storage read issues
  }
}

const NAV_ITEMS = [
  {
    path: "/dashboard",
    label: "Dashboard",
    mobileLabel: "Home",
    ariaLabel: "Dashboard",
    Icon: LayoutDashboard,
  },
  {
    path: "/dashboard/live-camera",
    label: "Live Camera",
    mobileLabel: "Camera",
    ariaLabel: "Live Camera",
    Icon: Video,
  },
  {
    path: "/dashboard/upload-video",
    label: "Upload Video",
    mobileLabel: "Upload",
    ariaLabel: "Upload Video",
    Icon: Upload,
  },
  {
    path: "/dashboard/translation-history",
    label: "History",
    mobileLabel: "History",
    ariaLabel: "Translation History",
    Icon: History,
  },
  {
    path: "/dashboard/profile-settings",
    label: "Profile",
    mobileLabel: "Profile",
    ariaLabel: "Profile and Settings",
    Icon: UserRound,
  },
];

export default function UserShell({
  user,
  onLogout,
  pageTitle = "Dashboard",
  children,
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const mainRef = useRef(null);
  const desktopPopoverRef = useRef(null);
  const [accountSheetOpen, setAccountSheetOpen] = useState(false);
  const [desktopMenuOpen, setDesktopMenuOpen] = useState(false);
  const reduced = usePrefersReducedMotion();

  const name = user?.full_name?.trim() || "there";
  const email = user?.email || "";
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    document.title = `${pageTitle} — ISHARA AI`;
  }, [pageTitle]);

  useEffect(() => {
    applyUserAccessibilityPrefs();

    function handlePrefsSync() {
      applyUserAccessibilityPrefs();
    }

    window.addEventListener("ishara:user-prefs-updated", handlePrefsSync);
    window.addEventListener("storage", handlePrefsSync);
    return () => {
      window.removeEventListener("ishara:user-prefs-updated", handlePrefsSync);
      window.removeEventListener("storage", handlePrefsSync);
      document.body.classList.remove("ds-pref-larger-text", "ds-pref-reduce-motion");
    };
  }, []);

  useEffect(() => {
    setAccountSheetOpen(false);
    setDesktopMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!desktopMenuOpen) return undefined;

    function handleClickOutside(event) {
      if (desktopPopoverRef.current && !desktopPopoverRef.current.contains(event.target)) {
        setDesktopMenuOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setDesktopMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [desktopMenuOpen]);

  function handleSignOut() {
    if (typeof onLogout === "function") {
      onLogout();
      return;
    }
    logoutUser();
    navigate("/login", { replace: true });
  }

  async function handleSwitchToDemoAdmin() {
    setDesktopMenuOpen(false);
    setAccountSheetOpen(false);
    await loginDemoRole("admin");
    navigate("/admin");
  }

  return (
    <div className="ds-user-shell">
      <a className="ds-skip-link" href="#user-main-content">
        Skip to main content
      </a>

      <header className="ds-user-topbar">
        <div className="ds-user-topbar-inner">
          <Logo to="/dashboard" surface="light" ariaLabel="Ishara.ai dashboard" />

          <nav className="ds-user-nav" aria-label="User dashboard navigation">
            {NAV_ITEMS.map(({ path, label, ariaLabel }) => {
              const isCurrent = location.pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  className="ds-user-nav-link"
                  aria-label={ariaLabel}
                  aria-current={isCurrent ? "page" : undefined}
                >
                  <span>{label}</span>
                  {isCurrent && (
                    <NavActiveIndicator
                      layoutId="user-top-nav-pill"
                      className="ds-user-nav-pill"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="ds-user-account-desktop ds-popover-wrap" ref={desktopPopoverRef}>
            <button
              type="button"
              className="ds-user-account-trigger"
              onClick={() => setDesktopMenuOpen((open) => !open)}
              aria-haspopup="menu"
              aria-expanded={desktopMenuOpen}
              aria-label={`Account menu for ${name}`}
            >
              <Avatar name={name} size="sm" />
              <span className="ds-user-account-name" title={name}>
                {name}
              </span>
              <ChevronDown
                size={15}
                strokeWidth={2}
                aria-hidden="true"
                style={{
                  transform: desktopMenuOpen ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform var(--ds-dur-fast) var(--ds-ease-standard)",
                }}
              />
            </button>

            <AnimatePresence>
              {desktopMenuOpen && (
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
                    <Avatar name={name} size="md" />
                    <div className="ds-popover-identity">
                      <strong>{name}</strong>
                      {email && <small>{email}</small>}
                      <div style={{ marginBlockStart: "0.25rem" }}>
                        <StatusBadge status={isAdmin ? "Admin" : "User"} />
                      </div>
                    </div>
                  </div>

                  <Link
                    to="/dashboard/profile-settings"
                    className="ds-menu-item"
                    role="menuitem"
                    onClick={() => setDesktopMenuOpen(false)}
                  >
                    <Settings size={17} strokeWidth={1.75} aria-hidden="true" />
                    <span>Profile &amp; settings</span>
                  </Link>

                  {IS_DEMO_MODE ? (
                    <button
                      type="button"
                      className="ds-menu-item"
                      role="menuitem"
                      onClick={handleSwitchToDemoAdmin}
                    >
                      <ShieldCheck size={17} strokeWidth={1.75} aria-hidden="true" />
                      <span>Switch to Demo Admin</span>
                    </button>
                  ) : (
                    isAdmin && (
                      <Link
                        to="/admin"
                        className="ds-menu-item"
                        role="menuitem"
                        onClick={() => setDesktopMenuOpen(false)}
                      >
                        <ShieldCheck size={17} strokeWidth={1.75} aria-hidden="true" />
                        <span>Admin panel</span>
                      </Link>
                    )
                  )}

                  <button
                    type="button"
                    className="ds-menu-item ds-menu-item--danger"
                    role="menuitem"
                    onClick={handleSignOut}
                  >
                    <LogOut size={17} strokeWidth={1.75} aria-hidden="true" />
                    <span>Sign out</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            type="button"
            className="ds-user-mobile-account-btn"
            onClick={() => setAccountSheetOpen(true)}
            aria-label={`Open account menu for ${name}`}
            aria-haspopup="dialog"
            aria-expanded={accountSheetOpen}
          >
            <Avatar name={name} size="sm" />
          </button>
        </div>
      </header>

      <main
        id="user-main-content"
        ref={mainRef}
        tabIndex={-1}
        className="ds-user-main"
      >
        <PageTransition key={location.pathname}>
          {children}
        </PageTransition>
      </main>

      <nav className="ds-user-bottom-nav" aria-label="Mobile dashboard navigation">
        {NAV_ITEMS.map(({ path, mobileLabel, ariaLabel, Icon }) => {
          const isCurrent = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className="ds-bottom-tab"
              aria-label={ariaLabel}
              aria-current={isCurrent ? "page" : undefined}
            >
              {isCurrent && (
                <NavActiveIndicator
                  layoutId="user-bottom-nav-pill"
                  className="ds-bottom-tab-indicator"
                />
              )}
              <Icon size={22} strokeWidth={1.75} aria-hidden="true" />
              <span>{mobileLabel}</span>
            </Link>
          );
        })}
      </nav>

      <BottomSheet
        open={accountSheetOpen}
        onClose={() => setAccountSheetOpen(false)}
        title="Account"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--ds-space-4)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--ds-space-3)" }}>
            <Avatar name={name} size="md" />
            <div style={{ minInlineSize: 0 }}>
              <strong style={{ display: "block", fontSize: "1rem" }}>{name}</strong>
              {email && (
                <span style={{ display: "block", fontSize: "0.875rem", color: "var(--ds-text-muted)", wordBreak: "break-word" }}>
                  {email}
                </span>
              )}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "var(--ds-space-2)" }}>
            <Link
              to="/dashboard/profile-settings"
              className="ds-menu-item"
              onClick={() => setAccountSheetOpen(false)}
            >
              <UserRound size={18} strokeWidth={1.75} aria-hidden="true" />
              <span>Profile / Settings</span>
            </Link>
            {IS_DEMO_MODE ? (
              <button
                type="button"
                className="ds-menu-item"
                onClick={handleSwitchToDemoAdmin}
              >
                <ShieldCheck size={18} strokeWidth={1.75} aria-hidden="true" />
                <span>Switch to Demo Admin</span>
              </button>
            ) : (
              isAdmin && (
                <Link
                  to="/admin"
                  className="ds-menu-item"
                  onClick={() => setAccountSheetOpen(false)}
                >
                  <ShieldCheck size={18} strokeWidth={1.75} aria-hidden="true" />
                  <span>Admin panel</span>
                </Link>
              )
            )}
            <button
              type="button"
              className="ds-menu-item ds-menu-item--danger"
              onClick={handleSignOut}
            >
              <LogOut size={18} strokeWidth={1.75} aria-hidden="true" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
}
