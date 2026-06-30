import { useState, useEffect, useRef } from "react";

const font = `@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');`;

// Update this once you have a sales page / checkout link for the system
const SYSTEM_URL = "https://ig.me/m/monty_online_";
const IG_HANDLE = "@monty_online_";

// Where captured emails get sent. Point this at your form endpoint
// (Zapier webhook, ConvertKit, Mailchimp, Beehiiv, Google Sheet via Sheety, etc.)
const EMAIL_ENDPOINT = "https://script.google.com/macros/s/AKfycbwlyAw26jjq07vMGwMhwGRA0YDs4tWxmDkPX4TRW1uCLeSY3HiFmBLOfCXoiSb4coacPQ/exec";

const questions = [
  {
    id: "sport",
    question: "What was your primary sport?",
    sub: "The one that shaped you most.",
    type: "grid",
    options: [
      { value: "team", label: "Team sport", icon: "🏀", desc: "Football, basketball, rugby, hockey...", score: 2 },
      { value: "individual", label: "Individual sport", icon: "🏊", desc: "Swimming, athletics, tennis, martial arts...", score: 3 },
      { value: "extreme", label: "Action / extreme sport", icon: "🪂", desc: "Kiteboarding, surfing, skateboarding...", score: 3 },
      { value: "endurance", label: "Endurance sport", icon: "🚴", desc: "Cycling, triathlon, rowing, cross-country...", score: 4 },
    ],
  },
  {
    id: "level",
    question: "What was your competitive level?",
    sub: "Be honest — this shapes how your audience sees you.",
    type: "grid",
    options: [
      { value: "recreational", label: "Recreational", icon: "🌱", desc: "Passionate amateur", score: 1 },
      { value: "club", label: "Club / regional", icon: "🥈", desc: "Competed seriously", score: 2 },
      { value: "national", label: "National level", icon: "🥇", desc: "Represented your region or country", score: 3 },
      { value: "international", label: "International", icon: "🏆", desc: "World cups, international competitions", score: 4 },
    ],
  },
  {
    id: "nutrition",
    question: "How important was nutrition & supplementation in your athletic career?",
    sub: "This is the foundation of your brand's credibility.",
    type: "list",
    options: [
      { value: "core", label: "Core to my performance", desc: "I tracked macros, used supplements daily, worked with nutritionists", score: 4 },
      { value: "important", label: "Important but informal", desc: "I knew what worked for my body through trial and error", score: 3 },
      { value: "basic", label: "Basic awareness", desc: "I ate reasonably well but didn't go deep on it", score: 2 },
      { value: "minimal", label: "Honestly, not a priority", desc: "I relied mostly on natural talent and training", score: 1 },
    ],
  },
  {
    id: "audience",
    question: "Do you already have an audience or following?",
    sub: "Social media, community, newsletter — anything counts.",
    type: "list",
    options: [
      { value: "none", label: "Starting from zero", desc: "No audience yet", score: 1 },
      { value: "small", label: "Small but engaged", desc: "Under 1,000 followers", score: 2 },
      { value: "medium", label: "Growing presence", desc: "1,000–10,000 followers", score: 3 },
      { value: "large", label: "Established audience", desc: "10,000+ followers", score: 4 },
    ],
  },
  {
    id: "time",
    question: "How many hours per week can you dedicate to building your brand?",
    sub: "Be realistic. Consistency beats intensity.",
    type: "list",
    options: [
      { value: "2-5", label: "2–5 hours", desc: "Side project while life is full", score: 1 },
      { value: "5-15", label: "5–15 hours", desc: "Serious side hustle mode", score: 2 },
      { value: "15-30", label: "15–30 hours", desc: "Semi full-time commitment", score: 3 },
      { value: "30+", label: "30+ hours", desc: "All in, ready to go", score: 4 },
    ],
  },
  {
    id: "goal",
    question: "What does financial freedom look like to you?",
    sub: "Your north star — what are you really building toward?",
    type: "list",
    options: [
      { value: "supplement", label: "Add €1–3k/month on the side", desc: "Extra income without quitting my life", score: 2 },
      { value: "replace", label: "Replace my current income", desc: "Match what I earn now, but on my own terms", score: 3 },
      { value: "scale", label: "Build a real brand", desc: "Revenue, product line, scale — the full thing", score: 4 },
      { value: "freedom", label: "Location & time freedom", desc: "Work from anywhere, no fixed schedule", score: 3 },
    ],
  },
  {
    id: "timeline",
    question: "When do you want your store live and selling?",
    sub: "Ambition is good. Realism is better.",
    type: "list",
    options: [
      { value: "30days", label: "Within 30 days", desc: "Fast — I want this launched now", score: 4 },
      { value: "90days", label: "Within 90 days", desc: "I can invest a quarter into building it right", score: 3 },
      { value: "6months", label: "Within 6 months", desc: "Building properly, step by step", score: 2 },
      { value: "exploring", label: "Just exploring for now", desc: "Want to understand the opportunity first", score: 1 },
    ],
  },
  {
    id: "risk",
    question: "How do you approach building something new?",
    sub: "Every athlete knows risk. This is just a different arena.",
    type: "grid",
    options: [
      { value: "calculated", label: "Calculated & strategic", icon: "⚖️", desc: "I want a proven system to follow", score: 4 },
      { value: "aggressive", label: "All in, fast execution", icon: "🔥", desc: "Give me the plan and I'll move", score: 4 },
      { value: "cautious", label: "Cautious, need proof first", icon: "🛡️", desc: "I want to see it works before committing", score: 2 },
      { value: "unsure", label: "Honestly still unsure", icon: "🤔", desc: "Need more clarity before deciding", score: 1 },
    ],
  },
];

const styles = `
${font}
* { box-sizing: border-box; margin: 0; padding: 0; }
body { background: #0a0a08; }
.scanner {
  font-family: 'DM Sans', sans-serif;
  background: #0d0d0b;
  min-height: 100vh;
  color: #f0ede6;
  position: relative;
  overflow: hidden;
}
.grain {
  position: fixed; inset: 0; pointer-events: none; z-index: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
  opacity: 0.4;
}
.accent-line {
  position: fixed; top: 0; left: 0; right: 0; height: 3px;
  background: linear-gradient(90deg, #c8a96e, #e8c97e, #c8a96e);
  z-index: 100;
}
.container { max-width: 680px; margin: 0 auto; padding: 0 24px; position: relative; z-index: 1; }

/* Intro */
.intro { min-height: 100vh; display: flex; flex-direction: column; justify-content: center; padding: 60px 0; }
.eyebrow { font-size: 11px; letter-spacing: 0.2em; color: #c8a96e; text-transform: uppercase; margin-bottom: 24px; }
.intro h1 { font-family: 'Bebas Neue', sans-serif; font-size: clamp(40px, 8vw, 72px); line-height: 0.98; color: #f0ede6; margin-bottom: 8px; }
.intro h1 span { color: #c8a96e; }
.intro-sub { font-size: 16px; color: #8a8578; line-height: 1.65; max-width: 520px; margin: 22px 0 28px; font-weight: 300; }
.no-hassle-row { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 32px; }
.no-hassle-chip { display: inline-flex; align-items: center; gap: 6px; background: #131310; border: 1px solid #252520; padding: 7px 12px; font-size: 12px; color: #c8c4b8; }
.no-hassle-chip .x { color: #7fae7a; }
.start-btn {
  display: inline-flex; align-items: center; gap: 12px;
  background: #c8a96e; color: #0d0d0b;
  font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500; letter-spacing: 0.05em;
  padding: 16px 32px; border: none; cursor: pointer;
  text-transform: uppercase;
  transition: all 0.2s; clip-path: polygon(0 0, calc(100% - 12px) 0, 100% 100%, 12px 100%);
}
.start-btn:hover { background: #e8c97e; transform: translateY(-1px); }
.stats-row { display: flex; gap: 32px; margin-top: 48px; padding-top: 28px; border-top: 1px solid #1e1e1a; }
.stat-item .num { font-family: 'Bebas Neue', sans-serif; font-size: 30px; color: #c8a96e; }
.stat-item .lbl { font-size: 11px; color: #5a5850; letter-spacing: 0.05em; }
.product-pill {
  display: inline-flex; align-items: center; gap: 8px; margin-bottom: 20px;
  background: #131310; border: 1px solid #252520; padding: 8px 14px;
  font-size: 12px; color: #c8a96e; letter-spacing: 0.05em;
}
.proof-line { display: flex; align-items: center; gap: 10px; margin-top: 28px; font-size: 12px; color: #5a5850; }
.proof-line .amt { font-family: 'Bebas Neue', sans-serif; font-size: 18px; color: #c8a96e; letter-spacing: 0.02em; }

/* Quiz */
.quiz { min-height: 100vh; padding: 40px 0 80px; }
.progress-bar { height: 2px; background: #1e1e1a; margin-bottom: 48px; position: relative; overflow: hidden; }
.progress-fill { height: 100%; background: linear-gradient(90deg, #c8a96e, #e8c97e); transition: width 0.4s ease; }
.q-counter { font-size: 11px; color: #5a5850; letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 8px; }
.q-text { font-family: 'Bebas Neue', sans-serif; font-size: clamp(28px, 6vw, 46px); line-height: 1.1; color: #f0ede6; margin-bottom: 8px; }
.q-sub { font-size: 14px; color: #5a5850; font-weight: 300; margin-bottom: 36px; font-style: italic; }

.grid-opts { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.list-opts { display: flex; flex-direction: column; gap: 8px; }

.opt-card {
  background: #131310; border: 1px solid #252520;
  cursor: pointer; transition: all 0.15s;
  text-align: left; color: #f0ede6;
}
.grid-opts .opt-card { padding: 18px 16px; }
.list-opts .opt-card { padding: 16px 20px; display: flex; align-items: center; justify-content: space-between; }
.opt-card:hover { border-color: #c8a96e; background: #171714; }
.opt-card.selected { border-color: #c8a96e; background: #1c1a12; }
.opt-icon { font-size: 22px; margin-bottom: 10px; }
.opt-label { font-size: 14px; font-weight: 500; color: #f0ede6; margin-bottom: 4px; }
.opt-desc { font-size: 12px; color: #5a5850; line-height: 1.4; }
.list-opts .opt-label { margin-bottom: 2px; }
.check-circle {
  width: 20px; height: 20px; border-radius: 50%; border: 1px solid #2e2e28; flex-shrink: 0;
  background: transparent; transition: all 0.15s; display: flex; align-items: center; justify-content: center;
}
.opt-card.selected .check-circle { background: #c8a96e; border-color: #c8a96e; }
.check-circle::after { content: '✓'; font-size: 11px; color: #0d0d0b; opacity: 0; }
.opt-card.selected .check-circle::after { opacity: 1; }

.next-btn {
  margin-top: 32px;
  background: #c8a96e; color: #0d0d0b;
  font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500; letter-spacing: 0.08em;
  padding: 14px 28px; border: none; cursor: pointer; text-transform: uppercase;
  clip-path: polygon(0 0, calc(100% - 10px) 0, 100% 100%, 10px 100%);
  transition: all 0.2s; opacity: 0; pointer-events: none;
}
.next-btn.visible { opacity: 1; pointer-events: all; }
.next-btn:hover { background: #e8c97e; }

/* Loading */
.loading { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 20px; }
.loader-ring { width: 56px; height: 56px; border: 2px solid #1e1e1a; border-top-color: #c8a96e; border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.loading-text { font-size: 13px; color: #5a5850; letter-spacing: 0.1em; text-transform: uppercase; }
.loading-msgs { font-family: 'Bebas Neue', sans-serif; font-size: 28px; color: #f0ede6; text-align: center; min-height: 40px; }

/* Email gate */
.email-gate { min-height: 100vh; display: flex; flex-direction: column; justify-content: center; padding: 60px 0; animation: fadeUp 0.5s ease; }
.gate-icon { font-size: 36px; margin-bottom: 20px; }
.gate-title { font-family: 'Bebas Neue', sans-serif; font-size: clamp(32px, 6.5vw, 50px); line-height: 1.05; color: #f0ede6; margin-bottom: 14px; }
.gate-title span { color: #c8a96e; }
.gate-sub { font-size: 15px; color: #8a8578; line-height: 1.6; max-width: 460px; margin-bottom: 32px; font-weight: 300; }
.gate-score-preview { display: inline-flex; align-items: baseline; gap: 8px; background: #131310; border: 1px solid #252520; padding: 14px 20px; margin-bottom: 32px; }
.gate-score-preview .blur-num { font-family: 'Bebas Neue', sans-serif; font-size: 36px; color: #c8a96e; filter: blur(7px); user-select: none; }
.gate-score-preview .lbl { font-size: 12px; color: #5a5850; letter-spacing: 0.05em; }
.email-form { display: flex; flex-direction: column; gap: 12px; max-width: 420px; }
.email-input {
  background: #131310; border: 1px solid #252520; color: #f0ede6;
  font-family: 'DM Sans', sans-serif; font-size: 15px; padding: 16px 18px;
  outline: none; transition: border-color 0.15s;
}
.email-input:focus { border-color: #c8a96e; }
.email-input::placeholder { color: #5a5850; }
.gate-submit {
  background: #c8a96e; color: #0d0d0b;
  font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500; letter-spacing: 0.05em;
  padding: 16px 28px; border: none; cursor: pointer; text-transform: uppercase;
  clip-path: polygon(0 0, calc(100% - 12px) 0, 100% 100%, 12px 100%);
  transition: all 0.2s;
}
.gate-submit:hover { background: #e8c97e; }
.gate-submit:disabled { opacity: 0.6; cursor: wait; }
.gate-privacy { font-size: 11px; color: #4a4940; margin-top: 4px; }
.gate-error { font-size: 12px; color: #c8896e; margin-top: -4px; }

/* Result */
.result { padding: 48px 0 80px; animation: fadeUp 0.6s ease; }
@keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
.match-badge {
  display: inline-flex; align-items: center; gap: 8px; margin-bottom: 20px;
  background: #1c1a12; border: 1px solid #c8a96e55; padding: 8px 16px;
  font-size: 12px; color: #c8a96e; letter-spacing: 0.08em; text-transform: uppercase; font-weight: 500;
}
.result-eyebrow { font-size: 11px; color: #c8a96e; letter-spacing: 0.2em; text-transform: uppercase; margin-bottom: 16px; }
.result-headline { font-family: 'Bebas Neue', sans-serif; font-size: clamp(32px, 6.5vw, 54px); line-height: 1.05; color: #f0ede6; margin-bottom: 24px; }
.result-headline span { color: #c8a96e; }
.score-meter { margin-bottom: 32px; }
.score-track { height: 8px; background: #1e1e1a; position: relative; overflow: hidden; margin-bottom: 8px; }
.score-fill { height: 100%; background: linear-gradient(90deg, #c8a96e, #e8c97e); transition: width 1s cubic-bezier(0.16, 1, 0.3, 1); }
.score-label { display: flex; justify-content: space-between; font-size: 11px; color: #5a5850; letter-spacing: 0.05em; text-transform: uppercase; }
.score-label .pct { color: #c8a96e; font-weight: 500; }
.result-body { font-size: 15px; color: #c8c4b8; line-height: 1.8; font-weight: 300; white-space: pre-wrap; }
.result-body strong { color: #f0ede6; font-weight: 500; }
.section-divider { height: 1px; background: #1e1e1a; margin: 36px 0; }
.why-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 24px 0; }
.why-card { background: #131310; border: 1px solid #252520; padding: 16px; }
.why-icon { font-size: 18px; margin-bottom: 8px; }
.why-title { font-size: 13px; font-weight: 500; color: #f0ede6; margin-bottom: 4px; }
.why-text { font-size: 12px; color: #5a5850; line-height: 1.5; }

/* Founder proof block */
.founder-block { display: flex; gap: 16px; align-items: flex-start; background: #131310; border: 1px solid #252520; padding: 20px; margin: 32px 0; }
.founder-avatar { width: 44px; height: 44px; border-radius: 50%; background: linear-gradient(140deg, #c8a96e, #8a6f3e); flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-family: 'Bebas Neue', sans-serif; font-size: 16px; color: #0d0d0b; }
.founder-text { font-size: 13px; color: #b5b0a3; line-height: 1.65; font-weight: 300; }
.founder-text b { color: #c8a96e; font-weight: 500; }

.cta-box { background: linear-gradient(155deg, #1c1a12, #131310); border: 1px solid #c8a96e55; padding: 32px 28px; margin-top: 36px; position: relative; overflow: hidden; }
.cta-box::before { content: ''; position: absolute; top: -50%; right: -20%; width: 200px; height: 200px; background: radial-gradient(circle, #c8a96e22, transparent 70%); }
.cta-kicker { font-size: 11px; color: #c8a96e; letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 10px; position: relative; }
.cta-box h3 { font-family: 'Bebas Neue', sans-serif; font-size: 30px; color: #f0ede6; margin-bottom: 10px; line-height: 1.08; position: relative; }
.cta-box p { font-size: 14px; color: #b5b0a3; line-height: 1.7; margin-bottom: 22px; font-weight: 300; position: relative; }
.cta-features { display: flex; flex-direction: column; gap: 9px; margin-bottom: 24px; position: relative; }
.cta-feature { display: flex; align-items: flex-start; gap: 8px; font-size: 13px; color: #c8c4b8; }
.cta-feature .dot { color: #c8a96e; flex-shrink: 0; margin-top: 2px; }
.cta-btn {
  display: inline-flex; align-items: center; gap: 10px;
  background: #c8a96e; color: #0d0d0b;
  font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500; letter-spacing: 0.08em;
  padding: 16px 32px; border: none; cursor: pointer; text-transform: uppercase;
  clip-path: polygon(0 0, calc(100% - 12px) 0, 100% 100%, 12px 100%);
  transition: all 0.2s; position: relative;
}
.cta-btn:hover { background: #e8c97e; transform: translateY(-1px); }
.handle-tag { font-size: 12px; color: #5a5850; margin-top: 16px; position: relative; }
.handle-tag b { color: #c8a96e; }
.restart-btn { background: transparent; border: 1px solid #252520; color: #5a5850; font-family: 'DM Sans', sans-serif; font-size: 12px; padding: 10px 20px; cursor: pointer; letter-spacing: 0.08em; text-transform: uppercase; transition: all 0.2s; margin-top: 16px; display: block; }
.restart-btn:hover { border-color: #5a5850; color: #8a8578; }
.error-msg { font-size: 14px; color: #c8a96e; margin-top: 16px; }
@media (max-width: 520px) { .grid-opts { grid-template-columns: 1fr; } .why-grid { grid-template-columns: 1fr; } .founder-block { flex-direction: column; } }
`;

const loadingMessages = [
  "Analyzing your athletic profile...",
  "Calculating your brand-fit score...",
  "Building your launch readiness report...",
  "Almost ready...",
];

function parseResult(text) {
  const headlineMatch = text.match(/HEADLINE:\s*(.+)/);
  const bodyMatch = text.match(/BODY:\s*([\s\S]+?)(?=STRENGTHS:|$)/);
  const strengthsMatch = text.match(/STRENGTHS:\s*([\s\S]+?)(?=CTA:|$)/);
  const ctaMatch = text.match(/CTA:\s*([\s\S]+)/);

  let strengths = [];
  if (strengthsMatch) {
    const raw = strengthsMatch[1].trim().split(/\n(?=\d\.)/).slice(0, 4);
    strengths = raw.map(p => {
      const m = p.match(/\d\.\s*(.+?)\s*[-–]\s*(.+)/s);
      if (m) return { name: m[1].trim(), why: m[2].trim() };
      return { name: p.replace(/^\d\.\s*/, '').trim(), why: '' };
    }).filter(p => p.name);
  }

  return {
    headline: headlineMatch ? headlineMatch[1].trim() : "You're Ready To Launch.",
    body: bodyMatch ? bodyMatch[1].trim() : text,
    strengths,
    cta: ctaMatch ? ctaMatch[1].trim() : "Your next step is the system that takes you from idea to launched store.",
  };
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function AthleteIncomeScanner() {
  const [screen, setScreen] = useState("intro");
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loadMsg, setLoadMsg] = useState(0);
  const [parsed, setParsed] = useState(null);
  const [error, setError] = useState(null);
  const [matchPct, setMatchPct] = useState(0);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [submittingEmail, setSubmittingEmail] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (screen === "loading") {
      let i = 0;
      timerRef.current = setInterval(() => {
        i++;
        if (i < loadingMessages.length) setLoadMsg(i);
      }, 1400);
      return () => clearInterval(timerRef.current);
    }
  }, [screen]);

  useEffect(() => {
    if (screen === "result" && parsed) {
      const t = setTimeout(() => setMatchPct(computeScore()), 200);
      return () => clearTimeout(t);
    }
  }, [screen, parsed]);

  const q = questions[current];
  const selected = answers[q?.id];

  function selectOption(val) {
    setAnswers(prev => ({ ...prev, [q.id]: val }));
  }

  function next() {
    if (current < questions.length - 1) {
      setCurrent(c => c + 1);
    } else {
      setScreen("email");
    }
  }

  function computeScore() {
    let total = 0;
    let max = 0;
    questions.forEach(q => {
      const opt = q.options.find(o => o.value === answers[q.id]);
      max += 4;
      total += opt?.score || 0;
    });
    return Math.round((total / max) * 100);
  }

  async function handleEmailSubmit(e) {
    e.preventDefault();
    if (!isValidEmail(email)) {
      setEmailError("Enter a valid email address.");
      return;
    }
    setEmailError("");
    setSubmittingEmail(true);

    // Fire-and-forget lead capture — does not block the quiz result if it fails.
    // no-cors is required because Google Apps Script web apps don't return CORS headers;
    // the request still delivers successfully, we just can't read the response back.
    if (EMAIL_ENDPOINT) {
      try {
        await fetch(EMAIL_ENDPOINT, {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "text/plain" },
          body: JSON.stringify({ email, answers, source: "athlete-income-scanner" }),
        });
      } catch (err) {
        // Silently continue — don't block the user's result over a webhook failure
      }
    }

    setSubmittingEmail(false);
    submitQuiz();
  }

  async function submitQuiz() {
    setScreen("loading");
    setLoadMsg(0);

    const score = computeScore();
    const tier = score >= 75 ? "high" : score >= 50 ? "medium" : "early";

    const summary = questions.map(q => {
      const opt = q.options.find(o => o.value === answers[q.id]);
      return `${q.question}: ${opt?.label || answers[q.id]} (${opt?.desc || ''})`;
    }).join('\n');

    const prompt = `You are the "Athlete Income Scanner" — a free tool built by an athlete-turned-entrepreneur who competed internationally in kiteboarding and wakeboarding, then spent years mastering Meta advertising, personally managing over 30 million dollars in ad spend while helping scale online businesses. He built this tool because he wants to help fellow athletes find their own bridge to financial freedom after sport.

This scanner exists for ONE purpose: to qualify athletes for a specific paid system that teaches them how to build their own white-label supplement e-commerce brand with NO inventory, NO stocking, and NO shipping hassle (using white-label fulfillment), combined with a Meta ads engine to drive sales, for a minimal initial investment. The system is the only outcome of this quiz — every result should lead the user toward it.

A user has just completed the quiz. Here are their answers:

${summary}

Their calculated fit score is ${score}/100 (tier: ${tier} — high means 75+, medium means 50-74, early means under 50).

Generate a personalized "Brand Readiness Report" result. Follow this EXACT format — use these labels on their own lines:

HEADLINE: [A punchy 4-8 word headline that reflects their readiness tier. If high tier, make it urgent and confident like "You're Built To Launch This." If medium tier, make it motivating like "You Have The Foundation — Now Build It." If early tier, make it encouraging like "Your Athlete Edge Is Still Your Advantage." No quotes.]

BODY: [3 paragraphs, written in second person ("you"), direct and confident, like a mentor who has actually done it. First paragraph: acknowledge their specific athletic background (sport, level) and connect it to credibility in the supplement/wellness space — athletes have authentic authority here that generic dropshippers don't. Second paragraph: speak directly to their fit score tier — if high, tell them they have everything needed and the only thing missing is the system to execute; if medium, tell them their foundation is solid but they need the structured system to avoid costly mistakes; if early, tell them it's not about where they are now but about getting the proven system so they don't waste time guessing. Third paragraph: paint a specific picture of what's possible — building a no-inventory, no-shipping-hassle supplement brand under their own name with minimal starting investment, backed by real Meta ads expertise, turning their athletic credibility into a real product line and a true bridge to financial freedom. Do NOT mention any other business model (no coaching, no dropshipping of physical goods, no content creation as an alternative) — this specific supplement brand path is the only thing discussed. Do NOT use the word "course" anywhere.]

STRENGTHS: [List exactly 4 specific strengths from their profile that make them suited for this specifically, in this format:
1. [Strength Name] - [One sentence connecting their specific quiz answer to why it matters]
2. [Strength Name] - [One sentence connecting their specific quiz answer to why it matters]
3. [Strength Name] - [One sentence connecting their specific quiz answer to why it matters]
4. [Strength Name] - [One sentence connecting their specific quiz answer to why it matters]]

CTA: [Two sentences. First sentence: a direct, confident statement about the system being the exact step-by-step process to take them from here to a launched, selling store with no inventory headaches. Second sentence: must end with "Follow ${IG_HANDLE} on Instagram to get access." Keep it motivating and specific, not generic. Do NOT use the word "course."]`;

    try {
      const res = await fetch("/.netlify/functions/generate-result", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 400 || res.status === 403) {
          throw new Error("BILLING");
        }
        throw new Error(data.error || "Request failed");
      }
      setParsed(parseResult(data.text));
      clearInterval(timerRef.current);
      setScreen("result");
    } catch (e) {
      if (e.message === "BILLING") {
        setError("Our results engine is being refreshed right now — check back shortly, or reach out to @monty_online_ directly in the meantime.");
      } else {
        setError("Something went wrong. Please try again.");
      }
      setScreen("result");
    }
  }

  function restart() {
    setScreen("intro");
    setCurrent(0);
    setAnswers({});
    setParsed(null);
    setError(null);
    setMatchPct(0);
    setEmail("");
    setEmailError("");
  }

  return (
    <>
      <style>{styles}</style>
      <div className="scanner">
        <div className="grain" />
        <div className="accent-line" />
        <div className="container">

          {screen === "intro" && (
            <div className="intro">
              <div className="product-pill">💊 No Inventory · No Shipping · Low Start-Up Cost</div>
              <p className="eyebrow">Athlete Income Scanner™</p>
              <h1>YOUR NEXT<br /><span>ARENA</span><br />IS ONLINE.</h1>
              <p className="intro-sub">
                Find out if you're ready to turn your athletic credibility into your own supplement brand — no inventory, no stocking, no shipping hassle, minimal starting investment. 8 questions. 2 minutes. Get your personalized readiness score.
              </p>
              <div className="no-hassle-row">
                <span className="no-hassle-chip"><span className="x">✓</span> No inventory</span>
                <span className="no-hassle-chip"><span className="x">✓</span> No stocking</span>
                <span className="no-hassle-chip"><span className="x">✓</span> No shipping</span>
                <span className="no-hassle-chip"><span className="x">✓</span> No big budget needed</span>
              </div>
              <button className="start-btn" onClick={() => setScreen("quiz")}>
                Start the scan →
              </button>
              <div className="stats-row">
                <div className="stat-item">
                  <div className="num">8</div>
                  <div className="lbl">Questions</div>
                </div>
                <div className="stat-item">
                  <div className="num">2 min</div>
                  <div className="lbl">To complete</div>
                </div>
                <div className="stat-item">
                  <div className="num">AI</div>
                  <div className="lbl">Readiness score</div>
                </div>
              </div>
              <div className="proof-line">
                Built by an athlete who personally managed <span className="amt">$30M+</span> in Meta ad spend
              </div>
            </div>
          )}

          {screen === "quiz" && (
            <div className="quiz">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${((current + 1) / questions.length) * 100}%` }} />
              </div>
              <p className="q-counter">{current + 1} / {questions.length}</p>
              <h2 className="q-text">{q.question}</h2>
              <p className="q-sub">{q.sub}</p>

              {q.type === "grid" && (
                <div className="grid-opts">
                  {q.options.map(opt => (
                    <button
                      key={opt.value}
                      className={`opt-card${selected === opt.value ? " selected" : ""}`}
                      onClick={() => selectOption(opt.value)}
                    >
                      <div className="opt-icon">{opt.icon}</div>
                      <div className="opt-label">{opt.label}</div>
                      <div className="opt-desc">{opt.desc}</div>
                    </button>
                  ))}
                </div>
              )}

              {q.type === "list" && (
                <div className="list-opts">
                  {q.options.map(opt => (
                    <button
                      key={opt.value}
                      className={`opt-card${selected === opt.value ? " selected" : ""}`}
                      onClick={() => selectOption(opt.value)}
                    >
                      <div>
                        <div className="opt-label">{opt.label}</div>
                        <div className="opt-desc">{opt.desc}</div>
                      </div>
                      <div className="check-circle" />
                    </button>
                  ))}
                </div>
              )}

              <button className={`next-btn${selected ? " visible" : ""}`} onClick={next}>
                {current < questions.length - 1 ? "Next →" : "Unlock my readiness score →"}
              </button>
            </div>
          )}

          {screen === "email" && (
            <div className="email-gate">
              <div className="gate-icon">🔓</div>
              <h2 className="gate-title">Your score is <span>ready.</span></h2>
              <p className="gate-sub">
                Enter your email to unlock your personalized Brand Readiness Score and full report — including your top strengths and your exact next step.
              </p>
              <div className="gate-score-preview">
                <span className="blur-num">87</span>
                <span className="lbl">/ 100<br/>readiness score</span>
              </div>
              <form className="email-form" onSubmit={handleEmailSubmit}>
                <input
                  type="email"
                  className="email-input"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setEmailError(""); }}
                  autoFocus
                />
                {emailError && <p className="gate-error">{emailError}</p>}
                <button type="submit" className="gate-submit" disabled={submittingEmail}>
                  {submittingEmail ? "Unlocking..." : "Unlock my results →"}
                </button>
                <p className="gate-privacy">No spam. Unsubscribe anytime. Your results are generated instantly.</p>
              </form>
            </div>
          )}

          {screen === "loading" && (
            <div className="loading">
              <div className="loader-ring" />
              <p className="loading-msgs">{loadingMessages[loadMsg]}</p>
              <p className="loading-text">Powered by AI · Your results are unique</p>
            </div>
          )}

          {screen === "result" && error && (
            <div className="result">
              <div className="match-badge">⚠️ One moment</div>
              <h2 className="result-headline">Your results are <span>almost ready.</span></h2>
              <p className="error-msg">{error}</p>
              <div className="founder-block" style={{ marginTop: 28 }}>
                <div className="founder-avatar">M</div>
                <p className="founder-text">
                  <b>In the meantime, follow along on Instagram</b> — I post the exact system for building a no-inventory supplement brand, backed by $30M+ in Meta ad spend experience.
                </p>
              </div>
              <button className="cta-btn" style={{ marginTop: 8 }} onClick={() => window.open(SYSTEM_URL, "_blank")}>
                Message Me On Instagram →
              </button>
              <button className="restart-btn" onClick={restart}>↺ Try the scan again</button>
            </div>
          )}

          {screen === "result" && parsed && (
            <div className="result">
              <div className="match-badge">🎯 Brand Readiness Report</div>
              <h2 className="result-headline">
                {parsed.headline.includes(" ") ? (
                  <>
                    {parsed.headline.split(" ").slice(0, -2).join(" ")}{" "}
                    <span>{parsed.headline.split(" ").slice(-2).join(" ")}</span>
                  </>
                ) : <span>{parsed.headline}</span>}
              </h2>

              <div className="score-meter">
                <div className="score-track">
                  <div className="score-fill" style={{ width: `${matchPct}%` }} />
                </div>
                <div className="score-label">
                  <span>Brand readiness score</span>
                  <span className="pct">{matchPct}/100</span>
                </div>
              </div>

              <div className="result-body" dangerouslySetInnerHTML={{
                __html: parsed.body
                  .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                  .replace(/\n\n/g, '<br/><br/>')
              }} />

              {parsed.strengths.length > 0 && (
                <>
                  <div className="section-divider" />
                  <p style={{ fontSize: 11, color: "#5a5850", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 16 }}>Why you're suited for this</p>
                  <div className="why-grid">
                    {parsed.strengths.map((s, i) => (
                      <div className="why-card" key={i}>
                        <div className="why-icon">✓</div>
                        <div className="why-title">{s.name}</div>
                        <div className="why-text">{s.why}</div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              <div className="founder-block">
                <div className="founder-avatar">M</div>
                <p className="founder-text">
                  <b>I've spent years managing over $30M in Meta ad spend</b> — and I retired from competing internationally to do it. Now I want to help fellow athletes find their own bridge from sport to financial freedom, the same way I did. This system is everything I wish someone had handed me.
                </p>
              </div>

              <div className="cta-box">
                <p className="cta-kicker">Your Next Step</p>
                <h3>THE NO-INVENTORY<br/>SUPPLEMENT BRAND SYSTEM</h3>
                <p>{parsed.cta}</p>
                <div className="cta-features">
                  <div className="cta-feature"><span className="dot">●</span> Full online store setup, step by step</div>
                  <div className="cta-feature"><span className="dot">●</span> Offer & product criteria, pricing strategy</div>
                  <div className="cta-feature"><span className="dot">●</span> The Meta ads engine that drives your sales</div>
                  <div className="cta-feature"><span className="dot">●</span> Creative angles, hooks & execution</div>
                  <div className="cta-feature"><span className="dot">●</span> Step-by-step launch checklist</div>
                </div>
                <button className="cta-btn" onClick={() => window.open(SYSTEM_URL, "_blank")}>
                  Message Me On Instagram →
                </button>
                <p className="handle-tag">Built by <b>{IG_HANDLE}</b> — follow for behind-the-scenes & updates</p>
              </div>

              <button className="restart-btn" onClick={restart}>↺ Retake the scan</button>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
