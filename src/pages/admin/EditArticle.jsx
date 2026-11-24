import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { getKnowledgeArticleById } from "../../api/admin";
import Skeleton from "../../components/ds/Skeleton";
import ArticleForm from "./knowledge/ArticleForm";

export default function EditArticle() {
  const { articleId } = useParams();

  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    document.title = "Edit article — ISHARA AI Admin";
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function fetchArticle() {
      try {
        setLoading(true);
        setError("");

        const data = await getKnowledgeArticleById(articleId);

        if (isMounted) {
          setArticle(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Unable to load this article.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchArticle();

    return () => {
      isMounted = false;
    };
  }, [articleId]);

  if (loading) {
    return (
      <div
        role="status"
        aria-label="Loading article"
        style={{ display: "flex", flexDirection: "column", gap: "var(--ds-space-4)" }}
      >
        <Skeleton width="12rem" height="1.5rem" />
        <Skeleton width="20rem" height="2.5rem" />
        <Skeleton height="18rem" />
      </div>
    );
  }

  if (error || !article) {
    return <Navigate to="/admin/knowledge-base" replace />;
  }

  return <ArticleForm key={articleId} mode="edit" article={article} />;
}
