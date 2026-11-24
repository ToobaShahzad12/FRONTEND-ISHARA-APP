import { useEffect } from "react";
import Button from "../components/ds/Button";
import HandTrace from "../components/ds/HandTrace";
import Logo from "../components/ds/Logo";
import { StaggerContainer, StaggerItem } from "../components/ds/MotionPrimitives";

export default function NotFound() {
  useEffect(() => {
    document.title = "Page not found — ISHARA AI";
  }, []);

  return (
    <div className="ds-notfound-page ds-on-dark">
      <header>
        <Logo to="/" surface="dark" ariaLabel="ISHARA AI home" />
      </header>

      <main className="ds-notfound-main">
        <StaggerContainer stagger={0.07} delay={0.04}>
          <StaggerItem y={16}>
            <div className="ds-notfound-code">
              <span className="ds-notfound-code-text" aria-hidden="true">
                404
              </span>
              <div style={{ inlineSize: "min(45vw, 15rem)", color: "#c4f3e7" }}>
                <HandTrace variant="notfound" animated />
              </div>
            </div>
          </StaggerItem>

          <StaggerItem y={14}>
            <h1 className="ds-h1" style={{ marginBlockStart: "var(--ds-space-4)" }}>
              We can’t find that page.
            </h1>
          </StaggerItem>

          <StaggerItem y={12}>
            <p className="ds-body-lg ds-notfound-lead" style={{ marginBlockStart: "var(--ds-space-3)" }}>
              The link you opened may have moved, or the address might be typed
              incorrectly.
            </p>
          </StaggerItem>

          <StaggerItem y={10}>
            <div className="ds-notfound-actions" style={{ marginBlockStart: "var(--ds-space-6)" }}>
              <Button variant="yellow" size="lg" to="/">
                Back to home
              </Button>
              <Button variant="on-dark-secondary" size="lg" to="/login">
                Sign in
              </Button>
            </div>
          </StaggerItem>
        </StaggerContainer>
      </main>

      <footer style={{ fontSize: "0.875rem", color: "var(--ds-text-on-brand-secondary)" }}>
        ISHARA AI — Communication without barriers
      </footer>
    </div>
  );
}
