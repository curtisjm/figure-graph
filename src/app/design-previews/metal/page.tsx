"use client";

import { useState, type CSSProperties } from "react";
import { Fraunces, Inter, JetBrains_Mono } from "next/font/google";
import { MetalFx } from "metal-fx";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--mfx-display",
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--mfx-body",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--mfx-mono",
});

type BronzeChoice = "chromatic" | "css" | "silver-tinted";

const BRONZE_LABELS: Record<BronzeChoice, string> = {
  chromatic: "metal-fx · chromatic preset",
  css: "css · refined gradient",
  "silver-tinted": "metal-fx · silver @ 0.4 strength on bronze bg",
};

export default function MetalDemoPage() {
  const [mode, setMode] = useState<"light" | "dark">("light");
  const [bronzeChoice, setBronzeChoice] = useState<BronzeChoice>("chromatic");

  const fontVars = `${fraunces.variable} ${inter.variable} ${jetbrainsMono.variable}`;

  return (
    <div className={fontVars} data-mode={mode} style={WRAPPER_STYLE}>
      <style dangerouslySetInnerHTML={{ __html: PAGE_CSS }} />

      <header className="mfx-topbar">
        <div className="mfx-brand">
          <div className="mfx-brand-mark" />
          <span className="mfx-brand-name">
            World of <em>Floorcraft</em>
            <span className="mfx-brand-tag">· metal-fx demo</span>
          </span>
        </div>
        <div className="mfx-mode-toggle">
          <button
            onClick={() => setMode("light")}
            aria-pressed={mode === "light"}
          >
            light
          </button>
          <button onClick={() => setMode("dark")} aria-pressed={mode === "dark"}>
            dark
          </button>
        </div>
      </header>

      <main className="mfx-page">
        <section className="mfx-hero">
          <div className="mfx-hero-grid">
            <span className="mfx-tag">demo · no. 03</span>
            <div>
              <p className="mfx-hero-kicker">
                Real WebGL metals, side-by-side with CSS approximations.
              </p>
              <h1 className="mfx-hero-headline">
                Bronze. Silver. <em>Gold.</em>
              </h1>
              <div className="mfx-hero-meta">
                <div>
                  <span className="mfx-meta-key">library</span>
                  <span className="mfx-meta-val">metal-fx · 0.2.3</span>
                </div>
                <div>
                  <span className="mfx-meta-key">presets ship</span>
                  <span className="mfx-meta-val">chromatic · silver · gold</span>
                </div>
                <div>
                  <span className="mfx-meta-key">the bronze problem</span>
                  <span className="mfx-meta-val">solved 3 ways below</span>
                </div>
                <div>
                  <span className="mfx-meta-key">gpu cost</span>
                  <span className="mfx-meta-val">shared context · 1 RAF loop</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ──────────── BRONZE COMPARISON ──────────── */}
        <section className="mfx-section">
          <div className="mfx-section-head">
            <span className="mfx-tag">i / the bronze question</span>
            <div>
              <h2 className="mfx-section-title">
                Three candidates, <em>one tier</em>.
              </h2>
              <p className="mfx-section-lede">
                metal-fx ships only chromatic, silver, and gold presets. Three
                ways to handle bronze. Compare with your eyes, then use the
                podium toggle below to A/B test in context.
              </p>
            </div>
          </div>

          <div className="mfx-bronze-grid">
            {/* (a) chromatic */}
            <div className="mfx-bronze-cell">
              <MetalFx variant="circle" preset="chromatic" theme={mode}>
                <div
                  style={{ width: 144, height: 144, borderRadius: "50%" }}
                />
              </MetalFx>
              <div className="mfx-bronze-meta">
                <div className="mfx-bronze-label">a · chromatic</div>
                <p className="mfx-bronze-note">
                  Real WebGL · iridescent rainbow shimmer. Most alive, but reads
                  as <em>iridescent</em>, not bronze. Inverts the tier
                  hierarchy — entry tier becomes loudest.
                </p>
              </div>
            </div>

            {/* (b) CSS */}
            <div className="mfx-bronze-cell">
              <div className="mfx-disc-css-bronze" />
              <div className="mfx-bronze-meta">
                <div className="mfx-bronze-label">b · css refined</div>
                <p className="mfx-bronze-note">
                  Linear gradient · 135° · seven stops. Reads correctly as
                  bronze. Static — no motion. Hover for the CSS sheen sweep.
                </p>
              </div>
            </div>

            {/* (c) silver-tinted */}
            <div className="mfx-bronze-cell">
              <MetalFx
                variant="circle"
                preset="silver"
                theme={mode}
                strength={0.4}
              >
                <div
                  style={{
                    width: 144,
                    height: 144,
                    borderRadius: "50%",
                    background:
                      "radial-gradient(circle at 50% 30%, #d4a574 0%, #8b5a2b 60%, #4a2f18 100%)",
                  }}
                />
              </MetalFx>
              <div className="mfx-bronze-meta">
                <div className="mfx-bronze-label">c · silver @ 0.4 + bronze bg</div>
                <p className="mfx-bronze-note">
                  Silver shader at low strength over a deep bronze radial. Real
                  motion + correct hue. Most ambitious; least predictable
                  across themes.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ──────────── SILVER & GOLD (the real deal) ──────────── */}
        <section className="mfx-section">
          <div className="mfx-section-head">
            <span className="mfx-tag">ii / silver &amp; gold</span>
            <div>
              <h2 className="mfx-section-title">
                The <em>earned</em> tiers.
              </h2>
              <p className="mfx-section-lede">
                Real metal-fx output. Note the continuous shimmer, the
                anisotropic highlights, the way light catches the surface
                differently at every glance. CSS cannot match this.
              </p>
            </div>
          </div>

          <div className="mfx-tier-grid">
            <div className="mfx-tier-cell">
              <MetalFx variant="circle" preset="silver" theme={mode}>
                <div style={{ width: 180, height: 180, borderRadius: "50%" }} />
              </MetalFx>
              <div className="mfx-tier-label">Silver</div>
              <div className="mfx-tier-note">preset · silver · variant · circle</div>
            </div>
            <div className="mfx-tier-cell">
              <MetalFx variant="circle" preset="gold" theme={mode}>
                <div style={{ width: 180, height: 180, borderRadius: "50%" }} />
              </MetalFx>
              <div className="mfx-tier-label">Gold</div>
              <div className="mfx-tier-note">preset · gold · variant · circle</div>
            </div>
          </div>

          <div className="mfx-tier-buttons">
            <MetalFx variant="button" preset="silver" theme={mode}>
              <button className="mfx-host-btn">Browse silver figures</button>
            </MetalFx>
            <MetalFx variant="button" preset="gold" theme={mode}>
              <button className="mfx-host-btn">Browse gold figures</button>
            </MetalFx>
          </div>
        </section>

        {/* ──────────── PODIUM (with bronze A/B toggle) ──────────── */}
        <section className="mfx-section">
          <div className="mfx-section-head">
            <span className="mfx-tag">iii / in context · podium</span>
            <div>
              <h2 className="mfx-section-title">
                Final <em>standings</em>.
              </h2>
              <p className="mfx-section-lede">
                Use the toggle to compare bronze candidates without leaving
                this section. Silver and gold stay constant (real metal-fx).
              </p>

              <div className="mfx-bronze-toggle">
                <span className="mfx-bronze-toggle-label">bronze:</span>
                {(["chromatic", "css", "silver-tinted"] as BronzeChoice[]).map(
                  (c) => (
                    <button
                      key={c}
                      onClick={() => setBronzeChoice(c)}
                      aria-pressed={bronzeChoice === c}
                      className="mfx-bronze-toggle-btn"
                    >
                      {c === "chromatic"
                        ? "a · chromatic"
                        : c === "css"
                          ? "b · css"
                          : "c · silver-tinted"}
                    </button>
                  ),
                )}
              </div>
            </div>
          </div>

          <div className="mfx-podium-card">
            <div className="mfx-podium-meta">
              <h3 className="mfx-podium-title">
                Blackpool · <em>Open Standard</em>
              </h3>
              <span className="mfx-podium-when">final · 2026.05.10</span>
            </div>
            <div className="mfx-podium-stage">
              {/* 2nd — silver */}
              <div className="mfx-podium-slot mfx-podium-second">
                <MetalFx
                  variant="button"
                  preset="silver"
                  theme={mode}
                  borderRadius={2}
                >
                  <div className="mfx-podium-step second">
                    <div className="mfx-podium-place">ii</div>
                    <p className="mfx-podium-name">Park &amp; Holmberg</p>
                  </div>
                </MetalFx>
              </div>

              {/* 1st — gold */}
              <div className="mfx-podium-slot mfx-podium-first">
                <MetalFx
                  variant="button"
                  preset="gold"
                  theme={mode}
                  borderRadius={2}
                >
                  <div className="mfx-podium-step first">
                    <div className="mfx-podium-place">i</div>
                    <p className="mfx-podium-name">Wirjawan &amp; Tonelli</p>
                  </div>
                </MetalFx>
              </div>

              {/* 3rd — bronze (variable) */}
              <div className="mfx-podium-slot mfx-podium-third">
                <BronzePodiumStep choice={bronzeChoice} mode={mode} />
              </div>
            </div>
            <div className="mfx-podium-bronze-label">
              currently showing bronze as: <em>{BRONZE_LABELS[bronzeChoice]}</em>
            </div>
          </div>
        </section>

        {/* ──────────── ACHIEVEMENT NOTIFICATIONS ──────────── */}
        <section className="mfx-section">
          <div className="mfx-section-head">
            <span className="mfx-tag">iv / in context · achievements</span>
            <div>
              <h2 className="mfx-section-title">
                Earned, <em>noted</em>.
              </h2>
              <p className="mfx-section-lede">
                The &ldquo;wow&rdquo; moment — a notification card with a real metal medal.
                Bronze uses your current selection above.
              </p>
            </div>
          </div>

          <div className="mfx-notifs">
            <Notif
              level="gold"
              when="3d ago · 2026.05.07"
              title="Reached Gold in Foxtrot"
              mode={mode}
            />
            <Notif
              level="silver"
              when="last week · 2026.05.03"
              title="Eleanor reached Silver in Waltz"
              mode={mode}
            />
            <Notif
              level={`bronze:${bronzeChoice}` as never}
              when="2w ago · 2026.04.26"
              title="Welcomed to Bronze · Quickstep"
              mode={mode}
              bronzeChoice={bronzeChoice}
            />
          </div>
        </section>

        {/* ──────────── PROFILE AVATARS ──────────── */}
        <section className="mfx-section">
          <div className="mfx-section-head">
            <span className="mfx-tag">v / in context · profile</span>
            <div>
              <h2 className="mfx-section-title">
                A dancer&apos;s <em>standing</em>.
              </h2>
              <p className="mfx-section-lede">
                Profile avatar gets the metal treatment matching the dancer&apos;s
                highest grade. The initials sit on a luminosity-blended
                overlay so they remain legible against the live shader.
              </p>
            </div>
          </div>

          <div className="mfx-profiles">
            <ProfileCard
              initials="WT"
              name="Wirjawan & Tonelli"
              level="Gold · Open Standard"
              metalLevel="gold"
              mode={mode}
            />
            <ProfileCard
              initials="PH"
              name="Park & Holmberg"
              level="Silver · Open Standard"
              metalLevel="silver"
              mode={mode}
            />
            <ProfileCard
              initials="MV"
              name="Marchetti & Vasilev"
              level="Bronze · Open Standard"
              metalLevel={`bronze:${bronzeChoice}` as never}
              mode={mode}
              bronzeChoice={bronzeChoice}
            />
          </div>
        </section>

        {/* ──────────── INLINE TEXT ──────────── */}
        <section className="mfx-section">
          <div className="mfx-section-head">
            <span className="mfx-tag">vi / in context · inline</span>
            <div>
              <h2 className="mfx-section-title">
                Inline in <em>prose</em>.
              </h2>
              <p className="mfx-section-lede">
                For body text mentions — feed entries, descriptions — we use
                CSS <code>background-clip: text</code>, not metal-fx. WebGL on
                inline spans is overkill. Same look-and-feel, zero GPU cost.
              </p>
            </div>
          </div>

          <div className="mfx-feed">
            <FeedEntry
              author="Eleanor Marchetti"
              when="yesterday · 18:42"
              text={
                <>
                  Marked the{" "}
                  <strong>
                    <span className="mfx-text-silver">Silver</span>
                  </strong>{" "}
                  Reverse Wave today. The lady&apos;s heel-turn was finally
                  clean.
                </>
              }
            />
            <FeedEntry
              author="Wirjawan Studio"
              when="2d ago · 14:20"
              text={
                <>
                  New{" "}
                  <strong>
                    <span className="mfx-text-gold">Gold</span>
                  </strong>{" "}
                  showcase routine for Foxtrot posted in the studio.
                </>
              }
            />
            <FeedEntry
              author="Coach Vasilev"
              when="3d ago · 09:14"
              text={
                <>
                  Welcoming three new dancers to{" "}
                  <strong>
                    <span className="mfx-text-bronze">Bronze</span>
                  </strong>{" "}
                  this season — first time on the floor.
                </>
              }
            />
          </div>
        </section>

        {/* ──────────── FOOTER ──────────── */}
        <footer className="mfx-footer">
          <span>demo · no. 03 · metal-fx live</span>
          <em>Bronze. Silver. Gold.</em>
          <span>for review</span>
        </footer>
      </main>
    </div>
  );
}

/* ─────────────────────── Sub-components ─────────────────────── */

function BronzePodiumStep({
  choice,
  mode,
}: {
  choice: BronzeChoice;
  mode: "light" | "dark";
}) {
  if (choice === "css") {
    return (
      <div className="mfx-podium-step third mfx-css-bronze-bg">
        <div className="mfx-podium-place" style={{ color: "#4a2f18" }}>
          iii
        </div>
        <p className="mfx-podium-name" style={{ color: "#4a2f18" }}>
          Marchetti &amp; Vasilev
        </p>
      </div>
    );
  }

  if (choice === "chromatic") {
    return (
      <MetalFx variant="button" preset="chromatic" theme={mode} borderRadius={2}>
        <div className="mfx-podium-step third">
          <div className="mfx-podium-place">iii</div>
          <p className="mfx-podium-name">Marchetti &amp; Vasilev</p>
        </div>
      </MetalFx>
    );
  }

  // silver-tinted
  return (
    <MetalFx
      variant="button"
      preset="silver"
      theme={mode}
      strength={0.4}
      borderRadius={2}
    >
      <div className="mfx-podium-step third mfx-css-bronze-bg">
        <div className="mfx-podium-place" style={{ color: "#4a2f18" }}>
          iii
        </div>
        <p className="mfx-podium-name" style={{ color: "#4a2f18" }}>
          Marchetti &amp; Vasilev
        </p>
      </div>
    </MetalFx>
  );
}

function Notif({
  level,
  when,
  title,
  mode,
  bronzeChoice,
}: {
  level: "gold" | "silver" | `bronze:${BronzeChoice}`;
  when: string;
  title: string;
  mode: "light" | "dark";
  bronzeChoice?: BronzeChoice;
}) {
  let medal: React.ReactNode;

  if (level === "gold" || level === "silver") {
    medal = (
      <MetalFx variant="circle" preset={level} theme={mode}>
        <div style={{ width: 48, height: 48, borderRadius: "50%" }} />
      </MetalFx>
    );
  } else if (bronzeChoice === "css") {
    medal = <div className="mfx-medal-css-bronze" />;
  } else if (bronzeChoice === "chromatic") {
    medal = (
      <MetalFx variant="circle" preset="chromatic" theme={mode}>
        <div style={{ width: 48, height: 48, borderRadius: "50%" }} />
      </MetalFx>
    );
  } else {
    medal = (
      <MetalFx variant="circle" preset="silver" theme={mode} strength={0.4}>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            background:
              "radial-gradient(circle at 50% 30%, #d4a574 0%, #8b5a2b 60%, #4a2f18 100%)",
          }}
        />
      </MetalFx>
    );
  }

  return (
    <div className="mfx-notif">
      <div className="mfx-notif-medal-slot">{medal}</div>
      <div className="mfx-notif-meta">
        <div className="mfx-notif-title">{title}</div>
        <div className="mfx-notif-when">{when}</div>
      </div>
    </div>
  );
}

function ProfileCard({
  initials,
  name,
  level,
  metalLevel,
  mode,
  bronzeChoice,
}: {
  initials: string;
  name: string;
  level: string;
  metalLevel: "gold" | "silver" | `bronze:${BronzeChoice}`;
  mode: "light" | "dark";
  bronzeChoice?: BronzeChoice;
}) {
  let avatarBg: React.ReactNode;

  const initialsEl = (
    <span
      style={{
        position: "relative",
        zIndex: 2,
        mixBlendMode: "luminosity",
        color: "#0a0a0a",
        fontWeight: 500,
        fontFamily: "var(--mfx-display)",
        fontStyle: "italic",
        fontSize: 28,
      }}
    >
      {initials}
    </span>
  );

  if (metalLevel === "gold" || metalLevel === "silver") {
    avatarBg = (
      <MetalFx variant="circle" preset={metalLevel} theme={mode}>
        <div className="mfx-profile-avatar-host">{initialsEl}</div>
      </MetalFx>
    );
  } else if (bronzeChoice === "css") {
    avatarBg = (
      <div className="mfx-profile-avatar-host mfx-css-bronze-bg">{initialsEl}</div>
    );
  } else if (bronzeChoice === "chromatic") {
    avatarBg = (
      <MetalFx variant="circle" preset="chromatic" theme={mode}>
        <div className="mfx-profile-avatar-host">{initialsEl}</div>
      </MetalFx>
    );
  } else {
    avatarBg = (
      <MetalFx variant="circle" preset="silver" theme={mode} strength={0.4}>
        <div className="mfx-profile-avatar-host mfx-css-bronze-bg">
          {initialsEl}
        </div>
      </MetalFx>
    );
  }

  return (
    <div className="mfx-profile-card">
      <div className="mfx-profile-avatar">{avatarBg}</div>
      <div>
        <h3 className="mfx-profile-name">{name}</h3>
        <div className="mfx-profile-meta">{level}</div>
      </div>
    </div>
  );
}

function FeedEntry({
  author,
  when,
  text,
}: {
  author: string;
  when: string;
  text: React.ReactNode;
}) {
  return (
    <div className="mfx-feed-entry">
      <div className="mfx-feed-head">
        <span className="mfx-feed-author">{author}</span>
        <span className="mfx-feed-when">{when}</span>
      </div>
      <p className="mfx-feed-text">{text}</p>
    </div>
  );
}

/* ─────────────────────── Styles ─────────────────────── */

const WRAPPER_STYLE: CSSProperties = {
  minHeight: "100vh",
};

const PAGE_CSS = `
  /* Scope all overrides to data-mode attribute */

  [data-mode] {
    /* ── Atelier palette ── */
    --mfx-paper: #fafaf9;
    --mfx-surface: #ffffff;
    --mfx-layer: #f4f4f3;
    --mfx-ink: #0a0a0a;
    --mfx-graphite: #404040;
    --mfx-graphite-2: #737373;
    --mfx-graphite-3: #a3a3a3;
    --mfx-rule: #e5e5e5;
    --mfx-rule-strong: #d4d4d4;

    --mfx-wine: #7a2228;
    --mfx-sage: #4d6651;
    --mfx-clay: #a55a32;

    --bg: var(--mfx-paper);
    --card: var(--mfx-surface);
    --layer: var(--mfx-layer);
    --fg: var(--mfx-ink);
    --fg-2: var(--mfx-graphite);
    --fg-3: var(--mfx-graphite-2);
    --fg-4: var(--mfx-graphite-3);
    --border: var(--mfx-rule);
    --border-2: var(--mfx-rule-strong);

    background: var(--bg);
    color: var(--fg);
    font-family: var(--mfx-body), system-ui, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  [data-mode="dark"] {
    --bg: #0a0a0a;
    --card: #141414;
    --layer: #1c1c1c;
    --fg: #fafafa;
    --fg-2: #d4d4d4;
    --fg-3: #a3a3a3;
    --fg-4: #737373;
    --border: #262626;
    --border-2: #404040;

    --mfx-wine: #b5575c;
    --mfx-sage: #9bb29f;
    --mfx-clay: #d49874;
  }

  /* ─── Topbar ─── */
  .mfx-topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 40px;
    border-bottom: 1px solid var(--border);
    background: var(--bg);
    position: sticky;
    top: 0;
    z-index: 50;
    backdrop-filter: blur(8px);
  }

  .mfx-brand {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .mfx-brand-mark {
    width: 24px;
    height: 24px;
    position: relative;
    flex-shrink: 0;
  }
  .mfx-brand-mark::before {
    content: "";
    position: absolute;
    inset: 0;
    border: 1.5px solid var(--fg);
    transform: rotate(45deg);
  }
  .mfx-brand-mark::after {
    content: "";
    position: absolute;
    inset: 4px;
    background: var(--fg);
    transform: rotate(45deg);
  }
  .mfx-brand-name {
    font-family: var(--mfx-display);
    font-weight: 500;
    font-size: 17px;
    letter-spacing: -0.015em;
    color: var(--fg);
  }
  .mfx-brand-name em { font-style: italic; font-weight: 400; }
  .mfx-brand-tag {
    font-family: var(--mfx-mono);
    font-style: normal;
    font-weight: 400;
    color: var(--fg-4);
    margin-left: 8px;
    font-size: 11px;
  }

  .mfx-mode-toggle {
    display: inline-flex;
    gap: 2px;
    padding: 2px;
    background: var(--layer);
    border: 1px solid var(--border);
    border-radius: 2px;
  }
  .mfx-mode-toggle button {
    background: transparent;
    border: 0;
    padding: 6px 14px;
    font-family: var(--mfx-mono);
    font-size: 11px;
    color: var(--fg-3);
    cursor: pointer;
    border-radius: 2px;
  }
  .mfx-mode-toggle button[aria-pressed="true"] {
    background: var(--card);
    color: var(--fg);
    box-shadow: inset 0 0 0 1px var(--border);
  }

  /* ─── Layout ─── */
  .mfx-page {
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 40px 80px;
  }
  @media (max-width: 720px) {
    .mfx-topbar { padding: 16px 20px; }
    .mfx-page { padding: 0 20px 60px; }
  }

  .mfx-tag {
    font-family: var(--mfx-mono);
    font-size: 11px;
    color: var(--fg-4);
    text-transform: lowercase;
    display: inline-flex;
    align-items: center;
    gap: 10px;
  }
  .mfx-tag::before {
    content: "";
    width: 16px;
    height: 1px;
    background: var(--fg-4);
  }

  /* ─── Hero ─── */
  .mfx-hero {
    padding: 80px 0 96px;
    border-bottom: 1px solid var(--border);
  }
  .mfx-hero-grid {
    display: grid;
    grid-template-columns: 80px 1fr;
    gap: 32px;
  }
  @media (max-width: 720px) {
    .mfx-hero-grid { grid-template-columns: 1fr; gap: 16px; }
  }
  .mfx-hero-kicker {
    font-family: var(--mfx-mono);
    font-size: 11px;
    color: var(--fg-4);
    margin: 0 0 12px;
  }
  .mfx-hero-headline {
    font-family: var(--mfx-display);
    font-weight: 300;
    font-size: clamp(52px, 8vw, 112px);
    line-height: 0.92;
    letter-spacing: -0.045em;
    margin: 0 0 40px;
  }
  .mfx-hero-headline em { font-style: italic; font-weight: 200; }
  .mfx-hero-meta {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 24px;
    padding-top: 24px;
    border-top: 1px solid var(--border);
  }
  @media (max-width: 720px) { .mfx-hero-meta { grid-template-columns: repeat(2, 1fr); } }
  .mfx-meta-key {
    display: block;
    font-family: var(--mfx-mono);
    font-size: 10px;
    color: var(--fg-4);
    margin-bottom: 8px;
  }
  .mfx-meta-val {
    display: block;
    font-family: var(--mfx-display);
    font-style: italic;
    font-size: 16px;
    font-weight: 400;
    color: var(--fg);
  }

  /* ─── Section ─── */
  .mfx-section {
    padding: 80px 0;
    border-bottom: 1px solid var(--border);
  }
  .mfx-section:last-of-type { border-bottom: 0; }

  .mfx-section-head {
    display: grid;
    grid-template-columns: 80px 1fr;
    gap: 32px;
    align-items: baseline;
    margin-bottom: 48px;
  }
  @media (max-width: 720px) {
    .mfx-section-head { grid-template-columns: 1fr; gap: 16px; }
  }
  .mfx-section-title {
    font-family: var(--mfx-display);
    font-weight: 400;
    font-size: clamp(36px, 4.5vw, 56px);
    line-height: 1;
    letter-spacing: -0.035em;
    margin: 0 0 16px;
    color: var(--fg);
  }
  .mfx-section-title em { font-style: italic; font-weight: 300; }
  .mfx-section-lede {
    font-size: 16px;
    line-height: 1.55;
    color: var(--fg-2);
    max-width: 580px;
    margin: 0;
  }

  /* ─── Bronze grid ─── */
  .mfx-bronze-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 32px;
    background: var(--card);
    border: 1px solid var(--border);
    padding: 48px 32px;
  }
  @media (max-width: 900px) {
    .mfx-bronze-grid { grid-template-columns: 1fr; }
  }
  .mfx-bronze-cell {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 24px;
    text-align: center;
  }
  .mfx-bronze-meta {
    max-width: 280px;
  }
  .mfx-bronze-label {
    font-family: var(--mfx-mono);
    font-size: 11px;
    color: var(--fg-2);
    margin-bottom: 8px;
    text-transform: lowercase;
  }
  .mfx-bronze-note {
    font-size: 13px;
    line-height: 1.5;
    color: var(--fg-3);
    margin: 0;
  }
  .mfx-bronze-note em {
    font-family: var(--mfx-display);
    font-style: italic;
    color: var(--fg-2);
  }

  /* ─── CSS refined bronze (for option b) ─── */
  .mfx-disc-css-bronze {
    width: 144px;
    height: 144px;
    border-radius: 50%;
    background: linear-gradient(135deg,
      #4a2f18 0%, #8b5a2b 22%, #d4a574 48%,
      #efd0a0 55%, #d4a574 62%, #8b5a2b 82%, #4a2f18 100%);
    box-shadow:
      inset 0 0 0 1px rgba(255,255,255,0.3),
      inset 0 -2px 8px rgba(0,0,0,0.25),
      0 2px 12px rgba(0,0,0,0.15);
    position: relative;
    overflow: hidden;
    isolation: isolate;
  }
  .mfx-disc-css-bronze::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.55) 50%, transparent 70%);
    transform: translateX(-110%);
    transition: transform 0.9s cubic-bezier(0.2, 0.7, 0.1, 1);
  }
  .mfx-disc-css-bronze:hover::after { transform: translateX(110%); }

  .mfx-css-bronze-bg {
    background: linear-gradient(135deg, #4a2f18 0%, #8b5a2b 50%, #4a2f18 100%);
  }

  /* ─── Tier grid (silver + gold) ─── */
  .mfx-tier-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 32px;
    background: var(--card);
    border: 1px solid var(--border);
    padding: 56px 32px;
    margin-bottom: 16px;
  }
  @media (max-width: 720px) { .mfx-tier-grid { grid-template-columns: 1fr; } }
  .mfx-tier-cell {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
  }
  .mfx-tier-label {
    font-family: var(--mfx-display);
    font-weight: 300;
    font-style: italic;
    font-size: 32px;
    line-height: 1;
    margin-top: 8px;
  }
  .mfx-tier-note {
    font-family: var(--mfx-mono);
    font-size: 10px;
    color: var(--fg-4);
  }

  .mfx-tier-buttons {
    display: flex;
    gap: 16px;
    background: var(--card);
    border: 1px solid var(--border);
    padding: 28px;
    flex-wrap: wrap;
  }
  .mfx-host-btn {
    font-family: var(--mfx-body);
    font-size: 13px;
    font-weight: 500;
    padding: 9px 18px;
    background: var(--card);
    color: var(--fg);
    border: 1px solid transparent;
    cursor: pointer;
    border-radius: 2px;
    letter-spacing: -0.005em;
  }

  /* ─── Bronze toggle ─── */
  .mfx-bronze-toggle {
    display: flex;
    gap: 6px;
    margin-top: 18px;
    align-items: center;
    flex-wrap: wrap;
  }
  .mfx-bronze-toggle-label {
    font-family: var(--mfx-mono);
    font-size: 11px;
    color: var(--fg-4);
    margin-right: 4px;
  }
  .mfx-bronze-toggle-btn {
    font-family: var(--mfx-mono);
    font-size: 10px;
    padding: 5px 10px;
    background: var(--card);
    border: 1px solid var(--border);
    color: var(--fg-3);
    cursor: pointer;
    border-radius: 2px;
  }
  .mfx-bronze-toggle-btn[aria-pressed="true"] {
    background: var(--fg);
    color: var(--bg);
    border-color: var(--fg);
  }

  /* ─── Podium ─── */
  .mfx-podium-card {
    background: var(--card);
    border: 1px solid var(--border);
    padding: 48px 32px 40px;
  }
  .mfx-podium-meta {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 36px;
  }
  .mfx-podium-title {
    font-family: var(--mfx-display);
    font-size: 22px;
    font-weight: 400;
    margin: 0;
  }
  .mfx-podium-title em { font-style: italic; font-weight: 300; }
  .mfx-podium-when {
    font-family: var(--mfx-mono);
    font-size: 11px;
    color: var(--fg-4);
  }
  .mfx-podium-stage {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 12px;
    align-items: end;
    max-width: 540px;
    margin: 0 auto;
  }
  .mfx-podium-slot {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    align-items: stretch;
  }
  .mfx-podium-step {
    padding: 20px 14px;
    text-align: center;
    border-radius: 2px 2px 0 0;
  }
  .mfx-podium-step.first  { min-height: 140px; }
  .mfx-podium-step.second { min-height: 108px; }
  .mfx-podium-step.third  { min-height: 82px; }
  .mfx-podium-place {
    font-family: var(--mfx-mono);
    font-size: 11px;
    margin-bottom: 8px;
    color: var(--fg-3);
  }
  .mfx-podium-name {
    font-family: var(--mfx-display);
    font-style: italic;
    font-size: 16px;
    font-weight: 400;
    margin: 0;
    line-height: 1.15;
    color: var(--fg);
  }
  /* The silver and gold steps invert text color since the metal is bright */
  .mfx-podium-first .mfx-podium-place,
  .mfx-podium-first .mfx-podium-name { color: #6b5612; }
  .mfx-podium-second .mfx-podium-place,
  .mfx-podium-second .mfx-podium-name { color: #5a5a5a; }

  .mfx-podium-bronze-label {
    text-align: center;
    margin-top: 24px;
    font-family: var(--mfx-mono);
    font-size: 11px;
    color: var(--fg-4);
  }
  .mfx-podium-bronze-label em {
    color: var(--fg-2);
    font-style: normal;
  }

  /* ─── Notifications ─── */
  .mfx-notifs {
    background: var(--card);
    border: 1px solid var(--border);
    padding: 12px;
  }
  .mfx-notif {
    display: grid;
    grid-template-columns: 56px 1fr;
    gap: 18px;
    align-items: center;
    padding: 16px 14px;
    border-radius: 2px;
  }
  .mfx-notif + .mfx-notif {
    border-top: 1px solid var(--border);
  }
  .mfx-notif-medal-slot {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .mfx-medal-css-bronze {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: linear-gradient(135deg,
      #4a2f18 0%, #8b5a2b 22%, #d4a574 48%,
      #efd0a0 55%, #d4a574 62%, #8b5a2b 82%, #4a2f18 100%);
    box-shadow:
      inset 0 0 0 1px rgba(255,255,255,0.3),
      inset 0 -2px 6px rgba(0,0,0,0.2),
      0 1px 3px rgba(0,0,0,0.1);
  }
  .mfx-notif-meta {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .mfx-notif-title {
    font-family: var(--mfx-display);
    font-size: 17px;
    font-weight: 400;
    line-height: 1.2;
    letter-spacing: -0.015em;
  }
  .mfx-notif-when {
    font-family: var(--mfx-mono);
    font-size: 11px;
    color: var(--fg-4);
  }

  /* ─── Profile cards ─── */
  .mfx-profiles {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }
  @media (max-width: 900px) { .mfx-profiles { grid-template-columns: 1fr; } }
  .mfx-profile-card {
    display: grid;
    grid-template-columns: 80px 1fr;
    gap: 20px;
    align-items: center;
    background: var(--card);
    border: 1px solid var(--border);
    padding: 28px;
  }
  .mfx-profile-avatar {
    width: 80px;
    height: 80px;
    flex-shrink: 0;
  }
  .mfx-profile-avatar-host {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    overflow: hidden;
    position: relative;
  }
  .mfx-profile-name {
    font-family: var(--mfx-display);
    font-size: 22px;
    font-weight: 400;
    margin: 0 0 6px;
    letter-spacing: -0.015em;
    line-height: 1.1;
  }
  .mfx-profile-meta {
    font-family: var(--mfx-mono);
    font-size: 11px;
    color: var(--fg-4);
    text-transform: lowercase;
  }

  /* ─── Feed ─── */
  .mfx-feed {
    background: var(--card);
    border: 1px solid var(--border);
  }
  .mfx-feed-entry {
    padding: 22px 28px;
  }
  .mfx-feed-entry + .mfx-feed-entry {
    border-top: 1px solid var(--border);
  }
  .mfx-feed-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }
  .mfx-feed-author {
    font-family: var(--mfx-display);
    font-style: italic;
    font-size: 15px;
  }
  .mfx-feed-when {
    font-family: var(--mfx-mono);
    font-size: 10px;
    color: var(--fg-4);
  }
  .mfx-feed-text {
    font-size: 14.5px;
    line-height: 1.6;
    color: var(--fg-2);
    margin: 0;
  }
  .mfx-feed-text strong {
    font-family: var(--mfx-display);
    font-weight: 400;
    font-style: italic;
    color: var(--fg);
  }

  /* Inline metal text */
  .mfx-text-bronze, .mfx-text-silver, .mfx-text-gold {
    background-clip: text;
    -webkit-background-clip: text;
    color: transparent;
    -webkit-text-fill-color: transparent;
    font-weight: 500;
  }
  .mfx-text-bronze {
    background-image: linear-gradient(180deg,
      #4a2f18 0%, #8b5a2b 25%, #d4a574 50%,
      #efd0a0 62%, #d4a574 70%, #8b5a2b 88%, #4a2f18 100%);
  }
  .mfx-text-silver {
    background-image: linear-gradient(180deg,
      #5a5a5a 0%, #a8a8a8 25%, #f0f0f0 50%,
      #ffffff 62%, #f0f0f0 70%, #a8a8a8 88%, #5a5a5a 100%);
  }
  .mfx-text-gold {
    background-image: linear-gradient(180deg,
      #6b5612 0%, #c9a227 25%, #f4d472 50%,
      #fff9d6 62%, #f4d472 70%, #c9a227 88%, #6b5612 100%);
  }

  /* Footer */
  .mfx-footer {
    padding: 40px 0 0;
    margin-top: 40px;
    border-top: 1px solid var(--border);
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-family: var(--mfx-mono);
    font-size: 10px;
    color: var(--fg-4);
    text-transform: lowercase;
  }
  .mfx-footer em {
    font-family: var(--mfx-display);
    font-style: italic;
    font-weight: 300;
    color: var(--fg);
    font-size: 13px;
    text-transform: none;
  }
`;
