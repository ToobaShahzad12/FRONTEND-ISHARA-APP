import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Plus, Search, SlidersHorizontal, Users, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { deleteUser, getAllUsers } from "../../api/admin";
import { IS_DEMO_MODE } from "../../api/demoStore";
import AuthFeedback from "../../components/AuthFeedback";
import AdminDemoNotice from "../../components/admin/AdminDemoNotice";
import Avatar from "../../components/ds/Avatar";
import BottomSheet from "../../components/ds/BottomSheet";
import Button from "../../components/ds/Button";
import EmptyState from "../../components/ds/EmptyState";
import {
  ISHARA_EASE,
  StaggerContainer,
  StaggerItem,
} from "../../components/ds/MotionPrimitives";
import PageHeader from "../../components/ds/PageHeader";
import Pagination from "../../components/ds/Pagination";
import Skeleton from "../../components/ds/Skeleton";
import StatusBadge from "../../components/ds/StatusBadge";

const USERS_PER_PAGE = 8;

function formatDate(dateString) {
  if (!dateString) return "—";

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

export default function UserManagement() {
  const navigate = useNavigate();
  const location = useLocation();
  const noticeFromState = location.state?.message || "";

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [retry, setRetry] = useState(0);
  const [deletingUserId, setDeletingUserId] = useState(null);
  const [deleteError, setDeleteError] = useState("");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    document.title = "User management — ISHARA AI Admin";
  }, []);

  function formatUsers(data) {
    return data.map((user) => ({
      id: user.id,
      name: user.full_name || user.email,
      email: user.email,
      role: user.role === "admin" ? "Admin" : "User",
      // Keep access-pending and email-unverified accounts out of Active.
      status:
        user.status === "suspended"
          ? "Suspended"
          : user.status === "pending" || !user.is_verified
            ? "Pending"
            : "Active",
      joined: formatDate(user.created_at),
    }));
  }

  useEffect(() => {
    let active = true;
    getAllUsers()
      .then((data) => {
        if (active) {
          setUsers(formatUsers(data));
          setError("");
        }
      })
      .catch((requestError) => {
        if (active) setError(requestError.message || "Unable to load users.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [retry]);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const searchMatch =
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase());

      const roleMatch = roleFilter === "All" || user.role === roleFilter;

      const statusMatch =
        statusFilter === "All" || user.status === statusFilter;

      return searchMatch && roleMatch && statusMatch;
    });
  }, [users, search, roleFilter, statusFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredUsers.length / USERS_PER_PAGE)
  );

  const visibleUsers = filteredUsers.slice(
    (currentPage - 1) * USERS_PER_PAGE,
    currentPage * USERS_PER_PAGE
  );

  function updateSearch(value) {
    setSearch(value);
    setCurrentPage(1);
  }

  function updateRole(value) {
    setRoleFilter(value);
    setCurrentPage(1);
  }

  function updateStatus(value) {
    setStatusFilter(value);
    setCurrentPage(1);
  }

  async function handleDelete(user) {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${user.name}? This action cannot be undone.`
    );

    if (!confirmed) return;

    setDeletingUserId(user.id);
    setDeleteError("");

    try {
      await deleteUser(user.id);

      const updatedUsers = users.filter((item) => item.id !== user.id);

      setUsers(updatedUsers);

      const remainingPages = Math.max(
        1,
        Math.ceil(
          updatedUsers.filter((item) => {
            const searchMatch =
              item.name.toLowerCase().includes(search.toLowerCase()) ||
              item.email.toLowerCase().includes(search.toLowerCase());

            const roleMatch = roleFilter === "All" || item.role === roleFilter;

            const statusMatch =
              statusFilter === "All" || item.status === statusFilter;

            return searchMatch && roleMatch && statusMatch;
          }).length / USERS_PER_PAGE
        )
      );

      if (currentPage > remainingPages) {
        setCurrentPage(remainingPages);
      }
    } catch (requestError) {
      setDeleteError(requestError.message || "Unable to delete user.");
    } finally {
      setDeletingUserId(null);
    }
  }

  const activeFilterCount =
    (roleFilter !== "All" ? 1 : 0) + (statusFilter !== "All" ? 1 : 0);

  return (
    <StaggerContainer
      stagger={0.045}
      style={{ display: "flex", flexDirection: "column", gap: "var(--ds-space-5)" }}
    >
      {IS_DEMO_MODE && (
        <StaggerItem>
          <AdminDemoNotice>
            Showing sample user accounts (Demo Data) stored temporarily in this browser session. Changes reset when you clear your session.
          </AdminDemoNotice>
        </StaggerItem>
      )}

      <PageHeader
        eyebrow="Directory"
        title="User management"
        description="Review accounts, roles and access status."
        actions={
          <Button
            variant="primary"
            onClick={() => navigate("/admin/users/add")}
          >
            <Plus size={18} strokeWidth={2} aria-hidden="true" />
            <span>Add user</span>
          </Button>
        }
      />

      <AnimatePresence initial={false}>
        {noticeFromState && (
          <motion.div
            key="user-mgmt-notice"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: ISHARA_EASE }}
          >
            <AuthFeedback variant="success">
              <p>{noticeFromState}</p>
            </AuthFeedback>
          </motion.div>
        )}

        {deleteError && (
          <motion.div
            key="user-mgmt-delete-error"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: ISHARA_EASE }}
          >
            <AuthFeedback variant="error">
              <p>{deleteError}</p>
            </AuthFeedback>
          </motion.div>
        )}
      </AnimatePresence>

      <StaggerItem>
        <div className="ds-toolbar" style={{ marginBlockEnd: 0 }}>
          <div className="ds-search-wrap">
            <Search
              size={18}
              strokeWidth={1.75}
              className="ds-search-icon"
              aria-hidden="true"
            />
            <label htmlFor="user-search" className="ds-sr-only">
              Search users
            </label>
            <input
              id="user-search"
              className="ds-input"
              type="search"
              placeholder="Search by name or email"
              value={search}
              onChange={(event) => updateSearch(event.target.value)}
            />
            {search && (
              <button
                type="button"
                className="ds-search-clear"
                onClick={() => updateSearch("")}
                aria-label="Clear search"
              >
                <X size={16} strokeWidth={2} aria-hidden="true" />
              </button>
            )}
          </div>

          <div className="ds-toolbar-filters ds-toolbar-filters--collapsible">
            <div className="ds-toolbar-filter-item">
              <label htmlFor="users-role-filter">Role</label>
              <select
                id="users-role-filter"
                className="ds-select ds-select--toolbar"
                value={roleFilter}
                onChange={(event) => updateRole(event.target.value)}
              >
                {["All", "Admin", "User"].map((role) => (
                  <option key={role} value={role}>
                    {role === "All" ? "All roles" : role}
                  </option>
                ))}
              </select>
            </div>

            <div className="ds-toolbar-filter-item">
              <label htmlFor="users-status-filter">Status</label>
              <select
                id="users-status-filter"
                className="ds-select ds-select--toolbar"
                value={statusFilter}
                onChange={(event) => updateStatus(event.target.value)}
              >
                {["All", "Active", "Pending", "Suspended"].map((status) => (
                  <option key={status} value={status}>
                    {status === "All" ? "All statuses" : status}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Button
            variant="secondary"
            size="sm"
            className="ds-filter-trigger"
            onClick={() => setMobileFiltersOpen(true)}
          >
            <SlidersHorizontal size={16} strokeWidth={2} aria-hidden="true" />
            <span>
              Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
            </span>
          </Button>
        </div>
      </StaggerItem>

      <AnimatePresence initial={false}>
        {activeFilterCount > 0 && (
          <motion.div
            key="user-active-chips"
            className="ds-active-chips"
            aria-label="Active filters"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: ISHARA_EASE }}
          >
            {roleFilter !== "All" && (
              <button
                type="button"
                className="ds-chip is-active"
                onClick={() => updateRole("All")}
              >
                <span>Role: {roleFilter}</span>
                <X size={14} strokeWidth={2} aria-hidden="true" />
              </button>
            )}
            {statusFilter !== "All" && (
              <button
                type="button"
                className="ds-chip is-active"
                onClick={() => updateStatus("All")}
              >
                <span>Status: {statusFilter}</span>
                <X size={14} strokeWidth={2} aria-hidden="true" />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <StaggerItem>
        <div className="ds-table-card ds-table-card--responsive">
          <div className="ds-table-scroll">
          <table className="ds-table">
            <thead>
              <tr>
                <th scope="col">User</th>
                <th scope="col">Email</th>
                <th scope="col">Role</th>
                <th scope="col">Status</th>
                <th scope="col" className="ds-col-hide-md">
                  Joined
                </th>
                <th scope="col">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="ds-table-empty-row">
                    <div
                      style={{ display: "flex", flexDirection: "column", gap: "var(--ds-space-3)" }}
                      role="status"
                      aria-label="Loading users"
                    >
                      <Skeleton height="2.75rem" />
                      <Skeleton height="2.75rem" />
                      <Skeleton height="2.75rem" />
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="ds-table-empty-row">
                    <EmptyState
                      icon={Users}
                      title="Unable to load users"
                      description={error}
                      actions={
                        <Button
                          variant="secondary"
                          onClick={() => {
                            setLoading(true);
                            setRetry((value) => value + 1);
                          }}
                        >
                          Try again
                        </Button>
                      }
                    />
                  </td>
                </tr>
              ) : visibleUsers.length > 0 ? (
                visibleUsers.map((user) => (
                  <tr key={user.id}>
                    <td className="ds-td-primary" data-label="User">
                      <div style={{ display: "flex", alignItems: "center", gap: "var(--ds-space-3)" }}>
                        <Avatar name={user.name} size="sm" />
                        <div>
                          <strong style={{ display: "block" }}>{user.name}</strong>
                          <small style={{ color: "var(--ds-text-muted)", fontSize: "0.8125rem" }}>
                            ID: {user.id}
                          </small>
                        </div>
                      </div>
                    </td>

                    <td data-label="Email" style={{ wordBreak: "break-word" }}>
                      {user.email}
                    </td>

                    <td data-label="Role">
                      <StatusBadge status={user.role} />
                    </td>

                    <td data-label="Status">
                      <StatusBadge status={user.status} />
                    </td>

                    <td data-label="Joined" className="ds-col-hide-md">
                      {user.joined}
                    </td>

                    <td className="ds-td-actions" data-label="Actions">
                      <div style={{ display: "inline-flex", flexWrap: "wrap", gap: "var(--ds-space-2)" }}>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() =>
                            navigate(`/admin/users/edit/${user.id}`)
                          }
                        >
                          Edit
                        </Button>

                        <Button
                          variant="tertiary"
                          size="sm"
                          onClick={() =>
                            navigate(`/admin/users/edit/${user.id}`)
                          }
                        >
                          Manage
                        </Button>

                        <Button
                          variant="danger-outline"
                          size="sm"
                          disabled={
                            user.role === "Admin" || deletingUserId === user.id
                          }
                          onClick={() => handleDelete(user)}
                        >
                          {deletingUserId === user.id ? "Deleting..." : "Delete"}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="ds-table-empty-row">
                    <EmptyState
                      icon={Search}
                      title="No users found matching your search."
                      description="Try adjusting your search query, role filter, or status filter."
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {!loading && !error && (
          <div className="ds-table-footer">
            <span className="ds-tabular">
              Showing{" "}
              {filteredUsers.length === 0
                ? 0
                : (currentPage - 1) * USERS_PER_PAGE + 1}
              –
              {Math.min(currentPage * USERS_PER_PAGE, filteredUsers.length)} of{" "}
              {filteredUsers.length} users
            </span>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
        </div>
      </StaggerItem>

      <BottomSheet
        open={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
        title="Filter users"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--ds-space-4)" }}>
          <div className="ds-field">
            <label className="ds-field-label" htmlFor="mobile-users-role">
              Role
            </label>
            <select
              id="mobile-users-role"
              className="ds-select"
              value={roleFilter}
              onChange={(event) => updateRole(event.target.value)}
            >
              {["All", "Admin", "User"].map((role) => (
                <option key={role} value={role}>
                  {role === "All" ? "All roles" : role}
                </option>
              ))}
            </select>
          </div>

          <div className="ds-field">
            <label className="ds-field-label" htmlFor="mobile-users-status">
              Status
            </label>
            <select
              id="mobile-users-status"
              className="ds-select"
              value={statusFilter}
              onChange={(event) => updateStatus(event.target.value)}
            >
              {["All", "Active", "Pending", "Suspended"].map((status) => (
                <option key={status} value={status}>
                  {status === "All" ? "All statuses" : status}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: "flex", gap: "var(--ds-space-3)" }}>
            <Button
              variant="secondary"
              fullWidth
              onClick={() => {
                updateRole("All");
                updateStatus("All");
                setMobileFiltersOpen(false);
              }}
            >
              Reset
            </Button>
            <Button
              variant="primary"
              fullWidth
              onClick={() => setMobileFiltersOpen(false)}
            >
              Done
            </Button>
          </div>
        </div>
      </BottomSheet>
    </StaggerContainer>
  );
}
