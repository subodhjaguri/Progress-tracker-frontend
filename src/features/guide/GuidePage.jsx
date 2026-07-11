import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import {
  Crown,
  BriefcaseBusiness,
  UsersRound,
  ShieldCheck,
  HardHat,
  Building2,
  ClipboardList,
  ChevronRight,
  ChevronDown,
  ArrowDownToLine,
  ArrowUpFromLine,
  Clock3,
  CheckCircle2,
  AlertTriangle,
  Eye,
  Play,
  RotateCcw,
} from "lucide-react";
import { PageHeading } from "../../components/layout/PageHeading.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

// ── Who's who ────────────────────────────────────────────────────────────────
const ROLES = {
  superAdmin: {
    icon: Crown,
    tone: "green",
    name: "Super Admin",
    role: "The owner",
    blurb: "Sees everything across every site.",
    can: ["Creates managers", "Views all projects & reports"],
  },
  manager: {
    icon: BriefcaseBusiness,
    tone: "blue",
    name: "Manager",
    role: "Runs the projects",
    blurb: "Owns the sites they're given.",
    can: ["Creates projects & work orders", "Adds contractors & supervisors", "Records material deliveries"],
  },
  contractor: {
    icon: UsersRound,
    tone: "amber",
    name: "Contractor",
    role: "Does the work",
    blurb: "Execution owner on a work order.",
    can: ["Updates progress & photos", "Manages labour & attendance"],
  },
  supervisor: {
    icon: ShieldCheck,
    tone: "violet",
    name: "Supervisor",
    role: "Guards the materials",
    blurb: "Material custodian for a site.",
    can: ["Confirms deliveries", "Logs daily usage"],
  },
  labour: {
    icon: HardHat,
    tone: "muted",
    name: "Labour",
    role: "On the ground",
    blurb: "No login — managed by the contractor.",
    can: ["Attendance tracked", "Assigned to labour tasks"],
  },
};

function RoleCard({ data, compact }) {
  const Icon = data.icon;
  return (
    <div className={`role-card tone-${data.tone} ${compact ? "compact" : ""}`}>
      <div className="role-icon">
        <Icon size={compact ? 18 : 22} />
      </div>
      <div className="role-body">
        <strong>{data.name}</strong>
        <span className="role-role">{data.role}</span>
        {!compact && (
          <>
            <p>{data.blurb}</p>
            <ul>
              {data.can.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}

// ── The work chain ───────────────────────────────────────────────────────────
const CHAIN = [
  { icon: Building2, tone: "green", term: "Project", def: "The work site — e.g. Riverside Hotel." },
  { icon: ClipboardList, tone: "blue", term: "Work Order", def: "One job on that site, e.g. Foundation. The unit of execution that gets tracked." },
  { icon: UsersRound, tone: "amber", term: "Contractor", def: "One contractor owns each work order." },
  { icon: HardHat, tone: "muted", term: "Labour & tasks", def: "The crew and sub-tasks under that contractor." },
];

// ── Material flow (animated) ──────────────────────────────────────────────────
const FLOW = [
  {
    actor: "Manager",
    icon: ArrowDownToLine,
    title: "Records a delivery",
    caption: "Picks the project and logs what arrived.",
    chip: "100 bags · Cement",
    badge: "Received",
    tone: "blue",
  },
  {
    actor: "System",
    icon: Clock3,
    title: "Waits for the site supervisor",
    caption: "The delivery is addressed to the project's supervisor.",
    chip: "100 bags · Cement",
    badge: "Pending",
    tone: "amber",
  },
  {
    actor: "Supervisor",
    icon: CheckCircle2,
    title: "Confirms — or flags a problem",
    caption: '"Got it" marks it confirmed; a problem is flagged with a note.',
    chip: "100 bags · Cement",
    branch: true,
  },
  {
    actor: "Supervisor",
    icon: ArrowUpFromLine,
    title: "Logs daily usage",
    caption: "Records how much was used on site that day.",
    chip: "20 bags · Cement",
    badge: "Used today",
    tone: "violet",
  },
  {
    actor: "Owner",
    icon: Eye,
    title: "Sees the daily usage",
    caption: "Consumption shows up day-by-day in the Daily Report.",
    chip: "Daily usage",
    badge: "In report",
    tone: "green",
  },
];

function MaterialFlow() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [outcome, setOutcome] = useState("Confirmed"); // Confirmed | Issue
  const last = FLOW.length - 1;

  useEffect(() => {
    if (!playing) return undefined;
    if (step >= last) {
      setPlaying(false);
      return undefined;
    }
    const t = setTimeout(() => setStep((s) => s + 1), 1600);
    return () => clearTimeout(t);
  }, [playing, step, last]);

  const play = () => {
    if (step >= last) setStep(0);
    setPlaying(true);
  };

  const current = FLOW[step];
  // Step 3 (Supervisor responds) shows the chosen outcome.
  const isBranch = current.branch;
  const badge = isBranch ? outcome : current.badge;
  const tone = isBranch ? (outcome === "Confirmed" ? "green" : "red") : current.tone;
  const BadgeIcon = isBranch
    ? outcome === "Confirmed"
      ? CheckCircle2
      : AlertTriangle
    : current.icon;

  return (
    <div className="flow-demo">
      <div className="flow-track" role="list">
        {FLOW.map((s, i) => {
          const Icon = s.icon;
          const state = i === step ? "active" : i < step ? "done" : "";
          return (
            <button
              key={s.title}
              className={`flow-stage ${state}`}
              onClick={() => {
                setPlaying(false);
                setStep(i);
              }}
              role="listitem"
              aria-current={i === step}
            >
              <span className="flow-dot">
                <Icon size={17} />
              </span>
              <span className="flow-step-label">
                <b>Step {i + 1}</b>
                {s.actor}
              </span>
            </button>
          );
        })}
        <div className="flow-progress">
          <i style={{ width: `${(step / last) * 100}%` }} />
        </div>
      </div>

      <div className="flow-stage-card">
        <div className="flow-stage-copy">
          <span className="flow-actor">{current.actor}</span>
          <h3>{current.title}</h3>
          <p>{current.caption}</p>
          {isBranch && (
            <div className="flow-outcome" role="group" aria-label="Supervisor response">
              <button
                className={outcome === "Confirmed" ? "active" : ""}
                onClick={() => setOutcome("Confirmed")}
              >
                <CheckCircle2 size={15} /> Confirm
              </button>
              <button
                className={outcome === "Issue" ? "active" : ""}
                onClick={() => setOutcome("Issue")}
              >
                <AlertTriangle size={15} /> Flag issue
              </button>
            </div>
          )}
        </div>
        <div className="flow-stage-visual">
          <div key={`${step}-${outcome}`} className={`material-chip tone-${tone}`}>
            <span className="material-chip-icon">
              <BadgeIcon size={18} />
            </span>
            <div>
              <strong>{current.chip}</strong>
              <span className={`chip-badge tone-${tone}`}>
                {badge}
                {isBranch && outcome === "Issue" ? " · 5 bags short" : ""}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flow-controls">
        <button className="primary-button" onClick={play}>
          {step >= last ? <RotateCcw size={17} /> : <Play size={17} />}
          {step >= last ? "Replay" : playing ? "Playing…" : "Play the flow"}
        </button>
        <span className="flow-progress-label">
          Step {step + 1} of {FLOW.length}
        </span>
      </div>
    </div>
  );
}

export function GuidePage() {
  const { role } = useAuth();
  if (role !== "SUPER_ADMIN" && role !== "MANAGER") return <Navigate to="/" replace />;

  return (
    <div className="guide">
      <PageHeading
        eyebrow="HELP · HOW IT WORKS"
        title="How Progress Tracker works"
        text="From who's in charge, down to how a single bag of cement is tracked on site."
      />

      {/* Who's who */}
      <section className="guide-section">
        <div className="guide-head">
          <span className="guide-eyebrow">THE TEAM</span>
          <h2>Who's who</h2>
          <p>The chain of responsibility — each role is created by the one above it.</p>
        </div>
        <div className="role-tree">
          <RoleCard data={ROLES.superAdmin} />
          <div className="tree-link">
            <ChevronDown size={18} />
          </div>
          <RoleCard data={ROLES.manager} />
          <div className="tree-link">
            <ChevronDown size={18} />
            <span>Managers add both</span>
          </div>
          <div className="role-split">
            <div className="role-branch">
              <RoleCard data={ROLES.contractor} />
              <div className="branch-down">
                <ChevronDown size={15} />
              </div>
              <RoleCard data={ROLES.labour} compact />
            </div>
            <RoleCard data={ROLES.supervisor} />
          </div>
        </div>
      </section>

      {/* The work chain */}
      <section className="guide-section">
        <div className="guide-head">
          <span className="guide-eyebrow">THE WORK</span>
          <h2>What is a work order?</h2>
          <p>Work flows down one clean chain — the work order is the piece that actually gets tracked.</p>
        </div>
        <div className="chain">
          {CHAIN.map((c, i) => {
            const Icon = c.icon;
            return (
              <React.Fragment key={c.term}>
                <div className={`chain-node tone-${c.tone}`}>
                  <div className="chain-icon">
                    <Icon size={20} />
                  </div>
                  <strong>{c.term}</strong>
                  <p>{c.def}</p>
                </div>
                {i < CHAIN.length - 1 && (
                  <div className="chain-arrow">
                    <ChevronRight size={20} />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </section>

      {/* Materials & the supervisor */}
      <section className="guide-section">
        <div className="guide-head">
          <span className="guide-eyebrow">MATERIALS ON SITE</span>
          <h2>Materials &amp; the supervisor</h2>
          <p>How a delivery gets from the manager's ledger to the owner's daily report.</p>
        </div>
        <div className="assign-note">
          <div className="assign-icon">
            <ShieldCheck size={20} />
          </div>
          <div>
            <strong>A supervisor belongs to a site, not to a delivery.</strong>
            <p>
              You assign a supervisor on the project's detail page (<em>Site supervisor</em>). One
              site has one supervisor, but a supervisor can cover several sites. Every delivery
              recorded for that project is automatically theirs to confirm.
            </p>
          </div>
        </div>
        <MaterialFlow />
      </section>
    </div>
  );
}
