import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "motion/react";
import AuthFeedback from "../components/AuthFeedback";
import AuthLayout from "../components/AuthLayout";
import PrimaryButton from "../components/PrimaryButton";
import HandTrace from "../components/ds/HandTrace";
import Spinner from "../components/ds/Spinner";
import { ISHARA_EASE, usePrefersReducedMotion } from "../components/ds/MotionPrimitives";
import { verifyEmail } from "../api/auth";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  useEffect(() => {
    document.title = "Verify email — ISHARA AI";
  }, []);

  return <VerifyEmailStatus key={token} token={token} />;
}

function VerifyEmailStatus({ token }) {
  const reduced = usePrefersReducedMotion();
  const handledToken = useRef("");
  const mounted = useRef(false);
  const [result, setResult] = useState(() =>
    token
      ? { status: "loading", message: "" }
      : {
          status: "error",
          message: "This verification link is missing its token or has expired.",
        }
  );

  useEffect(() => {
    mounted.current = true;

    if (!token) {
      return () => {
        mounted.current = false;
      };
    }

    if (handledToken.current !== token) {
      handledToken.current = token;
      const requestedToken = token;
      verifyEmail(token)
        .then((response) => {
          if (mounted.current && handledToken.current === requestedToken) {
            setResult({
              status: "success",
              message:
                response.message || "Your email has been verified successfully.",
            });
          }
        })
        .catch((error) => {
          if (mounted.current && handledToken.current === requestedToken) {
            setResult({
              status: "error",
              message:
                error.message || "This verification link is invalid or expired.",
            });
          }
        });
    }

    return () => {
      mounted.current = false;
    };
  }, [token]);

  const isLoading = result.status === "loading";
  const isSuccess = result.status === "success";

  return (
    <AuthLayout>
      <motion.div
        className="ds-auth-card ish-auth-card ish-simple-auth-card"
        aria-live="polite"
        style={{ display: "flex", flexDirection: "column", gap: "var(--ds-space-5)", animation: "none" }}
        initial={reduced ? false : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduced ? 0.01 : 0.34, ease: ISHARA_EASE }}
      >
        {isSuccess && (
          <div style={{ color: "var(--ds-text-link)" }} aria-hidden="true">
            <HandTrace variant="trail" animated />
          </div>
        )}

        <header className="ds-auth-heading" style={{ marginBlockEnd: 0 }}>
          <h2 className="ds-h2">
            {isLoading
              ? "Verify your email"
              : isSuccess
                ? "Email verified"
                : "Verification unsuccessful"}
          </h2>
          <p className="ds-body">
            {isLoading ? "We’re confirming your email address." : result.message}
          </p>
        </header>

        {isLoading ? (
          <div
            role="status"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--ds-space-3)",
              padding: "var(--ds-space-4)",
              backgroundColor: "var(--ds-bg-sunken)",
              borderRadius: "var(--ds-radius-md)",
              color: "var(--ds-text-primary)",
            }}
          >
            <Spinner size="md" />
            <span>Verifying your email…</span>
          </div>
        ) : (
          <>
            <AuthFeedback variant={isSuccess ? "success" : "error"}>
              <p>{result.message}</p>
            </AuthFeedback>
            <PrimaryButton to="/login" fullWidth size="lg">
              Return to sign in
            </PrimaryButton>
          </>
        )}
      </motion.div>
    </AuthLayout>
  );
}
