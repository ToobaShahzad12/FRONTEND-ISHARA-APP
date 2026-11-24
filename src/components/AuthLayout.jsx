import { useState } from "react";
import { motion } from "motion/react";
import HandTrace from "./ds/HandTrace";
import Logo from "./ds/Logo";
import { ISHARA_EASE, usePrefersReducedMotion } from "./ds/MotionPrimitives";
import pslBrandIllustration from "../assets/images/signup_psl_illustration_1795351713296.jpg";

export default function AuthLayout({
  children,
  pageClassName = "",
  layoutClassName = "",
  mainClassName = "",
}) {
  const reduced = usePrefersReducedMotion();
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <main className={`ds-auth-viewport ${pageClassName} ${layoutClassName}`.trim()}>
      <motion.div
        className="ds-auth-card-shell"
        initial={reduced ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduced ? 0.01 : 0.34, ease: ISHARA_EASE }}
      >
        <section className={`ds-auth-form-pane ${mainClassName}`.trim()}>
          {children}
        </section>

        <aside className="ds-auth-brand-pane ds-on-dark" aria-label="ISHARA AI branding">
          <div className="ds-auth-brand-top">
            <Logo to="/" surface="dark" ariaLabel="ISHARA AI home" />
          </div>

          <div className="ds-auth-brand-content">
            <h1 className="ds-auth-brand-headline">
              Communication{" "}
              <span className="ds-serif-accent">without barriers.</span>
            </h1>
            <p className="ds-auth-brand-subcopy">
              A calm, accessible platform built for Pakistan Sign Language
              recording, review, and everyday connection.
            </p>
          </div>

          <div className="ds-auth-brand-visual">
            {!imgFailed ? (
              <img
                src={pslBrandIllustration}
                alt="Editorial illustration of hands signing in Pakistani Sign Language"
                className="ds-auth-brand-illustration"
                onError={() => setImgFailed(true)}
              />
            ) : (
              <div className="ds-auth-brand-illustration-fallback" aria-hidden="true">
                <HandTrace variant="trail" animated />
              </div>
            )}
          </div>

          <div className="ds-auth-brand-trace" aria-hidden="true">
            <HandTrace variant="loop" animated />
          </div>
        </aside>
      </motion.div>
    </main>
  );
}
