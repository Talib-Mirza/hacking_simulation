import { useEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  Check,
  CheckCheck,
  Circle,
  LockKeyhole,
  Terminal,
  Globe2,
  Radio,
  Shield,
  BookOpen,
  Fingerprint,
  Command,
  Search,
  X,
  Volume2,
  VolumeX,
  RotateCcw,
  Settings2,
  FileText,
  CheckCircle2,
  Clock3,
  Lightbulb,
  ChevronDown,
  Github,
  Activity,
  Mail,
  Database,
  Network,
  Play,
  Crosshair,
  Flag,
  Menu,
  Download,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  missions,
  glossary,
  toolNames,
  threatAtlas,
  handlerObservations,
} from "./content";
import type { Tool } from "./content";
import NetworkMap from "./components/NetworkMap";
import LabTools from "./components/LabTools";
type View = "overview" | "campaign" | "guide" | "evidence" | "lab";
type Phase = "briefing" | "fieldwork" | "check" | "debrief";
type Save = {
  completed: number[];
  evidence: number[];
  active: number;
  phase: Phase;
  labDone: boolean;
};
const decisionMissions = new Set([0, 6, 9, 11, 13, 16, 17]);
const empty: Save = {
  completed: [],
  evidence: [],
  active: 0,
  phase: "briefing",
  labDone: false,
};
const icons: Record<Tool, LucideIcon> = {
  terminal: Terminal,
  browser: Globe2,
  shodan: Radio,
  cve: Database,
  github: Github,
  wireshark: Activity,
  inbox: Mail,
  report: FileText,
};
function load(): Save {
  try {
    const raw = JSON.parse(localStorage.getItem("signal-zero-v1") || "null");
    if (
      raw &&
      Array.isArray(raw.completed) &&
      raw.completed.every(
        (n: unknown) => Number.isInteger(n) && Number(n) >= 0 && Number(n) < 20,
      ) &&
      Array.isArray(raw.evidence) &&
      Number.isInteger(raw.active) &&
      raw.active >= 0 &&
      raw.active < 20 &&
      ["briefing", "fieldwork", "check", "debrief"].includes(raw.phase)
    ) {
      return {
        ...empty,
        ...raw,
        phase: raw.phase === "check" ? "fieldwork" : raw.phase,
        completed: [...new Set<number>(raw.completed)],
        evidence: raw.evidence.filter(
          (n: unknown) =>
            Number.isInteger(n) && Number(n) >= 0 && Number(n) < 20,
        ),
      };
    }
  } catch {}
  return empty;
}
const pad = (n: number) => String(n).padStart(2, "0");
function Brand({ small = false }: { small?: boolean }) {
  return (
    <div className={"brand " + (small ? "brand-small" : "")}>
      <span className="brand-symbol">
        <span />
        <span />
        <span />
      </span>
      <div>
        SIGNAL ZERO<span>THE MERIDIAN PROTOCOL</span>
      </div>
    </div>
  );
}
function App() {
  const [save, setSave] = useState<Save>(load);
  const [view, setView] = useState<View>("overview");
  const [modal, setModal] = useState<"search" | "settings" | "intel" | null>(
    null,
  );
  const [search, setSearch] = useState("");
  const [hint, setHint] = useState(false);
  const [choice, setChoice] = useState<number | null>(null);
  const [sound, setSound] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [reset, setReset] = useState(false);
  const [toast, setToast] = useState("");
  const [handlerReady, setHandlerReady] = useState(false);
  const decisionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const m = missions[save.active];
  const next = missions.find((x) => !save.completed.includes(x.id));
  const nextId = next?.id ?? 19;
  const percent = Math.round((save.completed.length / 20) * 100);
  const unlocked = missions.filter((x) => x.id <= nextId).map((x) => x.tool);
  const tools = Object.keys(toolNames) as Tool[];
  useEffect(() => {
    try {
      localStorage.setItem("signal-zero-v1", JSON.stringify(save));
    } catch {
      setToast(
        "Storage unavailable. Keep this tab open to retain your progress.",
      );
    }
  }, [save]);
  useEffect(() => {
    const f = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setModal((v) => (v === "search" ? null : "search"));
      }
      if (e.key === "Escape") {
        setModal(null);
        setMobile(false);
      }
    };
    window.addEventListener("keydown", f);
    return () => window.removeEventListener("keydown", f);
  }, []);
  useEffect(() => {
    if (!modal) return;
    const previous = document.activeElement as HTMLElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const dialog = document.querySelector<HTMLElement>("[role=dialog]");
    const focusables = () =>
      Array.from(
        dialog?.querySelectorAll<HTMLElement>(
          'button:not(:disabled),input:not(:disabled),[tabindex="0"]',
        ) || [],
      );
    if (modal === "search") inputRef.current?.focus();
    else focusables()[0]?.focus();
    const trap = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const items = focusables(),
        first = items[0],
        last = items.at(-1);
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener("keydown", trap);
    return () => {
      document.removeEventListener("keydown", trap);
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, [modal]);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 4500);
    return () => clearTimeout(t);
  }, [toast]);
  function clickSound() {
    if (!sound) return;
    try {
      const c = new AudioContext();
      const o = c.createOscillator(),
        g = c.createGain();
      o.connect(g);
      g.connect(c.destination);
      o.frequency.value = 540;
      g.gain.setValueAtTime(0.025, c.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.08);
      o.start();
      o.stop(c.currentTime + 0.08);
      o.onended = () => c.close();
    } catch {}
  }
  function nav(v: View) {
    setView(v);
    setMobile(false);
    clickSound();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function start(id: number) {
    if (id > nextId) return;
    setSave((s) => ({
      ...s,
      active: id,
      phase:
        s.active === id && !s.completed.includes(id) ? s.phase : "briefing",
      labDone: s.active === id && !s.completed.includes(id) ? s.labDone : false,
    }));
    setHint(false);
    setChoice(null);
    nav("lab");
  }
  function phase(p: Phase) {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setSave((s) => ({ ...s, phase: p }));
    setChoice(null);
    setHint(false);
    clickSound();
  }
  useEffect(() => {
    setHandlerReady(false);
    if (view !== "lab" || save.phase !== "fieldwork" || !save.labDone) return;
    const timer = setTimeout(() => {
      setHandlerReady(true);
      setToast("Mira sent new instructions.");
      clickSound();
      if (!decisionMissions.has(save.active))
        setSave((s) => ({
          ...s,
          completed: s.completed.includes(s.active)
            ? s.completed
            : [...s.completed, s.active],
        }));
    }, 2400);
    return () => clearTimeout(timer);
  }, [save.labDone, save.active, save.phase, view]);
  function evidence(command: string) {
    if (command.trim().toLowerCase() !== m.command.toLowerCase()) return;
    setSave((s) => ({
      ...s,
      labDone: true,
      evidence: s.evidence.includes(m.id) ? s.evidence : [...s.evidence, m.id],
    }));
    clickSound();
  }
  useEffect(
    () => () => {
      if (decisionTimer.current) clearTimeout(decisionTimer.current);
    },
    [save.active, view],
  );
  function sendDecision(index: number) {
    setChoice(index);
    clickSound();
    if (index === m.answer) {
      decisionTimer.current = setTimeout(() => {
        finish();
      }, 1800);
    }
  }
  function finish() {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setSave((s) => ({
      ...s,
      completed: s.completed.includes(m.id)
        ? s.completed
        : [...s.completed, m.id],
      phase: "debrief",
    }));
    clickSound();
  }
  function downloadReport() {
    const text = [
      "SIGNAL ZERO — MERIDIAN CASE FILE",
      "Act I: The quiet before the breach",
      "Scope: relay.meridian.test and contained simulation artifacts only.",
      "Limitations: synthetic evidence; no real systems assessed; unverified CVE applicability.",
      `Completed missions: ${save.completed.length}/20`,
      "All evidence is fictional and generated within a contained training simulation.",
      "",
      ...save.evidence.map(
        (id) =>
          `${pad(id + 1)} · ${missions[id].title}\nReproduction (simulated): ${missions[id].command}\nObservation: ${missions[id].evidence}\nInterpretation: ${missions[id].explanation}\n`,
      ),
    ].join("\n");
    const blob = new Blob([text], { type: "text/plain" }),
      url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "meridian-case-file.txt";
    a.click();
    URL.revokeObjectURL(url);
  }
  const ToolIcon = icons[m.tool];
  return (
    <div className="app-shell">
      <aside className={"sidebar " + (mobile ? "mobile-open" : "")}>
        <button
          className="brand-button"
          onClick={() => nav("overview")}
          aria-label="Signal Zero home"
        >
          <Brand />
        </button>
        <div className="campaign-badge">
          <span className="tiny-live" />
          ACT I
          <span>
            {save.completed.length === 20 ? "COMPLETE" : "IN PROGRESS"}
          </span>
        </div>
        <div className="nav-label">YOUR OPERATIONS</div>
        <nav className="main-nav" aria-label="Main navigation">
          {(
            [
              { id: "overview", label: "Command center", icon: Crosshair },
              { id: "campaign", label: "The campaign", icon: Network },
              { id: "guide", label: "Field guide", icon: BookOpen },
              { id: "evidence", label: "Case file", icon: Fingerprint },
            ] as { id: View; label: string; icon: LucideIcon }[]
          ).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={view === id ? "active" : ""}
              onClick={() => nav(id)}
            >
              <Icon size={17} />
              <span>{label}</span>
              {id === "evidence" && save.evidence.length > 0 ? (
                <span className="nav-counter">{save.evidence.length}</span>
              ) : id === "overview" ? (
                <span className="nav-dot" />
              ) : null}
            </button>
          ))}
        </nav>
        <div className="nav-label tools-label">
          YOUR TOOLKIT <span>{new Set(unlocked).size}/8</span>
        </div>
        <nav className="tool-nav" aria-label="Unlocked tools">
          {tools
            .filter((t) => unlocked.includes(t))
            .map((t) => {
              const Icon = icons[t];
              return (
                <button
                  key={t}
                  onClick={() =>
                    start(
                      missions
                        .filter((x) => x.tool === t && x.id <= nextId)
                        .at(-1)!.id,
                    )
                  }
                >
                  <Icon size={16} />
                  {toolNames[t]}
                  <ArrowUpRight size={13} />
                </button>
              );
            })}
          <div className="locked-tools">
            <LockKeyhole size={14} />
            <span>New tools unlock as you learn.</span>
          </div>
        </nav>
        <div className="sidebar-bottom">
          <div className="secure-environment">
            <Shield size={16} />
            <div>
              Contained training network
              <span>Explore freely. Learn by doing.</span>
            </div>
            <span className="tiny-live" />
          </div>
          <button className="profile" onClick={() => setModal("settings")}>
            <span className="profile-avatar">R</span>
            <span>
              Recruit<span>Meridian Security Division</span>
            </span>
            <Settings2 size={16} />
          </button>
        </div>
      </aside>
      {mobile && (
        <button
          className="mobile-scrim"
          aria-label="Close navigation"
          onClick={() => setMobile(false)}
        />
      )}
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumbs">
            <button
              className="mobile-menu"
              onClick={() => setMobile(!mobile)}
              aria-label="Open navigation"
            >
              <Menu size={20} />
            </button>
            <span>WORKSPACE</span>
            <ChevronRight size={12} />
            <span>
              {view === "lab"
                ? "OPERATION " + pad(m.id + 1)
                : view === "overview"
                  ? "COMMAND CENTER"
                  : view === "campaign"
                    ? "THE CAMPAIGN"
                    : view === "guide"
                      ? "FIELD GUIDE"
                      : "CASE FILE"}
            </span>
          </div>
          <div className="top-actions">
            <span className="saved">
              <span className="tiny-live" />
              Progress saved locally
            </span>
            <button
              className="icon-button"
              onClick={() => setSound(!sound)}
              aria-label={sound ? "Mute sound" : "Enable sound"}
              title={sound ? "Mute sound" : "Enable sound"}
            >
              {sound ? <Volume2 size={17} /> : <VolumeX size={17} />}
            </button>
            <button
              className="search-button"
              onClick={() => setModal("search")}
              aria-label="Search field guide"
            >
              <Search size={16} />
              <kbd>⌘ K</kbd>
            </button>
          </div>
        </header>
        <main>
          {view === "overview" && (
            <div className="overview page-enter">
              <div className="page-heading">
                <div>
                  <div className="eyebrow">
                    <span />
                    THE MERIDIAN PROTOCOL <b>/</b> ACT I
                  </div>
                  <h1>
                    The quiet before
                    <br />
                    the breach<span className="mint-period">.</span>
                  </h1>
                  <p>Every expert starts somewhere. Your story starts here.</p>
                </div>
                <button
                  className="text-button campaign-link"
                  onClick={() => nav("campaign")}
                >
                  Explore the campaign <ArrowUpRight size={15} />
                </button>
              </div>
              <div className="dashboard-grid">
                <section className="map-card">
                  <div className="card-topline">
                    <span>
                      <span className="tiny-live" />
                      MERIDIAN NETWORK
                    </span>
                    <span>
                      LIVE SIMULATION <Radio size={12} />
                    </span>
                  </div>
                  <div className="map-ambient" />
                  <NetworkMap chapter={nextId} active />
                  <div className="map-caption">
                    <span className="map-location">
                      <span className="location-cross">+</span> NEW CARTHAGE{" "}
                      <span>/</span> 08:42 AM
                    </span>
                    <button onClick={() => setModal("intel")}>
                      Network overview <ArrowUpRight size={13} />
                    </button>
                  </div>
                  <div className="map-bottom">
                    <div>
                      <span className="status-point" />
                      Systems operational
                    </div>
                    <span className="mono">UNKNOWN SIGNAL DETECTED</span>
                    <span className="signal-bars">
                      <i />
                      <i />
                      <i />
                      <i />
                      <i />
                    </span>
                  </div>
                </section>
                <section className="handler-card">
                  <div className="card-topline">
                    <span>INCOMING TRANSMISSION</span>
                    <span className="transmission-dot" />
                  </div>
                  <div className="handler-person">
                    <div className="handler-avatar">
                      <span>MC</span>
                      <i />
                    </div>
                    <div>
                      <h3>Mira Chen</h3>
                      <span>SECURITY LEAD · YOUR HANDLER</span>
                    </div>
                  </div>
                  <blockquote>
                    “
                    {save.completed.length === 0
                      ? "First day? Welcome to Meridian. We keep this city connected. Someone out there would rather we didn’t."
                      : next?.transmission.split(" — ")[0] ||
                        "We kept the city connected. That matters. Now let’s find out what PALISADE was really for."}
                    ”
                  </blockquote>
                  <div className="message-rule" />
                  <p>
                    {save.completed.length === 0
                      ? "You don’t need to know everything. Just be ready to notice what others miss."
                      : "One observation at a time. Follow the evidence, and keep the city speaking."}
                  </p>
                  <div className="handler-footer">
                    <span className="tiny-live" />
                    ENCRYPTED CHANNEL <LockKeyhole size={12} />
                  </div>
                </section>
                <section className="current-operation">
                  <div className="operation-kicker">
                    <span className="chapter-number">{pad(nextId + 1)}</span>
                    <span>
                      {save.completed.length === 20
                        ? "ACT I COMPLETE"
                        : "YOUR NEXT OPERATION"}
                      <small>{(next ?? missions[19]).category}</small>
                    </span>
                    <span className="difficulty">
                      <i /> {nextId < 8 ? "BEGINNER" : "INTERMEDIATE"}
                    </span>
                  </div>
                  <h2>
                    {save.completed.length === 20
                      ? "You kept the light on."
                      : next?.title}
                  </h2>
                  <p>
                    {save.completed.length === 20
                      ? "The city is still speaking. Your evidence is secure. But PALISADE has one more secret."
                      : next?.subtitle + " A small clue. A bigger story."}
                  </p>
                  <div className="operation-meta">
                    <span>
                      <Clock3 size={14} />
                      {next?.minutes ?? 20} min
                    </span>
                    <span>
                      <BookOpen size={14} />
                      {(next ?? missions[19]).concepts.length} concepts
                    </span>
                    <span>
                      <Terminal size={14} />
                      Hands-on lab
                    </span>
                  </div>
                  <div className="operation-bottom">
                    <div className="concept-tags">
                      {(next ?? missions[19]).concepts.slice(0, 2).map((c) => (
                        <span key={c}>{c}</span>
                      ))}
                    </div>
                    <button
                      className="primary-button"
                      onClick={() =>
                        save.completed.length === 20
                          ? nav("evidence")
                          : start(nextId)
                      }
                    >
                      {save.completed.length === 20
                        ? "Open your case file"
                        : save.active === nextId && save.phase !== "briefing"
                          ? "Continue operation"
                          : "Begin operation"}
                      <ArrowRight size={17} />
                    </button>
                  </div>
                </section>
                <section className="progress-card">
                  <div className="card-topline">
                    <span>YOUR ACT I JOURNEY</span>
                    <Flag size={14} />
                  </div>
                  <div className="progress-content">
                    <div
                      className="progress-ring"
                      style={
                        {
                          "--progress": `${percent * 3.6}deg`,
                        } as React.CSSProperties
                      }
                    >
                      <div>
                        <strong>
                          {percent}
                          <span>%</span>
                        </strong>
                      </div>
                    </div>
                    <div>
                      <strong>
                        {save.completed.length}
                        <span> / 20</span>
                      </strong>
                      <p>operations completed</p>
                      <span className="level-tag">
                        {save.completed.length === 20
                          ? "FIELD OPERATIVE"
                          : save.completed.length < 8
                            ? "CURIOUS NEWCOMER"
                            : "SECURITY APPRENTICE"}
                      </span>
                    </div>
                  </div>
                  <div className="journey-markers">
                    {missions.map((x) => (
                      <span
                        key={x.id}
                        className={
                          save.completed.includes(x.id)
                            ? "done"
                            : x.id === nextId
                              ? "current"
                              : ""
                        }
                        title={`Operation ${x.id + 1}: ${x.title}`}
                      />
                    ))}
                  </div>
                  <p className="progress-note">
                    {save.completed.length === 0
                      ? "No experience required. Just a little curiosity."
                      : `${save.evidence.length} pieces of evidence. One story unfolding.`}
                  </p>
                </section>
              </div>
              <section className="up-next">
                <div className="section-heading">
                  <h2>A story worth following</h2>
                  <span>LEARN THE CRAFT. FOLLOW THE SIGNAL.</span>
                </div>
                <div className="chapter-preview">
                  {[0, 1, 2].map((offset) => {
                    const x = missions[Math.min(nextId + offset, 19)],
                      locked = x.id > nextId;
                    return (
                      <button
                        className={
                          "preview-card " + (offset === 0 ? "available" : "")
                        }
                        key={offset}
                        disabled={locked}
                        onClick={() => start(x.id)}
                      >
                        <div className="preview-top">
                          <span>OPERATION {pad(x.id + 1)}</span>
                          {locked ? (
                            <LockKeyhole size={13} />
                          ) : (
                            <ArrowUpRight size={15} />
                          )}
                        </div>
                        <h3>{x.title}</h3>
                        <p>{x.category}</p>
                        <div className="preview-line">
                          <span>
                            {locked
                              ? "Complete previous operation"
                              : "Ready when you are"}
                          </span>
                          {!locked && <span className="tiny-live" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>
              <footer className="page-footer">
                <span>
                  <Shield size={13} />
                  Fictional targets. Real skills.
                </span>
                <span>MAKE YOUR FIRST MOVE. THE CITY IS LISTENING.</span>
                <span>
                  EST. 2026 <span className="footer-cross">+</span>
                </span>
              </footer>
            </div>
          )}
          {view === "campaign" && (
            <div className="standard-page page-enter">
              <div className="eyebrow">ACT I / 20 OPERATIONS</div>
              <h1>
                Follow the signal<span className="mint-period">.</span>
              </h1>
              <p className="page-description">
                From your first command to your first incident. Every operation
                builds on the last.
              </p>
              <div className="act-banner">
                <Radio size={25} />
                <div>
                  <h3>The Meridian Protocol</h3>
                  <p>
                    A forgotten relay. An old enemy. A city that can’t go quiet.
                  </p>
                </div>
                <span>{save.completed.length} / 20 COMPLETE</span>
              </div>
              <div className="campaign-list">
                {missions.map((x) => {
                  const done = save.completed.includes(x.id),
                    locked = x.id > nextId,
                    Icon = icons[x.tool];
                  return (
                    <button
                      className={
                        "campaign-row " +
                        (locked ? "locked" : done ? "done" : "available")
                      }
                      key={x.id}
                      disabled={locked}
                      onClick={() => start(x.id)}
                    >
                      <span className="row-number">
                        {done ? <Check size={17} /> : pad(x.id + 1)}
                      </span>
                      <span className="campaign-row-copy">
                        <span>{x.category}</span>
                        <strong>{x.title}</strong>
                        <small>{x.subtitle}</small>
                      </span>
                      <span className="row-concepts">
                        {x.concepts.slice(0, 2).join(" · ")}
                      </span>
                      <span className="row-time">
                        <Icon size={15} />
                        {x.minutes} min
                      </span>
                      {locked ? (
                        <LockKeyhole size={15} />
                      ) : (
                        <ArrowUpRight size={18} />
                      )}
                    </button>
                  );
                })}
              </div>
              <div className="end-of-act">
                ACT II <span>Beyond the perimeter</span>
                <span className="muted">
                  A future chapter. Your mission today is Act I.
                </span>
              </div>
            </div>
          )}
          {view === "lab" && (
            <div className="lab-page page-enter">
              <button className="back-link" onClick={() => nav("overview")}>
                <ArrowLeft size={15} />
                Command center
              </button>
              <div className="lab-page-heading">
                <div>
                  <div className="eyebrow">
                    OPERATION {pad(m.id + 1)} <b>/</b> {m.category}
                  </div>
                  <h1>
                    {m.title}
                    <span className="mint-period">.</span>
                  </h1>
                </div>
                <span className="lab-duration">
                  <Clock3 size={15} />
                  {m.minutes} MIN
                </span>
              </div>
              <div className="mission-steps">
                {(["briefing", "fieldwork", "check", "debrief"] as Phase[]).map(
                  (p, i) => (
                    <div
                      className={
                        (handlerReady && save.phase === "fieldwork"
                          ? "check"
                          : save.phase) === p
                          ? "active"
                          : [
                                "briefing",
                                "fieldwork",
                                "check",
                                "debrief",
                              ].indexOf(
                                handlerReady && save.phase === "fieldwork"
                                  ? "check"
                                  : save.phase,
                              ) > i
                            ? "done"
                            : ""
                      }
                      key={p}
                    >
                      <span>
                        {["briefing", "fieldwork", "check", "debrief"].indexOf(
                          handlerReady && save.phase === "fieldwork"
                            ? "check"
                            : save.phase,
                        ) > i ? (
                          <Check size={12} />
                        ) : (
                          pad(i + 1)
                        )}
                      </span>
                      {p === "briefing"
                        ? "Arrival"
                        : p === "fieldwork"
                          ? "Investigation"
                          : p === "check"
                            ? "Mira’s channel"
                            : "Aftermath"}
                    </div>
                  ),
                )}
              </div>
              {save.phase === "briefing" && (
                <div className="briefing-layout">
                  <article className="lesson-card">
                    <div className="eyebrow">THE STORY SO FAR</div>
                    <p className="story-intro">{m.intro}</p>
                    <div className="handler-inline">
                      <span className="mini-avatar">MC</span>
                      <div>
                        <strong>
                          MIRA CHEN <span>SECURE LINE</span>
                        </strong>
                        <p>{m.transmission}</p>
                      </div>
                    </div>
                    <div className="lesson-divider" />
                    <div className="eyebrow">BEFORE YOU GO IN</div>
                    {m.lesson.map((p, i) => (
                      <div className="lesson-section" key={i}>
                        <span>{pad(i + 1)}</span>
                        <p>{p}</p>
                      </div>
                    ))}
                    <button
                      className="primary-button"
                      onClick={() => phase("fieldwork")}
                    >
                      Enter the field <ArrowRight size={17} />
                    </button>
                  </article>
                  <aside className="briefing-aside">
                    <div className="objectives-card">
                      <span className="eyebrow">YOUR ASSIGNMENT</span>
                      <Crosshair size={27} />
                      <h3>
                        Notice. Understand.
                        <br />
                        Then act.
                      </h3>
                      <p>{m.objective}</p>
                      <div className="lesson-divider" />
                      <span className="eyebrow">YOU’LL LEARN</span>
                      {m.concepts.map((c) => (
                        <div className="learn-item" key={c}>
                          <Circle size={10} />
                          {c}
                        </div>
                      ))}
                      <div className="tool-unlock">
                        <ToolIcon size={19} />
                        <div>
                          ISSUED FOR THIS OPERATION
                          <strong>{toolNames[m.tool]}</strong>
                        </div>
                      </div>
                    </div>
                    <div className="lab-boundary">
                      <Shield size={18} />
                      <p>
                        All hosts, messages, and data are simulated. Your
                        actions stay inside this training environment.
                      </p>
                    </div>
                    <NetworkMap compact chapter={m.id} />
                  </aside>
                </div>
              )}
              {(save.phase === "fieldwork" || save.phase === "check") && (
                <div className="fieldwork-layout">
                  <aside className="fieldwork-instructions">
                    <span className="eyebrow">
                      FIELD NOTES / {pad(m.id + 1)}
                    </span>
                    <h2>Your objective</h2>
                    <p>{m.objective}</p>
                    <div className="handler-inline">
                      <span className="mini-avatar">MC</span>
                      <div>
                        <strong>MIRA</strong>
                        <p>{m.transmission}</p>
                      </div>
                    </div>
                    <button
                      className="hint-button"
                      onClick={() => setHint(!hint)}
                    >
                      <Lightbulb size={16} />
                      {hint
                        ? "Hide the hint"
                        : "A nudge in the right direction"}
                      <ChevronDown size={14} />
                    </button>
                    {hint && (
                      <div className="hint-content">
                        <p>
                          {m.tool === "terminal"
                            ? "Type this command in the terminal, then press Enter."
                            : "Use the tool’s controls to inspect the relevant artifact. Your task is:"}
                        </p>
                        <code>{m.command}</code>
                      </div>
                    )}
                    <details className="field-reference">
                      <summary>
                        <BookOpen size={15} />
                        Review the concepts
                      </summary>
                      {m.lesson.map((p, i) => (
                        <p key={i}>{p}</p>
                      ))}
                    </details>
                    <div
                      className={
                        "evidence-state " + (save.labDone ? "secured" : "")
                      }
                    >
                      <Fingerprint size={20} />
                      <div>
                        <strong>
                          {save.labDone
                            ? "Observation captured"
                            : "Your notebook is open"}
                        </strong>
                        <span>
                          {save.labDone
                            ? "Mira can see what you found."
                            : "Explore. Useful findings are saved as you work."}
                        </span>
                      </div>
                    </div>
                    <button
                      className={
                        "supervisor-presence " +
                        (save.labDone ? "observing" : "")
                      }
                      disabled={!handlerReady}
                      onClick={() =>
                        document
                          .querySelector(".handler-review")
                          ?.scrollIntoView({
                            behavior: "smooth",
                            block: "start",
                          })
                      }
                    >
                      <span className="tiny-live" />
                      <span>
                        {handlerReady
                          ? "Read Mira’s new message →"
                          : save.labDone
                            ? "Mira is reviewing your findings…"
                            : "Mira is observing your workspace."}
                      </span>
                    </button>
                  </aside>
                  <div className="tool-workspace">
                    <div className="workspace-toolbar">
                      <span>
                        <ToolIcon size={15} />
                        {toolNames[m.tool]}
                      </span>
                      <span>
                        <span className="tiny-live" />
                        LOCAL SIMULATION
                      </span>
                    </div>
                    <LabTools
                      key={`${m.id}-${m.tool}`}
                      tool={m.tool}
                      command={m.command}
                      target="relay.meridian.test"
                      onEvidence={evidence}
                      completed={save.labDone}
                    />
                    {save.labDone && (
                      <section
                        className={
                          "handler-review " + (handlerReady ? "ready" : "")
                        }
                        aria-live="polite"
                      >
                        <div className="handler-review-header">
                          <span className="mini-avatar">MC</span>
                          <span>
                            MIRA CHEN{" "}
                            <small>
                              SECURE CHANNEL · WATCHING YOUR WORKSPACE
                            </small>
                          </span>
                          <span className="tiny-live" />
                        </div>
                        {!handlerReady ? (
                          <div className="handler-typing">
                            <i />
                            <i />
                            <i />
                            <span>Mira is looking at your screen</span>
                          </div>
                        ) : (
                          <>
                            <p className="handler-observation">
                              {handlerObservations[m.id]}
                            </p>
                            {decisionMissions.has(m.id) ? (
                              <>
                                <p className="handler-question">{m.question}</p>
                                <div className="handler-decisions">
                                  {m.options.map((option, i) => (
                                    <button
                                      key={option}
                                      disabled={choice === m.answer}
                                      className={choice === i ? "sent" : ""}
                                      onClick={() => sendDecision(i)}
                                    >
                                      <ArrowUpRight size={14} />
                                      {option}
                                    </button>
                                  ))}
                                </div>
                                {choice !== null && (
                                  <div className="handler-response">
                                    <strong>
                                      {choice === m.answer
                                        ? "Mira · That’s the call."
                                        : "Mira · Let’s think that through."}
                                    </strong>
                                    <p>{m.explanation}</p>
                                    {choice === m.answer && (
                                      <span className="reply-delivered">
                                        <CheckCheck size={12} />
                                        Delivered · Mira is sending your next
                                        instructions
                                      </span>
                                    )}
                                  </div>
                                )}
                              </>
                            ) : (
                              <>
                                <div className="mentor-annotation">
                                  <p>{m.explanation}</p>
                                </div>
                                <div className="live-story-reveal">
                                  <Radio size={17} />
                                  <p>{m.reveal}</p>
                                </div>
                                <div className="next-dispatch">
                                  <div>
                                    <span>
                                      {m.id === 19
                                        ? "FINAL TRANSMISSION"
                                        : "MIRA ATTACHED YOUR NEXT ASSIGNMENT"}
                                    </span>
                                    <strong>
                                      {m.id === 19
                                        ? "One last message."
                                        : missions[m.id + 1].title}
                                    </strong>
                                  </div>
                                  <button
                                    className="primary-button"
                                    onClick={() =>
                                      m.id === 19
                                        ? phase("debrief")
                                        : start(m.id + 1)
                                    }
                                  >
                                    {m.id === 19
                                      ? "Read the last transmission"
                                      : "Follow the lead"}
                                    <ArrowRight size={16} />
                                  </button>
                                </div>
                              </>
                            )}
                          </>
                        )}
                      </section>
                    )}
                  </div>
                </div>
              )}
              {save.phase === "debrief" && (
                <section className="debrief-card">
                  <div className="completion-icon">
                    <Check size={32} />
                  </div>
                  <div className="eyebrow">
                    OPERATION {pad(m.id + 1)} / COMPLETE
                  </div>
                  <h2>
                    {m.id === 19
                      ? "The city is still speaking."
                      : "One step closer to the truth."}
                  </h2>
                  <p>{m.explanation}</p>
                  <div className="debrief-evidence">
                    <Fingerprint size={22} />
                    <div>
                      <span>EVIDENCE ADDED TO YOUR CASE</span>
                      <p>{m.evidence}</p>
                    </div>
                  </div>
                  <blockquote>{m.reveal}</blockquote>
                  <div className="debrief-unlocks">
                    <CheckCircle2 size={16} />
                    {m.id < 19 &&
                    !missions
                      .slice(0, m.id + 1)
                      .some((x) => x.tool === missions[m.id + 1].tool)
                      ? `New tool unlocked: ${toolNames[missions[m.id + 1].tool]}`
                      : m.id === 19
                        ? "Act I completed · 20 operations · your first case closed"
                        : `Operation ${pad(m.id + 2)} unlocked`}
                  </div>
                  <div className="debrief-actions">
                    <button
                      className="text-button"
                      onClick={() => nav("evidence")}
                    >
                      Review case file
                      <ArrowUpRight size={15} />
                    </button>
                    <button
                      className="primary-button"
                      onClick={() => {
                        if (m.id < 19) start(m.id + 1);
                        else nav("overview");
                      }}
                    >
                      {m.id === 19 ? "Return to command" : "Next operation"}
                      <ArrowRight size={17} />
                    </button>
                  </div>
                </section>
              )}
            </div>
          )}
          {view === "guide" && (
            <div className="standard-page page-enter">
              <div className="eyebrow">A LITTLE KNOWLEDGE GOES A LONG WAY</div>
              <h1>
                Your field guide<span className="mint-period">.</span>
              </h1>
              <p className="page-description">
                Plain-language references. Always here when you need a second
                look.
              </p>
              <div className="guide-search">
                <Search size={19} />
                <input
                  aria-label="Search concepts"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Find a concept, protocol, or principle…"
                />
              </div>
              <div className="glossary-grid">
                {glossary
                  .filter(([t, d]) =>
                    (t + " " + d).toLowerCase().includes(search.toLowerCase()),
                  )
                  .map(([title, desc], i) => (
                    <article key={title}>
                      <span className="glossary-number">
                        {pad(i + 1)} / FIELD REFERENCE
                      </span>
                      <h3>{title}</h3>
                      <p>{desc}</p>
                    </article>
                  ))}
              </div>
              {glossary.filter(([t, d]) =>
                (t + " " + d).toLowerCase().includes(search.toLowerCase()),
              ).length === 0 && (
                <div className="empty-state">
                  <BookOpen size={32} />
                  <h3>No matching concept yet.</h3>
                  <p>Try “DNS”, “port”, “session”, or “trust”.</p>
                  <button className="text-button" onClick={() => setSearch("")}>
                    Clear search
                  </button>
                </div>
              )}
              <div className="threat-atlas">
                <div className="section-heading">
                  <h2>Beyond the obvious</h2>
                  <span>THE THREAT-SURFACE ATLAS</span>
                </div>
                <p>
                  Wider field notes from the team. New surfaces appear as your
                  experience grows.
                </p>
                {threatAtlas
                  .filter((x) => x.unlock <= nextId)
                  .map((x) => (
                    <details key={x.title}>
                      <summary>
                        <Shield size={16} />
                        {x.title}
                        <ChevronDown size={15} />
                      </summary>
                      <blockquote>{x.clue}</blockquote>
                      <p>{x.body}</p>
                    </details>
                  ))}
              </div>
              <div className="field-course">
                <h2>Your mission notes</h2>
                <p>
                  Detailed lessons become available as your investigation
                  progresses.
                </p>
                {missions
                  .filter((x) => x.id <= nextId)
                  .map((x) => (
                    <details key={x.id}>
                      <summary>
                        <span>{pad(x.id + 1)}</span>
                        {x.title}
                        <ChevronDown size={16} />
                      </summary>
                      {x.lesson.map((p, i) => (
                        <p key={i}>{p}</p>
                      ))}
                    </details>
                  ))}
              </div>
            </div>
          )}
          {view === "evidence" && (
            <div className="standard-page page-enter">
              <div className="eyebrow">MERIDIAN / INVESTIGATION 001</div>
              <div className="evidence-heading">
                <h1>
                  Nothing is just a detail<span className="mint-period">.</span>
                </h1>
                <button
                  className="secondary-button"
                  onClick={downloadReport}
                  disabled={!save.evidence.length}
                >
                  <Download size={15} />
                  Export case file
                </button>
              </div>
              <p className="page-description">
                Your observations, connected. {save.evidence.length} pieces of
                evidence secured.
              </p>
              {!save.evidence.length ? (
                <div className="empty-case">
                  <Fingerprint size={44} />
                  <h2>Every case starts with a question.</h2>
                  <p>
                    Your notebook is empty. Complete your first field assignment
                    to collect evidence.
                  </p>
                  <button className="primary-button" onClick={() => start(0)}>
                    Start investigating
                    <ArrowRight size={16} />
                  </button>
                </div>
              ) : (
                <div className="evidence-timeline">
                  {save.evidence.map((id) => (
                    <article key={id}>
                      <div className="evidence-pin">
                        <Fingerprint size={18} />
                      </div>
                      <div>
                        <span className="eyebrow">
                          EXHIBIT {pad(id + 1)} / {missions[id].category}
                        </span>
                        <h3>{missions[id].title}</h3>
                        <p>{missions[id].evidence}</p>
                        <span className="evidence-verified">
                          <CheckCheck size={13} />
                          OBSERVED IN SIMULATED LAB
                        </span>
                      </div>
                      <button
                        className="icon-button"
                        aria-label={`Review ${missions[id].title}`}
                        onClick={() => start(id)}
                      >
                        <ArrowUpRight size={17} />
                      </button>
                    </article>
                  ))}
                </div>
              )}
              <div className="case-limitations">
                <Shield size={18} />
                <p>
                  <strong>Good evidence has honest limits.</strong> This case
                  file contains fictional training observations. A version
                  banner is a research lead; confirmed exposure and confirmed
                  exploitability are different conclusions.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
      {toast && (
        <div className="toast" role="status">
          <CheckCircle2 size={17} />
          {toast}
          {toast === "Mira sent new instructions." && (
            <button
              onClick={() => {
                document
                  .querySelector(".handler-review")
                  ?.scrollIntoView({ behavior: "smooth", block: "start" });
                setToast("");
              }}
            >
              Open channel
              <ArrowRight size={13} />
            </button>
          )}
        </div>
      )}
      {modal && (
        <div className="modal-backdrop" onClick={() => setModal(null)}>
          <section
            className={"modal " + (modal === "intel" ? "intel-modal" : "")}
            role="dialog"
            aria-modal="true"
            aria-label={
              modal === "search"
                ? "Search field guide"
                : modal === "settings"
                  ? "Settings"
                  : "Network overview"
            }
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close icon-button"
              aria-label="Close dialog"
              onClick={() => {
                setModal(null);
                setReset(false);
              }}
            >
              <X size={20} />
            </button>
            {modal === "search" ? (
              <>
                <div className="eyebrow">KNOWLEDGE AT YOUR FINGERTIPS</div>
                <h2>Follow your curiosity.</h2>
                <div className="guide-search">
                  <Search size={19} />
                  <input
                    ref={inputRef}
                    aria-label="Search field guide"
                    placeholder="Search the field guide…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <div className="search-results">
                  {glossary
                    .filter(([t, d]) =>
                      (t + " " + d)
                        .toLowerCase()
                        .includes(search.toLowerCase()),
                    )
                    .map(([t, d]) => (
                      <button
                        key={t}
                        onClick={() => {
                          setModal(null);
                          nav("guide");
                        }}
                      >
                        <BookOpen size={17} />
                        <span>
                          <strong>{t}</strong>
                          <small>{d}</small>
                        </span>
                        <ArrowUpRight size={15} />
                      </button>
                    ))}
                  {!glossary.some(([t, d]) =>
                    (t + " " + d).toLowerCase().includes(search.toLowerCase()),
                  ) && <p>No results. Try a broader term.</p>}
                </div>
                <div className="search-footer">
                  <kbd>ESC</kbd> to close <span>12 FIELD REFERENCES</span>
                </div>
              </>
            ) : modal === "settings" ? (
              <>
                <div className="eyebrow">YOUR WORKSPACE</div>
                <h2>Stay in the flow.</h2>
                <div className="setting-row">
                  <div>
                    <strong>Interface sound</strong>
                    <p>A subtle cue when you make progress.</p>
                  </div>
                  <button
                    className={"toggle " + (sound ? "on" : "")}
                    aria-label="Toggle interface sound"
                    aria-pressed={sound}
                    onClick={() => setSound(!sound)}
                  >
                    <span />
                  </button>
                </div>
                <div className="setting-row">
                  <div>
                    <strong>Checkpoint</strong>
                    <p>
                      Saved in this browser. {save.completed.length} of 20
                      operations complete.
                    </p>
                  </div>
                  <CheckCircle2 size={20} />
                </div>
                <p className="settings-note">
                  Your progress stays on this device. Export your case file to
                  keep a copy of your evidence. The lab never contacts real
                  targets.
                </p>
                {reset ? (
                  <div className="reset-confirm">
                    <p>
                      Start over? Your saved missions and evidence will be
                      cleared from this browser.
                    </p>
                    <button
                      className="danger-button"
                      onClick={() => {
                        setSave(empty);
                        setView("overview");
                        setReset(false);
                        setModal(null);
                        setToast("Fresh start. Welcome back to Meridian.");
                      }}
                    >
                      Clear progress
                    </button>
                    <button
                      className="text-button"
                      onClick={() => setReset(false)}
                    >
                      Keep my progress
                    </button>
                  </div>
                ) : (
                  <button
                    className="reset-button"
                    onClick={() => setReset(true)}
                  >
                    <RotateCcw size={14} />
                    Restart the story
                  </button>
                )}
              </>
            ) : (
              <>
                <div className="eyebrow">MERIDIAN / INFRASTRUCTURE</div>
                <h2>A city held together by signals.</h2>
                <p className="page-description">
                  The dispatch backbone keeps emergency teams connected. Relay
                  07 is the legacy system at the edge of your investigation.
                </p>
                <NetworkMap chapter={nextId} active />
                <div className="network-zones">
                  <div>
                    <span className="tiny-live" />
                    <strong>Meridian HQ</strong>
                    <p>Your security operations center.</p>
                  </div>
                  <div>
                    <span className="tiny-live" />
                    <strong>Dispatch backbone</strong>
                    <p>Critical service. Keep it online.</p>
                  </div>
                  <div>
                    <span className="amber-dot" />
                    <strong>Relay 07</strong>
                    <p>Your authorized training target.</p>
                  </div>
                </div>
                <button
                  className="primary-button"
                  onClick={() => {
                    setModal(null);
                    start(nextId);
                  }}
                >
                  Investigate the relay
                  <ArrowRight size={16} />
                </button>
              </>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
export default App;
