import { useEffect, useRef } from "react";
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

export default function Drawer({
  open,
  onClose,
  ariaLabel = "Navigation menu",
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

  const isRtl =
    typeof document !== "undefined" && document.documentElement.dir === "rtl";

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.div
            key="drawer-scrim"
            className="ds-scrim"
            onClick={onClose}
            aria-hidden="true"
            initial={reduced ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0.01 : 0.22, ease: ISHARA_EASE }}
          />
          <motion.div
            key="drawer-panel"
            ref={panelRef}
            className="ds-drawer-panel"
            role="dialog"
            aria-modal="true"
            aria-label={ariaLabel}
            tabIndex={-1}
            style={{ animation: "none" }}
            initial={
              reduced ? { opacity: 1, x: 0 } : { x: isRtl ? "100%" : "-100%" }
            }
            animate={{ opacity: 1, x: 0 }}
            exit={
              reduced ? { opacity: 0 } : { x: isRtl ? "100%" : "-100%" }
            }
            transition={{ duration: reduced ? 0.01 : 0.28, ease: ISHARA_EASE }}
          >
            {children}
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
