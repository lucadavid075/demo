"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Play, ChevronRight, Menu, X } from "lucide-react";

function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
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
  return [ref, visible] as const;
}

function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
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

const devotionals = [
  { d: "Aug 24, 2026", t: "To Know Jesus Is To Know The Truth" },
  { d: "Aug 17, 2026", t: "Hold On To The Truth" },
  { d: "Aug 11, 2026", t: "Stay Committed" },
];

const pillars = [
  {
    n: "01",
    t: "The SCOAN",
    d: "An architectural home in Ikotun-Egbe, Lagos — grown through four locations into the church it is today.",
    cls: "",
  },
  {
    n: "02",
    t: "Emmanuel TV",
    d: "Broadcasting the Gospel to millions worldwide since 2006 — changing lives, changing nations, changing the world.",
    cls: "pillar-2",
  },
  {
    n: "03",
    t: "Faith Tools & Charity",
    d: "Practical resources and giving, because generosity reshapes destiny — for the giver and the receiver alike.",
    cls: "",
  },
];

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* NAV */}
      <nav
        className="sticky top-0 z-30 transition-all duration-300"
        style={{
          background: scrolled ? "rgba(246,241,231,0.92)" : "transparent",
          backdropFilter: scrolled ? "blur(10px)" : "none",
          borderBottom: scrolled ? "1px solid rgba(27,36,54,0.08)" : "1px solid transparent",
        }}
      >
        <div className="max-w-[1240px] mx-auto px-8 py-5 flex items-center justify-between">
          <div className="font-display text-[22px] font-semibold tracking-wide">
            SCO<span className="text-gold">·</span>AN
          </div>
          <div className="desktop-nav hidden gap-9 text-sm font-medium tracking-wide">
            {["About", "Emmanuel TV", "Faith Tools", "Branches", "Blog"].map((l) => (
              <a key={l} href="#" className="navlink text-ink no-underline">
                {l}
              </a>
            ))}
          </div>
          <button className="desktop-cta goldbtn hidden bg-ink text-parchment border-none px-6 py-[11px] text-[13px] font-semibold tracking-wider uppercase cursor-pointer">
            Watch Live
          </button>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="mobile-toggle bg-transparent border-none cursor-pointer block"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        {menuOpen && (
          <div className="px-8 pb-6 flex flex-col gap-4 text-[15px]">
            {["About", "Emmanuel TV", "Faith Tools", "Branches", "Blog"].map((l) => (
              <a key={l} href="#" className="text-ink no-underline font-medium">
                {l}
              </a>
            ))}
          </div>
        )}
      </nav>

      {/* HERO */}
      <section className="relative px-8 pt-[70px] pb-[120px] max-w-[1240px] mx-auto">
        <div className="beam" />
        <div className="relative grid grid-cols-1 gap-10">
          <Reveal>
            <p className="text-[13px] font-semibold tracking-[0.18em] uppercase text-goldDark">
              Ikotun-Egbe, Lagos · Est. by Prophet T.B. Joshua
            </p>
          </Reveal>
          <Reveal delay={100}>
            <h1 className="font-display font-medium leading-[1.02] max-w-[900px] tracking-tight text-[clamp(42px,7vw,92px)]">
              The Spirit of Truth,
              <br />
              <span className="italic font-normal text-[#5A4712]">carried to all nations.</span>
            </h1>
          </Reveal>
          <Reveal delay={220}>
            <p className="text-lg leading-relaxed max-w-[520px] text-[#3E4658] mt-2">
              A gathering place in the heart of Lagos, and a broadcast reaching millions
              through Emmanuel TV — changing lives, changing nations, changing the world.
            </p>
          </Reveal>
          <Reveal delay={340}>
            <div className="flex gap-4 flex-wrap mt-3">
              <button className="goldbtn bg-gold text-ink border-none px-8 py-4 text-sm font-bold tracking-wide cursor-pointer flex items-center gap-2">
                <Play size={16} fill="#1B2436" /> Watch Emmanuel TV
              </button>
              <button className="outlinebtn bg-transparent text-ink border-[1.5px] border-ink px-8 py-4 text-sm font-bold tracking-wide cursor-pointer">
                Plan Your Visit
              </button>
            </div>
          </Reveal>
        </div>

        <Reveal delay={450}>
          <div
            className="float relative mt-[70px] ml-auto max-w-[380px] bg-ink text-parchment px-8 py-7"
            style={{ boxShadow: "0 30px 60px -20px rgba(27,36,54,0.4)" }}
          >
            <p className="text-[11px] tracking-[0.15em] uppercase text-gold mb-2.5">Next Crusade</p>
            <h3 className="font-display text-2xl font-medium mb-1.5">
              Brazil, with Pastor Evelyn Joshua
            </h3>
            <p className="text-sm text-parchment/70">18th – 19th September, 2026</p>
          </div>
        </Reveal>
      </section>

      {/* STATEMENT OF FAITH */}
      <section className="bg-ink text-parchment px-8 py-[110px]">
        <div className="max-w-[900px] mx-auto text-center">
          <Reveal>
            <span className="font-display text-gold block text-[80px] leading-[0.5] mb-5">"</span>
          </Reveal>
          <Reveal delay={100}>
            <p className="font-display italic font-normal leading-relaxed text-[clamp(24px,3.4vw,38px)]">
              I will ask the Father, and He will give you another Counselor to be
              with you forever — the Spirit of Truth.
            </p>
          </Reveal>
          <Reveal delay={200}>
            <p className="mt-7 text-[13px] tracking-[0.15em] uppercase text-parchment/55">
              John 14:16–17
            </p>
          </Reveal>
          <Reveal delay={280}>
            <a href="#" className="inline-flex items-center gap-1.5 mt-9 text-gold text-sm font-semibold no-underline">
              Read our full Statement of Faith <ArrowUpRight size={16} />
            </a>
          </Reveal>
        </div>
      </section>

      {/* THREE PILLARS */}
      <section className="px-8 pt-[120px] pb-[60px] max-w-[1240px] mx-auto">
        <Reveal>
          <p className="text-[13px] font-semibold tracking-[0.15em] uppercase text-goldDark mb-3">
            What we do
          </p>
        </Reveal>
        <Reveal delay={80}>
          <h2 className="font-display font-medium max-w-[640px] mb-[70px] text-[clamp(32px,4vw,52px)]">
            One ministry, carried through three doors.
          </h2>
        </Reveal>

        <div className="pillar-grid grid grid-cols-1 gap-7">
          {pillars.map((p) => (
            <div
              key={p.n}
              className={`cardhover ${p.cls} bg-parchmentCard border border-ink/10 px-8 py-10 cursor-pointer`}
            >
              <p className="font-display text-[15px] text-gold font-semibold mb-6">{p.n}</p>
              <h3 className="font-display text-2xl font-medium mb-3.5">{p.t}</h3>
              <p className="text-[15px] leading-relaxed text-[#3E4658]">{p.d}</p>
              <div className="mt-6 flex items-center gap-1.5 text-[13px] font-semibold text-ink">
                Learn more <ChevronRight size={14} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* DEVOTIONALS */}
      <section className="px-8 py-[100px] max-w-[1240px] mx-auto">
        <div className="flex justify-between items-end flex-wrap gap-5 mb-14">
          <Reveal>
            <h2 className="font-display font-medium text-[clamp(28px,3.6vw,44px)]">
              Recent devotionals
            </h2>
          </Reveal>
          <Reveal delay={100}>
            <a href="#" className="text-sm font-semibold text-ink no-underline border-b border-ink pb-0.5">
              Browse all devotionals
            </a>
          </Reveal>
        </div>

        <div className="grid grid-cols-1">
          {devotionals.map((item, i) => (
            <Reveal key={i} delay={i * 90}>
              <a
                href="#"
                className="devhover flex items-baseline justify-between py-6 border-b border-ink/10 no-underline text-ink gap-5"
              >
                <span className="text-[13px] text-goldDark font-semibold min-w-[90px] shrink-0">{item.d}</span>
                <h3 className="font-display dev-title font-normal flex-1 text-[clamp(19px,2.4vw,28px)]">
                  {item.t}
                </h3>
                <ArrowUpRight size={20} className="shrink-0" />
              </a>
            </Reveal>
          ))}
        </div>
      </section>

      {/* GIVING BAND */}
      <section className="bg-gold px-8 py-20">
        <div className="max-w-[1240px] mx-auto flex justify-between items-center flex-wrap gap-6">
          <Reveal>
            <h2 className="font-display font-medium text-ink max-w-[500px] text-[clamp(26px,3.4vw,40px)]">
              Giving reshapes our destiny.
            </h2>
          </Reveal>
          <Reveal delay={100}>
            <button className="bg-ink text-parchment border-none px-9 py-[17px] text-sm font-bold tracking-wide cursor-pointer">
              Give Now
            </button>
          </Reveal>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-inkDeep text-parchment/75 px-8 pt-[70px] pb-10">
        <div className="max-w-[1240px] mx-auto">
          <div className="footer-grid grid grid-cols-1 gap-10">
            <div>
              <div className="font-display text-[22px] font-semibold text-parchment mb-3.5">
                SCO<span className="text-gold">·</span>AN
              </div>
              <p className="text-sm leading-relaxed max-w-[280px]">
                1, Prophet T.B Joshua Street, Ikotun-Egbe, Lagos, Nigeria. Mon–Fri, 11am–10pm (GMT+1).
              </p>
            </div>
            <div>
              <p className="text-xs tracking-wider uppercase text-gold mb-4 font-semibold">Explore</p>
              {["About", "Emmanuel TV", "Faith Tools", "Branches"].map((l) => (
                <a key={l} href="#" className="block text-sm text-inherit no-underline mb-2.5">
                  {l}
                </a>
              ))}
            </div>
            <div>
              <p className="text-xs tracking-wider uppercase text-gold mb-4 font-semibold">Connect</p>
              {["Contact", "Visit", "Blog", "Store"].map((l) => (
                <a key={l} href="#" className="block text-sm text-inherit no-underline mb-2.5">
                  {l}
                </a>
              ))}
            </div>
            <div>
              <p className="text-xs tracking-wider uppercase text-gold mb-4 font-semibold">Newsletter</p>
              <p className="text-sm mb-3.5">Devotionals, straight to your inbox.</p>
              <div className="flex border-b border-parchment/30 pb-2">
                <input
                  placeholder="Email address"
                  className="bg-transparent border-none text-parchment text-sm outline-none w-full"
                />
                <ArrowUpRight size={18} />
              </div>
            </div>
          </div>
          <div className="mt-16 pt-6 border-t border-parchment/10 text-[13px] text-parchment/40">
            © 2026 SCOAN. All Rights Reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
