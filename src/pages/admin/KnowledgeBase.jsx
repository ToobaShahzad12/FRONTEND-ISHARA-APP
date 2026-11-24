import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FileText,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import {
  deleteKnowledgeArticle,
  getAllKnowledgeArticles,
  updateKnowledgeArticle,
} from "../../api/admin";
import { IS_DEMO_MODE } from "../../api/demoStore";
import AuthFeedback from "../../components/AuthFeedback";
import AdminDemoNotice from "../../components/admin/AdminDemoNotice";
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

const CATEGORIES = [
  "All categories",
  "Translation",
  "Recording",
  "Policy",
  "Support",
  "PSL dictionary",
  "Video guidance",
];

const STATUSES = ["All statuses", "Published", "Draft"];

function formatDate(dateValue) {
  if (!dateValue) return "Not available";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) return "Not available";

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function displayStatus(status) {
  return status?.toLowerCase() === "published" ? "Published" : "Draft";
}

export default function KnowledgeBase() {
  const navigate = useNavigate();
  const location = useLocation();
  const noticeFromState = location.state?.message || "";

  const [articles, setArticles] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All categories");
  const [status, setStatus] = useState("All statuses");
  const [sortOrder, setSortOrder] = useState("recent");
  const [currentPage, setCurrentPage] = useState(1);
  const [manageArticle, setManageArticle] = useState(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const articlesPerPage = 6;

  useEffect(() => {
    document.title = "Knowledge base — ISHARA AI Admin";
  }, []);

  // Fetch articles from the backend.
  const fetchArticles = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getAllKnowledgeArticles();

      setArticles(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Unable to load Knowledge Base articles.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;

    getAllKnowledgeArticles()
      .then((data) => {
        if (active) setArticles(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (active) {
          setError(err.message || "Unable to load Knowledge Base articles.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  // Search, filter and sort articles.
  const filteredArticles = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    const result = articles.filter((article) => {
      const matchesSearch =
        article.title?.toLowerCase().includes(searchText) ||
        article.category?.toLowerCase().includes(searchText) ||
        article.content?.toLowerCase().includes(searchText);

      const matchesCategory =
        category === "All categories" || article.category === category;

      const matchesStatus =
        status === "All statuses" || displayStatus(article.status) === status;

      return matchesSearch && matchesCategory && matchesStatus;
    });

    return [...result].sort((a, b) => {
      if (sortOrder === "alphabetical") {
        return (a.title || "").localeCompare(b.title || "");
      }

      const dateA = new Date(a.updated_at || a.created_at).getTime() || 0;
      const dateB = new Date(b.updated_at || b.created_at).getTime() || 0;

      if (sortOrder === "oldest") {
        return dateA - dateB;
      }

      return dateB - dateA;
    });
  }, [articles, search, category, status, sortOrder]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredArticles.length / articlesPerPage)
  );

  const visibleArticles = filteredArticles.slice(
    (currentPage - 1) * articlesPerPage,
    currentPage * articlesPerPage
  );

  // Change article status through the backend.
  const handleStatusChange = async (article) => {
    const newStatus = article.status === "published" ? "draft" : "published";

    try {
      setActionLoading(true);
      setError("");

      const updatedArticle = await updateKnowledgeArticle(article.id, {
        title: article.title,
        content: article.content,
        category: article.category,
        status: newStatus,
      });

      setArticles((previous) =>
        previous.map((item) =>
          item.id === article.id ? updatedArticle : item
        )
      );

      setManageArticle(updatedArticle);
    } catch (err) {
      setError(err.message || "Unable to update article status.");
    } finally {
      setActionLoading(false);
    }
  };

  // Delete article through the backend.
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this article?"
    );

    if (!confirmed) return;

    try {
      setActionLoading(true);
      setError("");

      await deleteKnowledgeArticle(id);

      const updatedArticles = articles.filter((article) => article.id !== id);

      setArticles(updatedArticles);
      setManageArticle(null);

      const filteredCount = updatedArticles.filter((article) => {
        const searchText = search.trim().toLowerCase();

        const matchesSearch =
          article.title?.toLowerCase().includes(searchText) ||
          article.category?.toLowerCase().includes(searchText) ||
          article.content?.toLowerCase().includes(searchText);

        const matchesCategory =
          category === "All categories" || article.category === category;

        const matchesStatus =
          status === "All statuses" || displayStatus(article.status) === status;

        return matchesSearch && matchesCategory && matchesStatus;
      }).length;

      const newTotalPages = Math.max(
        1,
        Math.ceil(filteredCount / articlesPerPage)
      );

      setCurrentPage((page) => Math.min(page, newTotalPages));
    } catch (err) {
      setError(err.message || "Unable to delete article.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSearch = (event) => {
    setSearch(event.target.value);
    setCurrentPage(1);
  };

  const handleCategory = (event) => {
    setCategory(event.target.value);
    setCurrentPage(1);
  };

  const handleStatus = (event) => {
    setStatus(event.target.value);
    setCurrentPage(1);
  };

  const handleSort = (event) => {
    setSortOrder(event.target.value);
    setCurrentPage(1);
  };

  const activeFilterCount =
    (category !== "All categories" ? 1 : 0) +
    (status !== "All statuses" ? 1 : 0);

  return (
    <StaggerContainer
      stagger={0.05}
      style={{ display: "flex", flexDirection: "column", gap: "var(--ds-space-5)" }}
    >
      {IS_DEMO_MODE && (
        <StaggerItem>
          <AdminDemoNotice>
            Showing sample Knowledge Base articles (Demo Data) for frontend preview.
          </AdminDemoNotice>
        </StaggerItem>
      )}

      <PageHeader
        eyebrow="Content"
        title="Knowledge base"
        description="Maintain trusted learning resources and platform guidance."
        actions={
          <Button
            variant="primary"
            onClick={() => navigate("/admin/knowledge-base/add")}
          >
            <Plus size={18} strokeWidth={2} aria-hidden="true" />
            <span>Add article</span>
          </Button>
        }
      />

      <AnimatePresence initial={false}>
        {noticeFromState && (
          <motion.div
            key="kb-notice"
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

        {error && (
          <motion.div
            key="kb-error"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: ISHARA_EASE }}
          >
            <AuthFeedback variant="error">
              <p>{error}</p>
              <div style={{ marginBlockStart: "var(--ds-space-2)" }}>
                <Button variant="secondary" size="sm" onClick={fetchArticles}>
                  Retry
                </Button>
              </div>
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
            <label htmlFor="kb-search" className="ds-sr-only">
              Search articles
            </label>
            <input
              id="kb-search"
              className="ds-input"
              type="text"
              placeholder="Search articles, categories, or keywords"
              value={search}
              onChange={handleSearch}
            />
            {search && (
              <button
                type="button"
                className="ds-search-clear"
                onClick={() => {
                  setSearch("");
                  setCurrentPage(1);
                }}
                aria-label="Clear search"
              >
                <X size={16} strokeWidth={2} aria-hidden="true" />
              </button>
            )}
          </div>

          <div className="ds-toolbar-filters ds-toolbar-filters--collapsible">
            <div className="ds-toolbar-filter-item">
              <label htmlFor="kb-category">Category</label>
              <select
                id="kb-category"
                className="ds-select ds-select--toolbar"
                value={category}
                onChange={handleCategory}
                aria-label="Filter by category"
              >
                {CATEGORIES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div className="ds-toolbar-filter-item">
              <label htmlFor="kb-status">Status</label>
              <select
                id="kb-status"
                className="ds-select ds-select--toolbar"
                value={status}
                onChange={handleStatus}
                aria-label="Filter by status"
              >
                {STATUSES.map((item) => (
                  <option key={item} value={item}>
                    {item}
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

      <StaggerItem>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "var(--ds-space-3)",
          }}
        >
          <span className="ds-body-sm" style={{ color: "var(--ds-text-muted)" }}>
            {loading
              ? "Loading articles..."
              : `${filteredArticles.length} articles`}
          </span>

          <div style={{ minInlineSize: "12rem" }}>
            <select
              value={sortOrder}
              onChange={handleSort}
              aria-label="Sort articles"
              className="ds-select ds-select--toolbar"
            >
              <option value="recent">Updated recently</option>
              <option value="oldest">Oldest first</option>
              <option value="alphabetical">Alphabetical</option>
            </select>
          </div>
        </div>
      </StaggerItem>

      <StaggerItem>
        <div className="ds-card" style={{ padding: "var(--ds-space-4) var(--ds-space-5)" }}>
        {loading ? (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "var(--ds-space-3)" }}
            role="status"
            aria-label="Loading Knowledge Base articles"
          >
            <Skeleton height="3.5rem" />
            <Skeleton height="3.5rem" />
            <Skeleton height="3.5rem" />
          </div>
        ) : visibleArticles.length > 0 ? (
          <div className="ds-ruled-list">
            {visibleArticles.map((article) => {
              const badgeText = displayStatus(article.status);
              return (
                <article
                  key={article.id}
                  className="ds-ruled-item"
                  style={{ flexWrap: "wrap" }}
                >
                  <div style={{ flex: "1 1 18rem", minInlineSize: 0 }}>
                    <h2 className="ds-h4" style={{ marginBlockEnd: "0.25rem" }}>
                      {article.title}
                    </h2>
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        alignItems: "center",
                        gap: "var(--ds-space-2)",
                        fontSize: "0.875rem",
                        color: "var(--ds-text-muted)",
                      }}
                    >
                      <StatusBadge status={article.category} tone="neutral" />
                      <span>
                        Updated {formatDate(article.updated_at || article.created_at)}
                      </span>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      alignItems: "center",
                      gap: "var(--ds-space-2)",
                    }}
                  >
                    <StatusBadge status={badgeText} />

                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() =>
                        navigate(`/admin/knowledge-base/edit/${article.id}`)
                      }
                    >
                      <Pencil size={14} strokeWidth={2} aria-hidden="true" />
                      <span>Edit</span>
                    </Button>

                    <Button
                      variant="tertiary"
                      size="sm"
                      onClick={() => setManageArticle(article)}
                    >
                      <MoreHorizontal size={16} strokeWidth={2} aria-hidden="true" />
                      <span>Manage</span>
                    </Button>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={FileText}
            title="No articles found."
            description="Try changing your search or filters."
          />
        )}

        <div
          className="ds-table-footer"
          style={{
            marginInline: "calc(-1 * var(--ds-space-5))",
            marginBlockEnd: "calc(-1 * var(--ds-space-4))",
            marginBlockStart: "var(--ds-space-4)",
            borderBottomLeftRadius: "var(--ds-radius-md)",
            borderBottomRightRadius: "var(--ds-radius-md)",
          }}
        >
          <span className="ds-tabular">
            Showing{" "}
            {filteredArticles.length === 0
              ? 0
              : (currentPage - 1) * articlesPerPage + 1}
            {" – "}
            {Math.min(currentPage * articlesPerPage, filteredArticles.length)}{" "}
            of {filteredArticles.length} articles
          </span>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
        </div>
      </StaggerItem>

      <BottomSheet
        open={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
        title="Filter articles"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--ds-space-4)" }}>
          <div className="ds-field">
            <label className="ds-field-label" htmlFor="mobile-kb-category">
              Category
            </label>
            <select
              id="mobile-kb-category"
              className="ds-select"
              value={category}
              onChange={handleCategory}
            >
              {CATEGORIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div className="ds-field">
            <label className="ds-field-label" htmlFor="mobile-kb-status">
              Status
            </label>
            <select
              id="mobile-kb-status"
              className="ds-select"
              value={status}
              onChange={handleStatus}
            >
              {STATUSES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <Button
            variant="primary"
            fullWidth
            onClick={() => setMobileFiltersOpen(false)}
          >
            Done
          </Button>
        </div>
      </BottomSheet>

      <BottomSheet
        open={Boolean(manageArticle)}
        onClose={() => {
          if (!actionLoading) setManageArticle(null);
        }}
        title="Manage article"
      >
        {manageArticle && (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--ds-space-4)" }}>
            <h3 className="ds-h3">{manageArticle.title}</h3>
            <p className="ds-body-sm" style={{ color: "var(--ds-text-secondary)" }}>
              {manageArticle.content?.length > 250
                ? `${manageArticle.content.slice(0, 250)}...`
                : manageArticle.content}
            </p>

            <dl className="ds-dl-grid">
              <div>
                <dt>Category</dt>
                <dd>{manageArticle.category}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>{displayStatus(manageArticle.status)}</dd>
              </div>
              <div>
                <dt>Updated</dt>
                <dd>
                  {formatDate(
                    manageArticle.updated_at || manageArticle.created_at
                  )}
                </dd>
              </div>
              <div>
                <dt>Article ID</dt>
                <dd>KB-00{manageArticle.id}</dd>
              </div>
            </dl>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--ds-space-3)" }}>
              <Button
                variant="danger-outline"
                onClick={() => handleDelete(manageArticle.id)}
                disabled={actionLoading}
              >
                {actionLoading ? "Please wait..." : "Delete"}
              </Button>

              <Button
                variant="secondary"
                onClick={() => handleStatusChange(manageArticle)}
                disabled={actionLoading}
              >
                {actionLoading
                  ? "Please wait..."
                  : manageArticle.status === "published"
                    ? "Move to draft"
                    : "Publish"}
              </Button>

              <Button
                variant="primary"
                onClick={() =>
                  navigate(`/admin/knowledge-base/edit/${manageArticle.id}`)
                }
                disabled={actionLoading}
              >
                Edit article
              </Button>
            </div>
          </div>
        )}
      </BottomSheet>
    </StaggerContainer>
  );
}
