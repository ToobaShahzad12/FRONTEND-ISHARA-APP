import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BookOpen } from "lucide-react";
import { getPSLSignById } from "../../api/admin";
import Breadcrumb from "../../components/ds/Breadcrumb";
import Button from "../../components/ds/Button";
import EmptyState from "../../components/ds/EmptyState";
import Skeleton from "../../components/ds/Skeleton";
import PSLSignForm from "./psl/PSLSignForm";

export default function EditPSLSign() {
  const { signId } = useParams();
  const navigate = useNavigate();

  const [sign, setSign] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    document.title = "Edit PSL sign — ISHARA AI Admin";
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadSign() {
      try {
        setIsLoading(true);
        setError("");

        const data = await getPSLSignById(signId);

        if (isMounted) {
          setSign(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Unable to load this PSL sign.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadSign();

    return () => {
      isMounted = false;
    };
  }, [signId]);

  if (isLoading) {
    return (
      <div
        role="status"
        aria-label="Loading sign details"
        style={{ display: "flex", flexDirection: "column", gap: "var(--ds-space-4)" }}
      >
        <Skeleton width="12rem" height="1.5rem" />
        <Skeleton width="20rem" height="2.5rem" />
        <Skeleton height="18rem" />
      </div>
    );
  }

  if (error || !sign) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--ds-space-4)" }}>
        <Breadcrumb
          parentLabel="PSL dictionary"
          parentTo="/admin/psl-dictionary"
          items={[
            { label: "PSL dictionary", to: "/admin/psl-dictionary" },
            { label: "Unavailable" },
          ]}
        />
        <div className="ds-card" style={{ padding: "var(--ds-space-6)" }}>
          <EmptyState
            icon={BookOpen}
            title="PSL sign not found."
            description={error || "Unable to load this PSL sign."}
            actions={
              <Button
                variant="secondary"
                onClick={() => navigate("/admin/psl-dictionary")}
              >
                Back to PSL dictionary
              </Button>
            }
          />
        </div>
      </div>
    );
  }

  return <PSLSignForm key={signId} mode="edit" sign={sign} />;
}
