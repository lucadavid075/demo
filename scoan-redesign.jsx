import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Play, ChevronRight, Menu, X } from "lucide-react";

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,400;1,9..144,500&family=Libre+Franklin:wght@300;400;500;600;700&display=swap');`;

function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

function Reveal({ children, delay = 0, className = "" }) {
  const [ref, visible] = useReveal();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(28px)",
        transition: `opacity 0.9s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.9s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

export default function ScoanRedesign() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      style={{
        fontFamily: "'Libre Franklin', sans-serif",
        background: "#F6F1E7",
        color: "#1B2436",
        minHeight: "100vh",
        position: "relative",
        overflowX: "hidden",
      }}
    >
      <style>{`
        ${FONT_IMPORT}
        .display { font-family: 'Fraunces', serif; }
        .grain {
          position: fixed; inset: 0; pointer-events: none; z-index: 40; opacity: 0.045; mix-blend-mode: multiply;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
        }
        .beam {
          position: absolute; inset: 0; pointer-events: none;
          background: radial-gradient(ellipse 900px 500px at 78% -10%, rgba(201,162,39,0.28), transparent 60%),
                      radial-gradient(ellipse 600px 400px at 15% 10%, rgba(201,162,39,0.10), transparent 65%);
        }
        .navlink { position: relative; padding-bottom: 4px; }
        .navlink::after { content:''; position:absolute; left:0; bottom:0; width:0; height:1px; background:#C9A227; transition: width 0.35s ease; }
        .navlink:hover::after { width: 100%; }
        .goldbtn { transition: all 0.3s cubic-bezier(0.16,1,0.3,1); }
        .goldbtn:hover { transform: translateY(-2px); box-shadow: 0 12px 24px -8px rgba(201,162,39,0.5); }
        .outlinebtn { transition: all 0.3s ease; }
        .outlinebtn:hover { background: #1B2436; color: #F6F1E7; }
        .cardhover { transition: transform 0.5s cubic-bezier(0.16,1,0.3,1), box-shadow 0.5s ease; }
        .cardhover:hover { transform: translateY(-6px); }
        .devhover { transition: all 0.4s ease; }
        .devhover:hover .dev-title { color: #C9A227; }
        .dev-title { transition: color 0.3s ease; }
        @keyframes floatSlow { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-14px); } }
        .float { animation: floatSlow 7s ease-in-out infinite; }
        ::selection { background: #C9A227; color: #1B2436; }
      `}</style>

      <div className="grain" />

      {/* NAV */}
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 30,
          background: scrolled ? "rgba(246,241,231,0.92)" : "transparent",
          backdropFilter: scrolled ? "blur(10px)" : "none",
          borderBottom: scrolled ? "1px solid rgba(27,36,54,0.08)" : "1px solid transparent",
          transition: "all 0.4s ease",
        }}
      >
        <div style={{ maxWidth: 1240, margin: "0 auto", padding: "20px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div className="display" style={{ fontSize: 22, fontWeight: 600, letterSpacing: "0.02em" }}>
            SCO<span style={{ color: "#C9A227" }}>·</span>AN
          </div>
          <div className="hidden md:flex" style={{ display: "none", gap: 36, fontSize: 14, fontWeight: 500, letterSpacing: "0.02em" }} id="desktop-nav">
            {["About", "Emmanuel TV", "Faith Tools", "Branches", "Blog"].map((l) => (
              <a key={l} href="#" className="navlink" style={{ color: "#1B2436", textDecoration: "none" }}>
                {l}
              </a>
            ))}
          </div>
          <button
            className="goldbtn"
            style={{
              display: "none",
              background: "#1B2436",
              color: "#F6F1E7",
              border: "none",
              padding: "11px 24px",
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              cursor: "pointer",
            }}
            id="desktop-cta"
          >
            Watch Live
          </button>
          <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: "none", border: "none", cursor: "pointer", display: "block" }} id="mobile-toggle">
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        <style>{`
          @media (min-width: 860px) {
            #desktop-nav { display: flex !important; }
            #desktop-cta { display: block !important; }
            #mobile-toggle { display: none !important; }
          }
        `}</style>
        {menuOpen && (
          <div style={{ padding: "0 32px 24px", display: "flex", flexDirection: "column", gap: 18, fontSize: 15 }}>
            {["About", "Emmanuel TV", "Faith Tools", "Branches", "Blog"].map((l) => (
              <a key={l} href="#" style={{ color: "#1B2436", textDecoration: "none", fontWeight: 500 }}>
                {l}
              </a>
            ))}
          </div>
        )}
      </nav>

      {/* HERO */}
      <section style={{ position: "relative", padding: "70px 32px 120px", maxWidth: 1240, margin: "0 auto" }}>
        <div className="beam" />
        <div style={{ position: "relative", display: "grid", gridTemplateColumns: "1fr", gap: 40 }}>
          <Reveal>
            <p style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: "#8A6D1A", marginBottom: 24 }}>
              Ikotun-Egbe, Lagos · Est. by Prophet T.B. Joshua
            </p>
          </Reveal>
          <Reveal delay={100}>
            <h1 className="display" style={{ fontSize: "clamp(42px, 7vw, 92px)", lineHeight: 1.02, fontWeight: 500, maxWidth: 900, letterSpacing: "-0.01em" }}>
              The Spirit of Truth,
              <br />
              <span style={{ fontStyle: "italic", fontWeight: 400, color: "#5A4712" }}>carried to all nations.</span>
            </h1>
          </Reveal>
          <Reveal delay={220}>
            <p style={{ fontSize: 18, lineHeight: 1.65, maxWidth: 520, color: "#3E4658", marginTop: 8 }}>
              A gathering place in the heart of Lagos, and a broadcast reaching millions
              through Emmanuel TV — changing lives, changing nations, changing the world.
            </p>
          </Reveal>
          <Reveal delay={340}>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 12 }}>
              <button
                className="goldbtn"
                style={{ background: "#C9A227", color: "#1B2436", border: "none", padding: "16px 32px", fontSize: 14, fontWeight: 700, letterSpacing: "0.03em", cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}
              >
                <Play size={16} fill="#1B2436" /> Watch Emmanuel TV
              </button>
              <button
                className="outlinebtn"
                style={{ background: "transparent", color: "#1B2436", border: "1.5px solid #1B2436", padding: "16px 32px", fontSize: 14, fontWeight: 700, letterSpacing: "0.03em", cursor: "pointer" }}
              >
                Plan Your Visit
              </button>
            </div>
          </Reveal>
        </div>

        {/* floating date card, asymmetric offset */}
        <Reveal delay={450}>
          <div
            className="float"
            style={{
              position: "relative",
              marginTop: 70,
              marginLeft: "auto",
              maxWidth: 380,
              background: "#1B2436",
              color: "#F6F1E7",
              padding: "28px 32px",
              boxShadow: "0 30px 60px -20px rgba(27,36,54,0.4)",
            }}
          >
            <p style={{ fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: "#C9A227", marginBottom: 10 }}>
              Next Crusade
            </p>
            <h3 className="display" style={{ fontSize: 24, fontWeight: 500, marginBottom: 6 }}>
              Brazil, with Pastor Evelyn Joshua
            </h3>
            <p style={{ fontSize: 14, color: "rgba(246,241,231,0.7)" }}>18th – 19th September, 2026</p>
          </div>
        </Reveal>
      </section>

      {/* STATEMENT OF FAITH — editorial pull quote */}
      <section style={{ background: "#1B2436", color: "#F6F1E7", padding: "110px 32px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
          <Reveal>
            <span style={{ fontSize: 80, fontFamily: "'Fraunces', serif", color: "#C9A227", lineHeight: 0.5, display: "block", marginBottom: 20 }}>
              "
            </span>
          </Reveal>
          <Reveal delay={100}>
            <p className="display" style={{ fontSize: "clamp(24px, 3.4vw, 38px)", fontStyle: "italic", lineHeight: 1.5, fontWeight: 400 }}>
              I will ask the Father, and He will give you another Counselor to be
              with you forever — the Spirit of Truth.
            </p>
          </Reveal>
          <Reveal delay={200}>
            <p style={{ marginTop: 28, fontSize: 13, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(246,241,231,0.55)" }}>
              John 14:16–17
            </p>
          </Reveal>
          <Reveal delay={280}>
            <a href="#" style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 36, color: "#C9A227", fontSize: 14, fontWeight: 600, textDecoration: "none" }}>
              Read our full Statement of Faith <ArrowUpRight size={16} />
            </a>
          </Reveal>
        </div>
      </section>

      {/* THREE PILLARS — asymmetric overlap, not a generic 3-col grid */}
      <section style={{ padding: "120px 32px 60px", maxWidth: 1240, margin: "0 auto" }}>
        <Reveal>
          <p style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: "#8A6D1A", marginBottom: 12 }}>
            What we do
          </p>
        </Reveal>
        <Reveal delay={80}>
          <h2 className="display" style={{ fontSize: "clamp(32px,4vw,52px)", fontWeight: 500, maxWidth: 640, marginBottom: 70 }}>
            One ministry, carried through three doors.
          </h2>
        </Reveal>

        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 28 }} className="pillar-grid">
          <style>{`
            @media (min-width: 900px) {
              .pillar-grid { grid-template-columns: repeat(3, 1fr) !important; }
              .pillar-2 { transform: translateY(60px); }
            }
          `}</style>
          {[
            { n: "01", t: "The SCOAN", d: "An architectural home in Ikotun-Egbe, Lagos — grown through four locations into the church it is today.", cls: "" },
            { n: "02", t: "Emmanuel TV", d: "Broadcasting the Gospel to millions worldwide since 2006 — changing lives, changing nations, changing the world.", cls: "pillar-2" },
            { n: "03", t: "Faith Tools & Charity", d: "Practical resources and giving, because generosity reshapes destiny — for the giver and the receiver alike.", cls: "" },
          ].map((p) => (
            <div key={p.n} className={`cardhover ${p.cls}`} style={{ background: "#FFFDF8", border: "1px solid rgba(27,36,54,0.1)", padding: "40px 32px", cursor: "pointer" }}>
              <p className="display" style={{ fontSize: 15, color: "#C9A227", fontWeight: 600, marginBottom: 24 }}>{p.n}</p>
              <h3 className="display" style={{ fontSize: 24, fontWeight: 500, marginBottom: 14 }}>{p.t}</h3>
              <p style={{ fontSize: 15, lineHeight: 1.65, color: "#3E4658" }}>{p.d}</p>
              <div style={{ marginTop: 24, display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: "#1B2436" }}>
                Learn more <ChevronRight size={14} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* DEVOTIONALS — editorial magazine layout */}
      <section style={{ padding: "100px 32px", maxWidth: 1240, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 20, marginBottom: 56 }}>
          <Reveal>
            <h2 className="display" style={{ fontSize: "clamp(28px,3.6vw,44px)", fontWeight: 500 }}>
              Recent devotionals
            </h2>
          </Reveal>
          <Reveal delay={100}>
            <a href="#" style={{ fontSize: 14, fontWeight: 600, color: "#1B2436", textDecoration: "none", borderBottom: "1px solid #1B2436", paddingBottom: 3 }}>
              Browse all devotionals
            </a>
          </Reveal>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 0 }}>
          {[
            { d: "Aug 24, 2026", t: "To Know Jesus Is To Know The Truth" },
            { d: "Aug 17, 2026", t: "Hold On To The Truth" },
            { d: "Aug 11, 2026", t: "Stay Committed" },
          ].map((item, i) => (
            <Reveal key={i} delay={i * 90}>
              <a href="#" className="devhover" style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", padding: "26px 0", borderBottom: "1px solid rgba(27,36,54,0.12)", textDecoration: "none", color: "#1B2436", gap: 20 }}>
                <span style={{ fontSize: 13, color: "#8A6D1A", fontWeight: 600, minWidth: 90, flexShrink: 0 }}>{item.d}</span>
                <h3 className="display dev-title" style={{ fontSize: "clamp(19px,2.4vw,28px)", fontWeight: 400, flex: 1 }}>{item.t}</h3>
                <ArrowUpRight size={20} style={{ flexShrink: 0 }} />
              </a>
            </Reveal>
          ))}
        </div>
      </section>

      {/* GIVING BAND */}
      <section style={{ background: "#C9A227", padding: "80px 32px" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 24 }}>
          <Reveal>
            <h2 className="display" style={{ fontSize: "clamp(26px,3.4vw,40px)", fontWeight: 500, color: "#1B2436", maxWidth: 500 }}>
              Giving reshapes our destiny.
            </h2>
          </Reveal>
          <Reveal delay={100}>
            <button style={{ background: "#1B2436", color: "#F6F1E7", border: "none", padding: "17px 34px", fontSize: 14, fontWeight: 700, letterSpacing: "0.03em", cursor: "pointer" }}>
              Give Now
            </button>
          </Reveal>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: "#151D2C", color: "rgba(246,241,231,0.75)", padding: "70px 32px 40px" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 40 }} className="footer-grid">
            <style>{`@media (min-width: 760px) { .footer-grid { grid-template-columns: 2fr 1fr 1fr 1fr !important; } }`}</style>
            <div>
              <div className="display" style={{ fontSize: 22, fontWeight: 600, color: "#F6F1E7", marginBottom: 14 }}>
                SCO<span style={{ color: "#C9A227" }}>·</span>AN
              </div>
              <p style={{ fontSize: 14, lineHeight: 1.7, maxWidth: 280 }}>
                1, Prophet T.B Joshua Street, Ikotun-Egbe, Lagos, Nigeria. Mon–Fri, 11am–10pm (GMT+1).
              </p>
            </div>
            <div>
              <p style={{ fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase", color: "#C9A227", marginBottom: 16, fontWeight: 600 }}>Explore</p>
              {["About", "Emmanuel TV", "Faith Tools", "Branches"].map((l) => (
                <a key={l} href="#" style={{ display: "block", fontSize: 14, color: "inherit", textDecoration: "none", marginBottom: 10 }}>{l}</a>
              ))}
            </div>
            <div>
              <p style={{ fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase", color: "#C9A227", marginBottom: 16, fontWeight: 600 }}>Connect</p>
              {["Contact", "Visit", "Blog", "Store"].map((l) => (
                <a key={l} href="#" style={{ display: "block", fontSize: 14, color: "inherit", textDecoration: "none", marginBottom: 10 }}>{l}</a>
              ))}
            </div>
            <div>
              <p style={{ fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase", color: "#C9A227", marginBottom: 16, fontWeight: 600 }}>Newsletter</p>
              <p style={{ fontSize: 14, marginBottom: 14 }}>Devotionals, straight to your inbox.</p>
              <div style={{ display: "flex", borderBottom: "1px solid rgba(246,241,231,0.3)", paddingBottom: 8 }}>
                <input placeholder="Email address" style={{ background: "transparent", border: "none", color: "#F6F1E7", fontSize: 14, outline: "none", width: "100%" }} />
                <ArrowUpRight size={18} />
              </div>
            </div>
          </div>
          <div style={{ marginTop: 60, paddingTop: 24, borderTop: "1px solid rgba(246,241,231,0.12)", fontSize: 13, color: "rgba(246,241,231,0.4)" }}>
            © 2026 SCOAN. All Rights Reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
