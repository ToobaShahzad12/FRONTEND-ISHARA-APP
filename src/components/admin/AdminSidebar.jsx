import { NavLink } from "react-router-dom";
import {
  Activity,
  BookOpenText,
  Hand,
  LayoutDashboard,
  ScrollText,
  Settings,
  Users,
  X,
} from "lucide-react";
import Drawer from "../ds/Drawer";
import HandTrace from "../ds/HandTrace";
import { NavActiveIndicator } from "../ds/MotionPrimitives";

const NAV_GROUPS = [
  {
    group: "Overview",
    items: [
      { label: "Overview", path: "/admin", Icon: LayoutDashboard, end: true },
    ],
  },
  {
    group: "People",
    items: [
      { label: "Users", path: "/admin/users", Icon: Users },
    ],
  },
  {
    group: "Content",
    items: [
      { label: "PSL dictionary", path: "/admin/psl-dictionary", Icon: Hand },
      { label: "Knowledge base", path: "/admin/knowledge-base", Icon: BookOpenText },
    ],
  },
  {
    group: "Operations",
    items: [
      { label: "System logs", path: "/admin/system-logs", Icon: ScrollText },
      { label: "Processing activity", path: "/admin/processing-activity", Icon: Activity },
    ],
  },
  {
    group: "Account",
    items: [
      { label: "Profile & settings", path: "/admin/profile-settings", Icon: Settings },
    ],
  },
];

function SidebarContent({ onNavigate, onCloseMobile, isDrawer = false }) {
  const layoutId = isDrawer ? "admin-drawer-active" : "admin-sidebar-active";

  return (
    <div className="ds-admin-sidebar-inner">
      <div
        className="ds-admin-brand"
        style={{ justifyContent: isDrawer ? "space-between" : "flex-start" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", minInlineSize: 0 }}>
          <span className="ds-logo-badge" aria-hidden="true">
            <HandTrace variant="mark" />
          </span>
          <div className="ds-admin-brand-text">
            <h2
              style={{
                fontFamily: "var(--ds-font-display)",
                fontWeight: 700,
                fontSize: "1.375rem",
                letterSpacing: "-0.02em",
                textTransform: "lowercase",
                color: "var(--ds-text-primary)",
                lineHeight: 1.05,
              }}
            >
              ishara<span style={{ color: "var(--ds-bg-brand)" }}>.ai</span>
            </h2>
            <span className="ds-admin-brand-eyebrow">ADMIN</span>
          </div>
        </div>

        {isDrawer && (
          <button
            type="button"
            className="ds-icon-btn"
            onClick={onCloseMobile}
            aria-label="Close navigation menu"
          >
            <X size={20} strokeWidth={2} aria-hidden="true" />
          </button>
        )}
      </div>

      <nav className="ds-admin-nav" aria-label="Administration navigation">
        {NAV_GROUPS.map(({ group, items }) => (
          <div className="ds-admin-group" key={group}>
            <span className="ds-admin-group-label">{group}</span>
            {items.map(({ label, path, Icon, end }) => (
              <NavLink
                key={path}
                to={path}
                end={Boolean(end)}
                onClick={onNavigate}
                aria-label={label}
                title={label}
                className={({ isActive }) =>
                  `ds-admin-nav-link ${isActive ? "active" : ""}`.trim()
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <NavActiveIndicator
                        layoutId={layoutId}
                        className="ds-admin-nav-active-pill"
                      />
                    )}
                    <Icon size={20} strokeWidth={1.75} aria-hidden="true" />
                    <span className="ds-admin-nav-text">{label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>
    </div>
  );
}

function AdminSidebar({ mobileOpen = false, onCloseMobile }) {
  return (
    <>
      <aside className="ds-admin-sidebar-desktop" aria-label="Admin sidebar">
        <SidebarContent />
      </aside>

      <Drawer
        open={mobileOpen}
        onClose={onCloseMobile}
        ariaLabel="Administration navigation menu"
      >
        <SidebarContent
          isDrawer
          onCloseMobile={onCloseMobile}
          onNavigate={onCloseMobile}
        />
      </Drawer>
    </>
  );
}

export default AdminSidebar;
