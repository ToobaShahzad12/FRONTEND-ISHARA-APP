import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Info,
  ShieldCheck,
  UserRound,
} from "lucide-react";

const TONE_MAP = {
  active: { tone: "success", Icon: CheckCircle2 },
  completed: { tone: "success", Icon: CheckCircle2 },
  published: { tone: "success", Icon: CheckCircle2 },
  verified: { tone: "success", Icon: CheckCircle2 },
  connected: { tone: "success", Icon: CheckCircle2 },
  "camera ready": { tone: "success", Icon: CheckCircle2 },
  "video selected": { tone: "success", Icon: CheckCircle2 },
  pending: { tone: "warning", Icon: Clock },
  "pending verification": { tone: "warning", Icon: Clock },
  processing: { tone: "warning", Icon: Clock },
  "not verified": { tone: "warning", Icon: AlertTriangle },
  warn: { tone: "warning", Icon: AlertTriangle },
  suspended: { tone: "error", Icon: AlertCircle },
  failed: { tone: "error", Icon: AlertCircle },
  error: { tone: "error", Icon: AlertCircle },
  critical: { tone: "error", Icon: AlertCircle },
  "invalid file": { tone: "error", Icon: AlertCircle },
  reviewed: { tone: "info", Icon: Info },
  info: { tone: "info", Icon: Info },
  "demo data": { tone: "info", Icon: Info },
  "demo mode": { tone: "info", Icon: Info },
  "checking preview": { tone: "info", Icon: Info },
  admin: { tone: "brand", Icon: ShieldCheck },
  user: { tone: "neutral", Icon: UserRound },
  draft: { tone: "neutral", Icon: Info },
  recording: { tone: "error", Icon: null, recordingDot: true },
};

export default function StatusBadge({ status, label, tone: explicitTone, className = "" }) {
  const text = label || status || "Unknown";
  const key = String(text).trim().toLowerCase();
  const mapped = TONE_MAP[key];
  const tone = explicitTone || mapped?.tone || "neutral";
  const Icon = mapped?.Icon || Info;

  return (
    <span className={`ds-badge ds-badge--${tone} ${className}`.trim()}>
      {mapped?.recordingDot ? (
        <span className="ds-recording-dot" aria-hidden="true" />
      ) : (
        <Icon size={14} strokeWidth={2} aria-hidden="true" focusable="false" />
      )}
      <span>{text}</span>
    </span>
  );
}
