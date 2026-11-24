import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowDown, ArrowRight, Menu, Upload, Video } from "lucide-react";
import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import BottomSheet from "../components/ds/BottomSheet";
import Button from "../components/ds/Button";
import HandTrace from "../components/ds/HandTrace";
import Logo from "../components/ds/Logo";
import {
  ISHARA_EASE,
  usePrefersReducedMotion,
} from "../components/ds/MotionPrimitives";
import HeroMotionStage from "../components/landing/HeroMotionStage";
import WorkflowWalkthrough from "../components/landing/WorkflowWalkthrough";

const NAV_SECTIONS = [
  { id: "how-it-works", label: "How it works" },
  { id: "two-ways-to-start", label: "Two ways to start" },
  { id: "easy-to-use", label: "Accessibility" },
];

const QUALITIES = [
  {
    title: "Clear framing without distractions",
    description:
      "Camera previews keep your upper body and hand movement natural and unmirrored so every sign reads accurately.",
  },
  {
    title: "Honest status at every step",
    description:
      "Browser permissions, file format checks, and service availability are explained plainly—never hidden behind fake progress.",
  },
  {
    title: "Readable on every screen",
    description:
      "High-contrast editorial typography, 44px touch targets, and keyboard-first controls adapt across mobile, tablet, and desktop.",
  },
  {
    title: "Accessible by design",
    description:
      "Respects reduced-motion preferences, announces live status updates, and supports full keyboard navigation throughout.",
  },
];

const revealVariants = {
  hidden: { opacity: 0, y: 22 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.56,
      delay,
      ease: ISHARA_EASE,
    },
  }),
};

export default function Landing() {
  const heroRef = useRef(null);
  const workflowRef = useRef(null);
  const closingRef = useRef(null);
  const reduced = usePrefersReducedMotion();
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const heroPointerX = useMotionValue(0);
  const heroPointerY = useMotionValue(0);

  const { scrollY, scrollYProgress } = useScroll();
  const { scrollYProgress: heroScrollProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const { scrollYProgress: workflowScrollProgress } = useScroll({
    target: workflowRef,
    offset: ["start 84%", "end 62%"],
  });
  const { scrollYProgress: closingScrollProgress } = useScroll({
    target: closingRef,
    offset: ["start end", "end start"],
  });

  const heroCopyY = useTransform(heroScrollProgress, [0, 1], [0, -40]);
  const smoothWorkflowProgress = useSpring(workflowScrollProgress, {
    stiffness: 120,
    damping: 26,
    mass: 0.45,
  });
  const workflowTrackScaleX = useTransform(smoothWorkflowProgress, [0, 1], [0.05, 1]);
  const closingTraceY = useTransform(closingScrollProgress, [0, 1], [28, -28]);

  function handleHeroPointerMove(e) {
    if (reduced || !heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / Math.max(rect.width, 1) - 0.5) * 2;
    const ny = ((e.clientY - rect.top) / Math.max(rect.height, 1) - 0.5) * 2;
    heroPointerX.set(Math.max(-1, Math.min(1, nx)));
    heroPointerY.set(Math.max(-1, Math.min(1, ny)));
  }

  function handleHeroPointerLeave() {
    heroPointerX.set(0);
    heroPointerY.set(0);
  }

  const updateScrollState = useCallback(() => {
    const heroHeight = heroRef.current?.offsetHeight || 560;
    const pastHero = window.scrollY > Math.max(heroHeight - 88, 280);
    setIsScrolled((prev) => (prev === pastHero ? prev : pastHero));

    const anchorY = window.innerHeight * 0.36;
    let current = "";
    for (const item of NAV_SECTIONS) {
      const el = document.getElementById(item.id);
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      if (rect.top <= anchorY && rect.bottom > 96) {
        current = item.id;
      }
    }
    setActiveSection((prev) => (prev === current ? prev : current));
  }, []);

  useMotionValueEvent(scrollY, "change", () => {
    updateScrollState();
  });

  useEffect(() => {
    document.title = "ISHARA AI — Communication Without Barriers";
    updateScrollState();

    const hash = window.location.hash.replace("#", "");
    if (hash) {
      const target = document.getElementById(hash);
      if (target) {
        requestAnimationFrame(() => {
          target.scrollIntoView({ behavior: "auto", block: "start" });
          updateScrollState();
        });
      }
    }

    window.addEventListener("resize", updateScrollState, { passive: true });
    return () => window.removeEventListener("resize", updateScrollState);
  }, [updateScrollState]);

  const scrollToSection = useCallback(
    (sectionId) => {
      setMobileMenuOpen(false);
      if (sectionId === "hero-panel") {
        window.scrollTo({
          top: 0,
          behavior: reduced ? "auto" : "smooth",
        });
        return;
      }
      const target = document.getElementById(sectionId);
      if (target) {
        target.scrollIntoView({
          behavior: reduced ? "auto" : "smooth",
          block: "start",
        });
      }
    },
    [reduced]
  );

  function handleNavClick(e, sectionId) {
    e.preventDefault();
    scrollToSection(sectionId);
  }

  return (
    <div className="ds-landing ds-landing-page">
      <a className="ds-skip-link" href="#landing-main">
        Skip to main content
      </a>

      <header
        className={`ds-landing-header ${isScrolled ? "is-scrolled" : "ds-on-dark"}`.trim()}
      >
        <div className="ds-landing-header-inner">
          <a
            href="#hero-panel"
            onClick={(e) => handleNavClick(e, "hero-panel")}
            className="ds-landing-logo-anchor"
            aria-label="ISHARA AI home"
          >
            <Logo surface={isScrolled ? "light" : "dark"} />
          </a>

          <nav className="ds-landing-nav-desktop" aria-label="Landing navigation">
            {NAV_SECTIONS.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={activeSection === item.id ? "is-active" : undefined}
                onClick={(e) => handleNavClick(e, item.id)}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="ds-landing-header-actions">
            <Button variant={isScrolled ? "tertiary" : "on-dark-tertiary"} size="sm" to="/login">
              Sign in
            </Button>
            <Button variant={isScrolled ? "primary" : "on-dark-secondary"} size="sm" to="/signup">
              Create account
            </Button>
          </div>

          <button
            type="button"
            className={`ds-icon-btn ${isScrolled ? "" : "ds-icon-btn--on-dark"} ds-landing-menu-btn`.trim()}
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open navigation menu"
            aria-expanded={mobileMenuOpen}
            aria-haspopup="dialog"
          >
            <Menu size={22} strokeWidth={2} aria-hidden="true" />
          </button>
        </div>

        <motion.div
          className="ds-landing-scroll-progress"
          aria-hidden="true"
          style={reduced ? { scaleX: 0 } : { scaleX: scrollYProgress }}
        />
      </header>

      <main id="landing-main" className="ds-landing-main" tabIndex={-1}>
        {/* SECTION 01 — Full-Viewport Ocean-Teal Hero with Masked Typography & 3D Centerpiece */}
        <section
          id="hero-panel"
          ref={heroRef}
          className="ds-hero-band ds-on-dark"
          aria-label="Brand introduction and hero"
          onPointerMove={handleHeroPointerMove}
          onPointerLeave={handleHeroPointerLeave}
        >
          <div className="ds-landing-shell ds-hero-shell">
            <div className="ds-hero-grid">
              <motion.div
                className="ds-hero-copy-col"
                style={reduced ? undefined : { y: heroCopyY }}
              >
                <motion.span
                  className="ds-hero-kicker"
                  variants={revealVariants}
                  initial={reduced ? false : "hidden"}
                  animate="visible"
                  custom={0.04}
                >
                  Pakistan Sign Language
                </motion.span>

                <h1 className="ds-hero-display">
                  <span className="ds-hero-line-mask">
                    <motion.span
                      className="ds-hero-display-line"
                      initial={reduced ? false : { y: "108%", opacity: 0 }}
                      animate={{ y: "0%", opacity: 1 }}
                      transition={{ duration: reduced ? 0.01 : 0.72, delay: 0.08, ease: ISHARA_EASE }}
                    >
                      Communication
                    </motion.span>
                  </span>
                  <span className="ds-hero-line-mask">
                    <motion.span
                      className="ds-hero-display-line ds-serif-accent"
                      initial={reduced ? false : { y: "108%", opacity: 0 }}
                      animate={{ y: "0%", opacity: 1 }}
                      transition={{ duration: reduced ? 0.01 : 0.76, delay: 0.18, ease: ISHARA_EASE }}
                    >
                      without barriers.
                    </motion.span>
                  </span>
                </h1>

                <motion.p
                  className="ds-landing-hero-lead"
                  variants={revealVariants}
                  initial={reduced ? false : "hidden"}
                  animate="visible"
                  custom={0.28}
                >
                  A calm, accessible platform to record or upload Pakistan Sign
                  Language videos—designed for clear framing, honest feedback,
                  and everyday connection.
                </motion.p>

                <motion.div
                  className="ds-landing-hero-ctas"
                  variants={revealVariants}
                  initial={reduced ? false : "hidden"}
                  animate="visible"
                  custom={0.36}
                >
                  <Button variant="yellow" size="hero" to="/signup">
                    <span>Create account</span>
                    <ArrowRight
                      size={18}
                      strokeWidth={2}
                      className="ds-rtl-flip"
                      aria-hidden="true"
                    />
                  </Button>
                  <Button variant="on-dark-secondary" size="hero" to="/login">
                    Sign in
                  </Button>
                </motion.div>
              </motion.div>

              <div className="ds-hero-visual-col">
                <HeroMotionStage
                  scrollProgress={heroScrollProgress}
                  pointerX={heroPointerX}
                  pointerY={heroPointerY}
                />
              </div>
            </div>

            <div className="ds-hero-bottom-strip">
              <p className="ds-hero-principles">
                <span>Live browser capture</span>
                <span aria-hidden="true">·</span>
                <span>Video upload</span>
                <span aria-hidden="true">·</span>
                <span>Unmirrored framing</span>
              </p>

              <button
                type="button"
                className="ds-hero-scroll-link"
                onClick={() => scrollToSection("how-it-works")}
                aria-label="Scroll to How it works"
              >
                <span>Scroll to explore</span>
                <span className="ds-hero-scroll-line" aria-hidden="true">
                  <ArrowDown size={14} strokeWidth={2} />
                </span>
              </button>
            </div>
          </div>
        </section>

        {/* SECTION 02 — How It Works (Horizontal Staggered Tri-Column Flow + Scroll Progress Hairline) */}
        <section
          id="how-it-works"
          ref={workflowRef}
          className="ds-band-workflow"
          aria-labelledby="how-it-works-title"
        >
          <div className="ds-landing-shell">
            <motion.div
              className="ds-workflow-header-row"
              variants={revealVariants}
              initial={reduced ? false : "hidden"}
              whileInView="visible"
              viewport={{ once: true, amount: 0.25 }}
              custom={0.04}
            >
              <div className="ds-workflow-heading-group">
                <span className="ds-eyebrow">Workflow</span>
                <h2 id="how-it-works-title" className="ds-display-l">
                  How it works
                </h2>
              </div>
              <p className="ds-body-lg ds-workflow-intro-copy">
                Three quiet steps from recording or uploading to reviewed sign
                language translation.
              </p>
            </motion.div>

            {/* Scroll-driven hairline rail connecting the 3 horizontal steps */}
            <div className="ds-workflow-progress-rail" aria-hidden="true">
              <motion.div
                className="ds-workflow-progress-fill"
                style={reduced ? { scaleX: 1 } : { scaleX: workflowTrackScaleX }}
              />
            </div>

            <WorkflowWalkthrough reduced={reduced} />
          </div>
        </section>

        {/* SECTION 03 — Two Ways to Start (Full-Width Unboxed Showcase Rows — Zero Rounded Cards) */}
        <section
          id="two-ways-to-start"
          className="ds-band-start"
          aria-labelledby="two-ways-title"
        >
          <div className="ds-landing-shell">
            <motion.div
              className="ds-start-header-split"
              variants={revealVariants}
              initial={reduced ? false : "hidden"}
              whileInView="visible"
              viewport={{ once: true, amount: 0.25 }}
              custom={0.04}
            >
              <div>
                <span className="ds-eyebrow">Recording &amp; Upload</span>
                <h2 id="two-ways-title" className="ds-display-l">
                  Two ways to start
                </h2>
              </div>
              <p className="ds-body-lg ds-start-lead">
                Capture sign expressions directly in your browser or select a
                pre-recorded clip for playback review.
              </p>
            </motion.div>

            <div className="ds-ways-showcase">
              <motion.article
                className="ds-way-row ds-way-row--camera"
                variants={revealVariants}
                initial={reduced ? false : "hidden"}
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                custom={0.08}
              >
                <div className="ds-way-row-meta">
                  <span className="ds-way-index" aria-hidden="true">01</span>
                  <span className="ds-way-icon ds-way-icon--primary" aria-hidden="true">
                    <Video size={22} strokeWidth={1.85} />
                  </span>
                  <span className="ds-way-tag">Real-time browser capture</span>
                </div>

                <div className="ds-way-row-content">
                  <h3 className="ds-h1">Use Live Camera</h3>
                  <p className="ds-body-lg">
                    Preview your framing in real time, capture one complete
                    thought with your webcam, and review your recording before
                    submitting.
                  </p>
                </div>

                <div className="ds-way-row-action">
                  <Button variant="primary" size="lg" to="/signup">
                    <span>Start with Live Camera</span>
                    <ArrowRight
                      size={17}
                      strokeWidth={2}
                      className="ds-rtl-flip"
                      aria-hidden="true"
                    />
                  </Button>
                </div>
              </motion.article>

              <motion.article
                className="ds-way-row ds-way-row--upload"
                variants={revealVariants}
                initial={reduced ? false : "hidden"}
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                custom={0.16}
              >
                <div className="ds-way-row-meta">
                  <span className="ds-way-index" aria-hidden="true">02</span>
                  <span className="ds-way-icon ds-way-icon--secondary" aria-hidden="true">
                    <Upload size={22} strokeWidth={1.85} />
                  </span>
                  <span className="ds-way-tag">MP4 · WebM · AVI up to 250 MB</span>
                </div>

                <div className="ds-way-row-content">
                  <h3 className="ds-h1">Upload a Video</h3>
                  <p className="ds-body-lg">
                    Select a previously recorded MP4, WebM, or browser-playable
                    AVI file up to 250 MB and verify playback first.
                  </p>
                </div>

                <div className="ds-way-row-action">
                  <Button variant="secondary" size="lg" to="/login">
                    <span>Sign in to upload</span>
                    <ArrowRight
                      size={17}
                      strokeWidth={2}
                      className="ds-rtl-flip"
                      aria-hidden="true"
                    />
                  </Button>
                </div>
              </motion.article>
            </div>
          </div>
        </section>

        {/* SECTION 04 — Accessibility (Editorial Pull-Quote Stage + Offset Vertical Ledger) */}
        <section
          id="easy-to-use"
          className="ds-band-accessibility"
          aria-labelledby="qualities-title"
        >
          <div className="ds-landing-shell">
            <motion.div
              className="ds-access-statement"
              variants={revealVariants}
              initial={reduced ? false : "hidden"}
              whileInView="visible"
              viewport={{ once: true, amount: 0.25 }}
              custom={0.04}
            >
              <div className="ds-access-title-col">
                <span className="ds-eyebrow">Standards</span>
                <h2 id="qualities-title" className="ds-display-l">
                  Designed to be easy to use
                </h2>
              </div>

              <div className="ds-accessibility-quote-block">
                <div className="ds-access-arc">
                  <HandTrace variant="arc" animated={!reduced} />
                </div>
                <blockquote className="ds-serif-accent ds-accessibility-quote">
                  “Every gesture carries meaning. Every conversation deserves
                  clear space.”
                </blockquote>
              </div>
            </motion.div>

            <div className="ds-access-ledger-wrap">
              <div className="ds-access-ledger">
                {QUALITIES.map((item, idx) => (
                  <motion.article
                    key={item.title}
                    className="ds-quality-row"
                    variants={revealVariants}
                    initial={reduced ? false : "hidden"}
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                    custom={0.06 + idx * 0.06}
                  >
                    <span className="ds-quality-index" aria-hidden="true">
                      0{idx + 1}
                    </span>
                    <h3 className="ds-h3">{item.title}</h3>
                    <p className="ds-body ds-quality-copy">{item.description}</p>
                  </motion.article>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 05 — Closing Call to Action (Ocean-Teal Signature Band with Scroll Parallax) */}
        <section
          id="closing-cta"
          ref={closingRef}
          className="ds-band-closing ds-on-dark"
          aria-labelledby="closing-cta-title"
        >
          <motion.div
            className="ds-closing-bg-trace"
            aria-hidden="true"
            style={reduced ? undefined : { y: closingTraceY }}
          >
            <HandTrace variant="loop" animated={!reduced} />
          </motion.div>

          <div className="ds-landing-shell ds-closing-center">
            <motion.div
              className="ds-closing-inner"
              variants={revealVariants}
              initial={reduced ? false : "hidden"}
              whileInView="visible"
              viewport={{ once: true, amount: 0.25 }}
              custom={0.05}
            >
              <span
                className="ds-eyebrow"
                style={{ color: "var(--ds-text-on-brand-accent)" }}
              >
                Get Started
              </span>
              <h2
                id="closing-cta-title"
                className="ds-display-xl"
                style={{ textWrap: "balance" }}
              >
                Ready to connect through{" "}
                <span className="ds-serif-accent" style={{ color: "var(--ish-yellow)" }}>
                  ISHARA AI?
                </span>
              </h2>
              <p className="ds-body-lg">
                Create your account or sign in to access your recording
                workspace and translation history.
              </p>
              <div className="ds-landing-hero-ctas">
                <Button variant="yellow" size="lg" to="/signup">
                  <span>Create account</span>
                  <ArrowRight
                    size={18}
                    strokeWidth={2}
                    className="ds-rtl-flip"
                    aria-hidden="true"
                  />
                </Button>
                <Button variant="on-dark-secondary" size="lg" to="/login">
                  Sign in
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <footer className="ds-landing-footer ds-on-dark">
        <div className="ds-landing-footer-inner">
          <div className="ds-landing-footer-brand">
            <a
              href="#hero-panel"
              onClick={(e) => handleNavClick(e, "hero-panel")}
              className="ds-landing-logo-anchor"
              aria-label="Back to top"
            >
              <Logo surface="dark" />
            </a>
            <span className="ds-landing-footer-copy">
              © 2026 ISHARA AI — Pakistani Sign Language Communication Platform
            </span>
          </div>

          <nav className="ds-landing-footer-links" aria-label="Footer navigation">
            <Link to="/login">Sign in</Link>
            <Link to="/signup">Create account</Link>
            <Link to="/forgot-password">Forgot password</Link>
          </nav>
        </div>
      </footer>

      <BottomSheet
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        title="ISHARA AI"
        ariaLabel="Landing navigation menu"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--ds-space-2)" }}>
          {NAV_SECTIONS.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="ds-menu-item"
              onClick={(e) => handleNavClick(e, item.id)}
            >
              {item.label}
            </a>
          ))}
          <hr
            style={{
              border: 0,
              borderBlockStart: "1px solid var(--ds-border-divider)",
              marginBlock: "var(--ds-space-2)",
            }}
          />
          <Button variant="primary" fullWidth to="/signup" onClick={() => setMobileMenuOpen(false)}>
            Create account
          </Button>
          <Button variant="secondary" fullWidth to="/login" onClick={() => setMobileMenuOpen(false)}>
            Sign in
          </Button>
        </div>
      </BottomSheet>
    </div>
  );
}
