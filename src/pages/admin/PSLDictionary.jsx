import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, CheckCircle2, Plus, Search, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import {
  deletePSLSign,
  getAllPSLSigns,
  updatePSLSign,
} from "../../api/admin";
import { IS_DEMO_MODE } from "../../api/demoStore";
import AuthFeedback from "../../components/AuthFeedback";
import AdminDemoNotice from "../../components/admin/AdminDemoNotice";
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

const CATEGORY_FILTERS = ["All", "Greetings", "Food", "Travel"];
const STATUS_FILTERS = ["Draft", "Reviewed"];

function formatDate(dateValue) {
  if (!dateValue) return "—";

  return new Date(dateValue).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function PSLDictionary() {
  const navigate = useNavigate();

  const [signs, setSigns] = useState([]);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [processingId, setProcessingId] = useState(null);

  const entriesPerPage = 7;

  useEffect(() => {
    document.title = "PSL sign dictionary — ISHARA AI Admin";
  }, []);

  // Load dictionary entries from the backend.
  useEffect(() => {
    let isMounted = true;

    async function loadSigns() {
      try {
        setIsLoading(true);
        setError("");

        const data = await getAllPSLSigns();

        if (isMounted) {
          setSigns(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Unable to load PSL dictionary entries.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadSigns();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredSigns = useMemo(() => {
    return signs.filter((sign) => {
      const searchText = search.toLowerCase();

      const word = (sign.word || "").toLowerCase();
      const description = (sign.description || "").toLowerCase();
      const category = (sign.category || "").toLowerCase();

      const matchesSearch =
        word.includes(searchText) || description.includes(searchText);

      const matchesFilter =
        activeFilter === "All" ||
        (activeFilter === "Food" && category === "food & drink") ||
        (activeFilter === "Draft" && sign.status === "draft") ||
        (activeFilter === "Reviewed" && sign.status === "reviewed") ||
        category === activeFilter.toLowerCase();

      return matchesSearch && matchesFilter;
    });
  }, [signs, search, activeFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredSigns.length / entriesPerPage)
  );

  const visibleSigns = filteredSigns.slice(
    (currentPage - 1) * entriesPerPage,
    currentPage * entriesPerPage
  );

  const handleStatusUpdate = async (sign) => {
    const newStatus = sign.status === "reviewed" ? "draft" : "reviewed";

    try {
      setProcessingId(sign.id);
      setActionError("");

      const updatedSign = await updatePSLSign(sign.id, {
        word: sign.word,
        description: sign.description || "",
        category: sign.category,
        video_url: sign.video_url || null,
        image_url: sign.image_url || null,
        status: newStatus,
      });

      setSigns((previous) =>
        previous.map((item) => (item.id === sign.id ? updatedSign : item))
      );
    } catch (err) {
      setActionError(err.message || "Unable to update sign status.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this sign entry?"
    );

    if (!confirmed) return;

    try {
      setProcessingId(id);
      setActionError("");

      await deletePSLSign(id);

      const updatedSigns = signs.filter((sign) => sign.id !== id);

      setSigns(updatedSigns);

      const remainingCount = updatedSigns.filter((sign) => {
        const searchText = search.toLowerCase();

        const matchesSearch =
          (sign.word || "").toLowerCase().includes(searchText) ||
          (sign.description || "").toLowerCase().includes(searchText);

        const category = (sign.category || "").toLowerCase();

        const matchesFilter =
          activeFilter === "All" ||
          (activeFilter === "Food" && category === "food & drink") ||
          (activeFilter === "Draft" && sign.status === "draft") ||
          (activeFilter === "Reviewed" && sign.status === "reviewed") ||
          category === activeFilter.toLowerCase();

        return matchesSearch && matchesFilter;
      }).length;

      const newTotalPages = Math.max(
        1,
        Math.ceil(remainingCount / entriesPerPage)
      );

      setCurrentPage((page) => Math.min(page, newTotalPages));
    } catch (err) {
      setActionError(err.message || "Unable to delete sign entry.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    setCurrentPage(1);
  };

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
    setCurrentPage(1);
  };

  return (
    <StaggerContainer
      stagger={0.05}
      style={{ display: "flex", flexDirection: "column", gap: "var(--ds-space-5)" }}
    >
      {IS_DEMO_MODE && (
        <StaggerItem>
          <AdminDemoNotice>
            Showing sample PSL dictionary entries (Demo Data) stored in this browser session. Edits work locally without connecting to the backend.
          </AdminDemoNotice>
        </StaggerItem>
      )}

      <PageHeader
        eyebrow="Dictionary"
        title="PSL sign dictionary"
        description="Manage approved signs, glosses, video references and review status."
        actions={
          <Button
            variant="primary"
            onClick={() => navigate("/admin/psl-dictionary/add")}
          >
            <Plus size={18} strokeWidth={2} aria-hidden="true" />
            <span>Add sign entry</span>
          </Button>
        }
      />

      <AnimatePresence initial={false}>
        {error && (
          <motion.div
            key="psl-dict-error"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: ISHARA_EASE }}
          >
            <AuthFeedback variant="error">
              <p>{error}</p>
            </AuthFeedback>
          </motion.div>
        )}

        {actionError && (
          <motion.div
            key="psl-dict-action-error"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: ISHARA_EASE }}
          >
            <AuthFeedback variant="error">
              <p>{actionError}</p>
            </AuthFeedback>
          </motion.div>
        )}
      </AnimatePresence>

      <StaggerItem>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--ds-space-3)" }}>
        <div className="ds-search-wrap" style={{ maxInlineSize: "28rem" }}>
          <Search
            size={18}
            strokeWidth={1.75}
            className="ds-search-icon"
            aria-hidden="true"
          />
          <label htmlFor="psl-search" className="ds-sr-only">
            Search signs
          </label>
          <input
            id="psl-search"
            className="ds-input"
            type="text"
            placeholder="Search sign or English meaning"
            value={search}
            onChange={handleSearchChange}
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

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: "var(--ds-space-3)",
          }}
        >
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "var(--ds-space-2)" }} role="group" aria-label="Category filter">
            <span className="ds-body-sm" style={{ color: "var(--ds-text-muted)", fontWeight: 600 }}>
              Category:
            </span>
            {CATEGORY_FILTERS.map((filter) => (
              <button
                key={filter}
                type="button"
                className={`ds-chip ${activeFilter === filter ? "is-active" : ""}`.trim()}
                aria-pressed={activeFilter === filter}
                onClick={() => handleFilterChange(filter)}
              >
                {filter}
              </button>
            ))}
          </div>

          <span
            aria-hidden="true"
            style={{
              inlineSize: "1px",
              blockSize: "1.25rem",
              backgroundColor: "var(--ds-border-divider)",
            }}
          />

          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "var(--ds-space-2)" }} role="group" aria-label="Review status filter">
            <span className="ds-body-sm" style={{ color: "var(--ds-text-muted)", fontWeight: 600 }}>
              Review status:
            </span>
            {STATUS_FILTERS.map((filter) => (
              <button
                key={filter}
                type="button"
                className={`ds-chip ${activeFilter === filter ? "is-active" : ""}`.trim()}
                aria-pressed={activeFilter === filter}
                onClick={() => handleFilterChange(filter)}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
        </div>
      </StaggerItem>

      <StaggerItem>
        <div className="ds-table-card ds-table-card--responsive">
          <div className="ds-table-scroll">
          <table className="ds-table">
            <thead>
              <tr>
                <th scope="col">Sign label</th>
                <th scope="col">Category</th>
                <th scope="col" className="ds-col-hide-md">
                  Update date
                </th>
                <th scope="col">Review status</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>

            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="ds-table-empty-row">
                    <div
                      style={{ display: "flex", flexDirection: "column", gap: "var(--ds-space-3)" }}
                      role="status"
                      aria-label="Loading PSL dictionary entries"
                    >
                      <Skeleton height="2.75rem" />
                      <Skeleton height="2.75rem" />
                      <Skeleton height="2.75rem" />
                    </div>
                  </td>
                </tr>
              ) : visibleSigns.length > 0 ? (
                visibleSigns.map((sign) => (
                  <tr key={sign.id}>
                    <td className="ds-td-primary" data-label="Sign label">
                      <strong>{sign.word}</strong>
                    </td>

                    <td data-label="Category">{sign.category}</td>

                    <td data-label="Update date" className="ds-col-hide-md">
                      {formatDate(sign.updated_at || sign.created_at)}
                    </td>

                    <td data-label="Review status">
                      <StatusBadge
                        status={sign.status === "draft" ? "Draft" : "Reviewed"}
                      />
                    </td>

                    <td className="ds-td-actions" data-label="Actions">
                      <div style={{ display: "inline-flex", flexWrap: "wrap", gap: "var(--ds-space-2)" }}>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() =>
                            navigate(`/admin/psl-dictionary/edit/${sign.id}`)
                          }
                          disabled={processingId === sign.id}
                        >
                          Edit
                        </Button>

                        <Button
                          variant="tertiary"
                          size="sm"
                          onClick={() => handleStatusUpdate(sign)}
                          disabled={processingId === sign.id}
                        >
                          {processingId === sign.id ? "Saving..." : "Update"}
                        </Button>

                        <Button
                          variant="danger-outline"
                          size="sm"
                          onClick={() => handleDelete(sign.id)}
                          disabled={processingId === sign.id}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="ds-table-empty-row">
                    <EmptyState
                      icon={BookOpen}
                      title={
                        error
                          ? "Could not load sign entries."
                          : "No sign entries found."
                      }
                      description={
                        error
                          ? "Check your backend connection and refresh."
                          : "Try clearing your search or selecting All."
                      }
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="ds-table-footer">
          <span className="ds-tabular">
            Showing{" "}
            {filteredSigns.length === 0
              ? 0
              : (currentPage - 1) * entriesPerPage + 1}
            –{Math.min(currentPage * entriesPerPage, filteredSigns.length)} of{" "}
            {filteredSigns.length} entries
          </span>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
        </div>
      </StaggerItem>

      <StaggerItem>
        <p
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "var(--ds-space-2)",
            fontSize: "0.875rem",
            color: "var(--ds-text-muted)",
          }}
        >
          <CheckCircle2
            size={15}
            strokeWidth={2}
            style={{ color: "var(--ds-status-success)", flexShrink: 0 }}
            aria-hidden="true"
          />
          <span>
            {IS_DEMO_MODE
              ? "Demo Mode active — showing sample PSL dictionary entries (Demo Data)"
              : "Connected to the ISHARA AI database"}
          </span>
        </p>
      </StaggerItem>
    </StaggerContainer>
  );
}
