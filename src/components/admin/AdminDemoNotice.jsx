import { Info } from "lucide-react";

export default function AdminDemoNotice({ children }) {
  return (
    <aside className="ds-demo-notice" role="note">
      <Info
        size={18}
        strokeWidth={2}
        className="ds-demo-notice-icon"
        aria-hidden="true"
        focusable="false"
      />
      <div>
        <strong>Demo data</strong>
        <span>{children}</span>
      </div>
    </aside>
  );
}
