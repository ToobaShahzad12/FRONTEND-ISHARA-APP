import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { ISHARA_EASE, usePrefersReducedMotion } from "./MotionPrimitives";

function getFocusableElements(container) {
  if (!container) return [];
  return Array.from(
    container.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
  ).filter((el) => !el.hasAttribute("hidden") && el.offsetParent !== null);
}

export default function BottomSheet({
  open,
  onClose,
  title,
  ariaLabel,
  children,
}) {
  const panelRef = useRef(null);
  const previousFocusRef = useRef(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (!open) return undefined;
    previousFocusRef.current = document.activeElement;

    const panel = panelRef.current;
    const focusables = getFocusableElements(panel);
    if (focusables.length) {
      focusables[0].focus();
    } else {
      panel?.focus();
    }

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose?.();
        return;
      }

      if (event.key === "Tab" && panel) {
        const items = getFocusableElements(panel);
        if (!items.length) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = prevOverflow;
      if (previousFocusRef.current && typeof previousFocusRef.current.focus === "function") {
        previousFocusRef.current.focus();
      }
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.div
            key="sheet-scrim"
            className="ds-scrim"
            onClick={onClose}
            aria-hidden="true"
            initial={reduced ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0.01 : 0.22, ease: ISHARA_EASE }}
          />
          <motion.div
            key="sheet-panel"
            ref={panelRef}
            className="ds-sheet-panel"
            role="dialog"
            aria-modal="true"
            aria-label={ariaLabel || title || "Options"}
            tabIndex={-1}
            style={{ animation: "none" }}
            initial={reduced ? { opacity: 1, y: 0 } : { y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? { opacity: 0 } : { y: "100%" }}
            transition={{ duration: reduced ? 0.01 : 0.3, ease: ISHARA_EASE }}
          >
            <div className="ds-sheet-header">
              {title ? <h2 className="ds-h4">{title}</h2> : <span />}
              <button
                type="button"
                className="ds-icon-btn"
                onClick={onClose}
                aria-label="Close panel"
              >
                <X size={20} strokeWidth={2} aria-hidden="true" />
              </button>
            </div>
            {children}
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
