import { useState } from "react";
import { Check, Copy, FileText } from "lucide-react";
import Button from "./Button";
import HandTrace from "./HandTrace";
import Spinner from "./Spinner";
import StatusBadge from "./StatusBadge";

/**
 * Non-routed placeholder surface reserved for future PSL translation results.
 * Never mounted on any active route until backend translation integration exists.
 */
export default function TranslationResult({
  record = null,
  videoUrl = "",
  state = "unavailable",
  onRetry,
}) {
  const [copied, setCopied] = useState(false);

  const sourceName =
    record?.source || record?.file_name || record?.fileName || "Recording";
  const createdAt = record?.created_at || record?.createdAt || record?.date;
  const durationSeconds = record?.duration_seconds ?? record?.duration;
  const resultText = record?.translation_text || record?.text || "";
  const status = record?.status || (state === "unavailable" ? "Pending" : state);

  function handleCopy() {
    if (!resultText || !navigator.clipboard) return;
    navigator.clipboard.writeText(resultText).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  }

  return (
    <section className="ds-translation-result" aria-label="Translation result">
      <div>
        <div
          className="ds-stage-viewport"
          style={{ borderRadius: "var(--ds-radius-md)" }}
          aria-label={`Source video for ${sourceName}`}
        >
          {videoUrl ? (
            <video className="ds-stage-video ds-stage-video--contain" src={videoUrl} controls playsInline />
          ) : (
            <div className="ds-stage-placeholder">
              <span className="ds-body-s" style={{ color: "var(--ds-text-on-brand-secondary)" }}>
                {sourceName}
              </span>
            </div>
          )}
        </div>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            gap: "var(--ds-space-2)",
            marginBlockStart: "var(--ds-space-3)",
            color: "var(--ds-text-muted)",
            fontSize: "0.875rem",
          }}
        >
          <strong>{sourceName}</strong>
          <span className="ds-tabular">
            {Number.isFinite(durationSeconds) ? `${Math.floor(durationSeconds)}s` : ""}
            {createdAt ? ` · ${String(createdAt)}` : ""}
          </span>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", gap: "var(--ds-space-4)" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "var(--ds-space-3)",
            paddingBlockEnd: "var(--ds-space-3)",
            borderBlockEnd: "1px solid var(--ds-border-divider)",
          }}
        >
          <h3 className="ds-h3">Translation</h3>
          <StatusBadge status={status} />
        </div>

        {state === "empty" ? (
          <p className="ds-body" style={{ color: "var(--ds-text-secondary)" }}>
            Nothing selected yet. Record signing with your camera or choose a PSL video.
          </p>
        ) : state === "processing" ? (
          <div style={{ display: "flex", alignItems: "center", gap: "var(--ds-space-3)" }} aria-live="polite">
            <Spinner />
            <span className="ds-body">Translating…</span>
          </div>
        ) : state === "completed" && resultText ? (
          <>
            <div
              dir="auto"
              className="ds-body-l"
              style={{
                maxBlockSize: "20rem",
                overflowY: "auto",
                maxInlineSize: "68ch",
              }}
            >
              {resultText}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "var(--ds-space-3)",
                paddingBlockStart: "var(--ds-space-3)",
                borderBlockStart: "1px solid var(--ds-border-divider)",
              }}
            >
              <span className="ds-caption" style={{ color: "var(--ds-text-muted)" }}>
                {record?.source_language || "Pakistan Sign Language"}
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: "var(--ds-space-2)" }}>
                {copied && (
                  <span role="status" className="ds-caption" style={{ color: "var(--ds-status-success)" }}>
                    Copied
                  </span>
                )}
                <Button variant="secondary" size="sm" onClick={handleCopy}>
                  {copied ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
                  <span>Copy text</span>
                </Button>
              </div>
            </div>
          </>
        ) : state === "failed" ? (
          <div className="ds-alert ds-alert--error" role="alert">
            <div className="ds-alert-body">
              <p>{record?.error_message || "Translation could not be completed."}</p>
              {onRetry && (
                <div style={{ marginBlockStart: "var(--ds-space-3)" }}>
                  <Button variant="secondary" size="sm" onClick={onRetry}>
                    Try again
                  </Button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "var(--ds-space-3)" }}>
            <span className="ds-empty-icon" style={{ inlineSize: "3rem", blockSize: "3rem" }} aria-hidden="true">
              <FileText size={22} strokeWidth={1.75} />
            </span>
            <h4 className="ds-h4">Translation isn’t available yet</h4>
            <p className="ds-body-s" style={{ color: "var(--ds-text-secondary)" }}>
              Translation results will appear here once translation is available. Your recording has not been submitted.
            </p>
            <div style={{ color: "var(--ds-text-link)", opacity: 0.4 }}>
              <HandTrace variant="trail" />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
