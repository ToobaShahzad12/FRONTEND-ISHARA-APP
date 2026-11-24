import { useCallback, useEffect, useRef, useState } from "react";
import { createGoogleAuthChallenge } from "../api/auth";
import { IS_DEMO_MODE } from "../api/demoStore";
import AuthFeedback from "./AuthFeedback";
import Button from "./ds/Button";

const GOOGLE_SCRIPT_ID = "ishara-google-identity-services";
let googleScriptPromise;
let activeCallbacks = null;
let pendingButtonTimer;

function loadGoogleIdentityServices() {
  if (window.google?.accounts?.id) return Promise.resolve();
  if (googleScriptPromise) return googleScriptPromise;

  googleScriptPromise = new Promise((resolve, reject) => {
    let script = document.getElementById(GOOGLE_SCRIPT_ID);
    if (!script) {
      script = document.createElement("script");
      script.id = GOOGLE_SCRIPT_ID;
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }

    script.addEventListener("load", resolve, { once: true });
    script.addEventListener("error", reject, { once: true });
  }).catch((error) => {
    googleScriptPromise = undefined;
    document.getElementById(GOOGLE_SCRIPT_ID)?.remove();
    throw error;
  });

  return googleScriptPromise;
}

export default function GoogleIdentityButton({
  onCredential,
  onError,
  onCancelled,
  onStart,
  disabled = false,
  showOneTap = false,
  className = "",
  buttonText = "continue_with",
}) {
  const containerRef = useRef(null);
  const oneTapPromptedRef = useRef(false);
  const clientId = IS_DEMO_MODE
    ? ""
    : import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim();
  const [setupError, setSetupError] = useState("");
  const [ready, setReady] = useState(false);
  const [challengeLoading, setChallengeLoading] = useState(Boolean(clientId));
  const [nonce, setNonce] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  const handlersRef = useRef({});
  useEffect(() => {
    handlersRef.current = { onCredential, onError, onCancelled, onStart };
  }, [onCredential, onError, onCancelled, onStart]);

  useEffect(() => {
    let mounted = true;
    if (IS_DEMO_MODE || !clientId) return () => { mounted = false; };

    createGoogleAuthChallenge()
      .then((challenge) => {
        if (!mounted) return;
        if (typeof challenge.nonce !== "string" || !challenge.nonce) {
          throw new Error("The secure Google sign-in challenge was invalid.");
        }
        setNonce(challenge.nonce);
        setChallengeLoading(false);
      })
      .catch(() => {
        if (!mounted) return;
        setNonce("");
        setChallengeLoading(false);
        setSetupError("A secure Google sign-in challenge could not be prepared. Check your connection and try again.");
      });

    return () => { mounted = false; };
  }, [clientId, retryCount]);

  const rotateChallenge = useCallback(() => {
    setReady(false);
    setChallengeLoading(true);
    setSetupError("");
    setNonce("");
    setRetryCount((count) => count + 1);
  }, []);

  useEffect(() => {
    let mounted = true;
    const buttonContainer = containerRef.current;

    if (!clientId || !nonce || !buttonContainer) {
      return () => { mounted = false; };
    }

    const callbackSet = {
      onCredential: (credential) => {
        window.clearTimeout(pendingButtonTimer);
        pendingButtonTimer = undefined;
        handlersRef.current.onCredential?.(credential);
        rotateChallenge();
      },
      onError: (message) => {
        window.clearTimeout(pendingButtonTimer);
        pendingButtonTimer = undefined;
        handlersRef.current.onError?.(message);
        rotateChallenge();
      },
      onCancelled: () => {
        window.clearTimeout(pendingButtonTimer);
        pendingButtonTimer = undefined;
        handlersRef.current.onCancelled?.();
        rotateChallenge();
      },
    };
    activeCallbacks = callbackSet;

    async function initializeGoogleButton() {
      try {
        await loadGoogleIdentityServices();
        if (!mounted || !buttonContainer) return;

        const googleIdentity = window.google?.accounts?.id;
        if (!googleIdentity) throw new Error("Google Identity Services did not load.");

        googleIdentity.initialize({
          client_id: clientId,
          nonce,
          auto_select: false,
          ux_mode: "popup",
          callback: (response) => {
            const callbacks = activeCallbacks;
            if (!response?.credential) {
              callbacks?.onError?.("Google did not return a sign-in credential. Try again.");
              return;
            }
            callbacks?.onCredential?.(response.credential);
          },
        });

        const renderButton = () => {
          if (!mounted || !window.google?.accounts?.id) return;
          const availableWidth = Math.floor(buttonContainer.getBoundingClientRect().width);
          const width = Math.max(200, Math.min(400, availableWidth || 320));
          buttonContainer.replaceChildren();
          window.google.accounts.id.renderButton(buttonContainer, {
            type: "standard",
            theme: "outline",
            size: "large",
            text: buttonText,
            shape: "rectangular",
            logo_alignment: "left",
            width,
            click_listener: () => {
              window.clearTimeout(pendingButtonTimer);
              activeCallbacks?.onStart?.();
              pendingButtonTimer = window.setTimeout(() => {
                activeCallbacks?.onCancelled?.();
                pendingButtonTimer = undefined;
              }, 90000);
            },
          });
        };

        renderButton();
        setSetupError("");
        setReady(true);
        window.addEventListener("resize", renderButton);

        if (showOneTap && !oneTapPromptedRef.current) {
          oneTapPromptedRef.current = true;
          googleIdentity.prompt((notification) => {
            if (notification.isSkippedMoment?.()) {
              activeCallbacks?.onCancelled?.();
            }
          });
        }

        callbackSet.removeResizeListener = () => window.removeEventListener("resize", renderButton);
      } catch {
        if (mounted) {
          setReady(false);
          setSetupError("Google sign-in could not be loaded. Check your connection and try again.");
        }
      }
    }

    initializeGoogleButton();

    return () => {
      mounted = false;
      callbackSet.removeResizeListener?.();
      if (activeCallbacks === callbackSet) {
        activeCallbacks = null;
        window.clearTimeout(pendingButtonTimer);
        pendingButtonTimer = undefined;
      }
      if (buttonContainer) buttonContainer.replaceChildren();
    };
  }, [clientId, nonce, showOneTap, buttonText, rotateChallenge]);

  const isDisabled = disabled || challengeLoading || !ready;

  if (IS_DEMO_MODE) {
    return (
      <div className={`ds-google-wrap ish-google-identity ${className}`.trim()}>
        <AuthFeedback variant="info" className="ish-google-identity-feedback">
          <p>
            Google sign-in is disabled in frontend Demo Mode (temporary preview only, not real authentication).
          </p>
        </AuthFeedback>
      </div>
    );
  }

  return (
    <div
      className={`ds-google-wrap ish-google-identity ${className}`.trim()}
      aria-busy={!setupError && Boolean(clientId) && (!ready || challengeLoading)}
    >
      <div className="ds-google-frame">
        <div
          ref={containerRef}
          className={`ish-google-identity-button${isDisabled ? " is-disabled" : ""}`}
          aria-label="Continue with Google"
          aria-disabled={isDisabled}
        />
        {isDisabled && <span className="ish-google-identity-blocker" aria-hidden="true" />}
      </div>

      {(setupError || (!clientId && "Google sign-in is not configured for this frontend.")) && (
        <AuthFeedback variant="info" className="ish-google-identity-feedback">
          <p className="ish-google-identity-error">
            {setupError || "Google sign-in is not configured for this frontend."}
          </p>
          {clientId && (
            <div style={{ marginBlockStart: "var(--ds-space-2)" }}>
              <Button
                variant="tertiary"
                size="sm"
                className="ish-google-identity-retry"
                onClick={() => {
                  setSetupError("");
                  setReady(false);
                  setChallengeLoading(true);
                  setNonce("");
                  setRetryCount((count) => count + 1);
                }}
              >
                Try Google sign-in again
              </Button>
            </div>
          )}
        </AuthFeedback>
      )}
    </div>
  );
}
