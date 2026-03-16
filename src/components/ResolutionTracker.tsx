import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

const WEEKENDS = [
  { id: "d0",  num: "DAY 0", title: "Day Zero Setup",            deliverable: "Folders · Accounts · Rubric saved",        section: "FOUNDATION",     color: "#3b82f6" },
  { id: "w1",  num: "WK 01", title: "Vibe Code Kickoff",         deliverable: "Resolution tracker built & live",           section: null,             color: "#3b82f6" },
  { id: "w2",  num: "WK 02", title: "Model Topography",          deliverable: "Topography Sheet + Rules of Thumb",         section: null,             color: "#3b82f6" },
  { id: "w3",  num: "WK 03", title: "Deep Research Brief",       deliverable: "2-page brief, clear recommendation",        section: "CORE PROJECTS",  color: "#8b5cf6" },
  { id: "w4",  num: "WK 04", title: "Data Analysis Memo",        deliverable: "Cleaned data · 3 insights · 3 actions",     section: null,             color: "#8b5cf6" },
  { id: "w5",  num: "WK 05", title: "Visual Explainer",          deliverable: "One infographic you'd actually share",      section: null,             color: "#8b5cf6" },
  { id: "w6",  num: "WK 06", title: "Information Pipeline",      deliverable: "Summary + FAQ + Deck from one source",      section: null,             color: "#8b5cf6" },
  { id: "w7",  num: "WK 07", title: "First Automation",          deliverable: "Content workflow running end-to-end",       section: "AUTOMATION",     color: "#f59e0b" },
  { id: "w8",  num: "WK 08", title: "Second Automation",         deliverable: "Productivity workflow running",             section: null,             color: "#f59e0b" },
  { id: "w9",  num: "WK 09", title: "Personal Context OS",       deliverable: "Context Docs + Capture system live",        section: "SYSTEM & BUILD", color: "#06b6d4" },
  { id: "w10", num: "WK 10", title: "AI-Powered Build",          deliverable: "Chatbot or Agent deployed",                 section: null,             color: "#06b6d4" },
  { id: "bns", num: "BONUS", title: "Agent Evaluation Gauntlet", deliverable: "Scorecard + Best use cases identified",     section: "BONUS",          color: "#ec4899" },
];

const SECTION_COLORS: Record<string, string> = {
  "FOUNDATION":    "#3b82f6",
  "CORE PROJECTS": "#8b5cf6",
  "AUTOMATION":    "#f59e0b",
  "SYSTEM & BUILD":"#06b6d4",
  "BONUS":         "#ec4899",
};

interface ItemState {
  done: boolean;
  quality: number;
  time_saved: number;
  notes: string;
  date: string;
  hours_spent: number;
}

type TrackerState = Record<string, ItemState>;

function defaultItem(): ItemState {
  return { done: false, quality: 0, time_saved: 0, notes: "", date: "", hours_spent: 0 };
}

// ── Stars component ──────────────────────────────────────────────────────────
function Stars({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-[3px]">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          onClick={() => onChange(n)}
          className="w-5 h-5 rounded-[4px] border transition-colors duration-100"
          style={{
            background: value >= n ? "#f59e0b" : "hsl(224 24% 14%)",
            borderColor: value >= n ? "#f59e0b" : "hsl(217 36% 26%)",
          }}
          aria-label={`Rate ${n}`}
        />
      ))}
    </div>
  );
}

// ── Resolution Card ──────────────────────────────────────────────────────────
function ResolutionCard({
  w,
  item,
  onToggle,
  onScore,
  onNotes,
}: {
  w: (typeof WEEKENDS)[0];
  item: ItemState;
  onToggle: () => void;
  onScore: (field: "quality" | "time_saved", val: number) => void;
  onNotes: (val: string) => void;
}) {
  const [notesOpen, setNotesOpen] = useState(false);

  const notesLabel = item.notes
    ? `notes saved · ${notesOpen ? "hide notes" : "show notes"}`
    : `+ add notes`;

  return (
    <div
      className="relative flex items-start gap-[14px] rounded-[12px] border px-4 py-3 pl-5 mb-2 cursor-pointer transition-colors duration-150"
      style={{
        background: item.done ? "hsl(142 30% 9%)" : "hsl(222 19% 10%)",
        borderColor: item.done ? "hsl(152 33% 15%)" : "hsl(217 26% 20%)",
      }}
      onMouseEnter={(e) => {
        if (!item.done) {
          (e.currentTarget as HTMLDivElement).style.borderColor = "hsl(217 36% 26%)";
          (e.currentTarget as HTMLDivElement).style.background = "#161c26";
        }
      }}
      onMouseLeave={(e) => {
        if (!item.done) {
          (e.currentTarget as HTMLDivElement).style.borderColor = "hsl(217 26% 20%)";
          (e.currentTarget as HTMLDivElement).style.background = "hsl(222 19% 10%)";
        }
      }}
    >
      {/* accent bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-[12px]"
        style={{ background: w.color }}
      />

      {/* checkbox */}
      <button
        onClick={(e) => { e.stopPropagation(); onToggle(); }}
        className="w-6 h-6 rounded-full border flex items-center justify-center flex-shrink-0 mt-[1px] transition-all duration-200 text-[13px] select-none"
        style={{
          background: item.done ? "#22c55e" : "transparent",
          borderColor: item.done ? "#22c55e" : "hsl(217 36% 26%)",
          color: item.done ? "#fff" : "transparent",
        }}
        aria-label={item.done ? "Mark incomplete" : "Mark complete"}
      >
        {item.done ? "✓" : ""}
      </button>

      {/* body */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 mb-[3px]">
          <span
            className="font-mono text-[10px] flex-shrink-0"
            style={{ color: "hsl(215 16% 37%)" }}
          >
            {w.num}
          </span>
          <span
            className="text-[14px] font-medium leading-[1.3]"
            style={{ color: item.done ? "#86efac" : "#cbd5e1" }}
          >
            {w.title}
          </span>
        </div>

        <div
          className="text-[12px] leading-[1.5] mb-1"
          style={{ color: item.done ? "rgba(74,222,128,0.7)" : "hsl(215 16% 37%)" }}
        >
          {w.deliverable}
        </div>

        {item.done && item.date && (
          <div className="font-mono text-[11px] mb-2" style={{ color: "#22c55e" }}>
            {item.date}
          </div>
        )}

        {item.done && (
          <div className="flex gap-4 flex-wrap mb-[6px] mt-2">
            <div>
              <label
                className="block text-[10px] uppercase tracking-[0.8px] mb-1"
                style={{ color: "hsl(215 16% 37%)" }}
              >
                Outcome quality
              </label>
              <Stars value={item.quality} onChange={(v) => onScore("quality", v)} />
            </div>
            <div>
              <label
                className="block text-[10px] uppercase tracking-[0.8px] mb-1"
                style={{ color: "hsl(215 16% 37%)" }}
              >
                Time saved
              </label>
              <Stars value={item.time_saved} onChange={(v) => onScore("time_saved", v)} />
            </div>
          </div>
        )}

        <button
          className="text-[11px] bg-transparent border-none p-0 cursor-pointer transition-colors duration-150 mt-[2px]"
          style={{ fontFamily: "'DM Sans', sans-serif", color: "hsl(215 20% 27%)" }}
          onMouseEnter={(e) => ((e.target as HTMLButtonElement).style.color = "hsl(215 16% 37%)")}
          onMouseLeave={(e) => ((e.target as HTMLButtonElement).style.color = "hsl(215 20% 27%)")}
          onClick={(e) => { e.stopPropagation(); setNotesOpen((o) => !o); }}
        >
          {notesLabel}
        </button>

        {notesOpen && (
          <div className="mt-2">
            <textarea
              className="w-full rounded-[8px] border text-[12px] p-[9px_11px] resize-none outline-none leading-[1.5] transition-colors duration-150 h-[72px]"
              style={{
                background: "hsl(222 21% 7%)",
                borderColor: "hsl(217 26% 20%)",
                color: "hsl(215 20% 65%)",
                fontFamily: "'DM Sans', sans-serif",
              }}
              placeholder="Best prompt, what worked, what didn't, tools used…"
              value={item.notes}
              onChange={(e) => onNotes(e.target.value)}
              onFocus={(e) => ((e.target as HTMLTextAreaElement).style.borderColor = "hsl(217 36% 26%)")}
              onBlur={(e) => ((e.target as HTMLTextAreaElement).style.borderColor = "hsl(217 26% 20%)")}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ResolutionTracker({ user }: { user: User }) {
  const [state, setState] = useState<TrackerState>({});
  const [loading, setLoading] = useState(true);
  const saveTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  // Load all rows for this user on mount
  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from("weekend_progress")
        .select("*")
        .eq("user_id", user.id);

      if (!error && data) {
        const loaded: TrackerState = {};
        data.forEach((row) => {
          loaded[row.weekend_id] = {
            done: row.done,
            quality: row.quality,
            time_saved: row.time_saved,
            notes: row.notes,
            date: row.date_completed,
            hours_spent: Number(row.hours_spent),
          };
        });
        setState(loaded);
      }
      setLoading(false);
    };
    load();
  }, [user.id]);

  // Debounced upsert to Supabase
  const saveRow = useCallback(
    (id: string, item: ItemState) => {
      if (saveTimers.current[id]) clearTimeout(saveTimers.current[id]);
      saveTimers.current[id] = setTimeout(async () => {
        await supabase.from("weekend_progress").upsert(
          {
            user_id: user.id,
            weekend_id: id,
            done: item.done,
            quality: item.quality,
            time_saved: item.time_saved,
            notes: item.notes,
            date_completed: item.date,
            hours_spent: item.hours_spent,
          },
          { onConflict: "user_id,weekend_id" }
        );
      }, 400);
    },
    [user.id]
  );

  const getItem = useCallback(
    (id: string): ItemState => state[id] ?? defaultItem(),
    [state]
  );

  const toggle = (id: string) => {
    setState((prev) => {
      const s = { ...defaultItem(), ...prev[id] };
      s.done = !s.done;
      if (s.done && !s.date) {
        s.date = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
      }
      if (!s.done) s.date = "";
      const next = { ...prev, [id]: s };
      saveRow(id, s);
      return next;
    });
  };

  const setScore = (id: string, field: "quality" | "time_saved", val: number) => {
    setState((prev) => {
      const s = { ...defaultItem(), ...prev[id], [field]: val };
      const next = { ...prev, [id]: s };
      saveRow(id, s);
      return next;
    });
  };

  const setNotes = (id: string, val: string) => {
    setState((prev) => {
      const s = { ...defaultItem(), ...prev[id], notes: val };
      const next = { ...prev, [id]: s };
      saveRow(id, s);
      return next;
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // Stats
  const TOTAL = WEEKENDS.length;
  const doneCount = WEEKENDS.filter((w) => getItem(w.id).done).length;
  const pct = Math.round((doneCount / TOTAL) * 100);
  const qualityScores = WEEKENDS.map((w) => getItem(w.id))
    .filter((s) => s.done && s.quality > 0)
    .map((s) => s.quality);
  const avgQuality =
    qualityScores.length
      ? (qualityScores.reduce((a, b) => a + b, 0) / qualityScores.length).toFixed(1)
      : "—";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "hsl(222 25% 7%)" }}>
        <div className="font-mono text-[13px]" style={{ color: "hsl(215 16% 37%)" }}>
          Loading your progress…
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-5 pb-16" style={{ maxWidth: 680, margin: "0 auto" }}>
      {/* Header */}
      <div className="flex justify-between items-start mb-7 flex-wrap gap-4">
        <div>
          <h1
            className="font-mono text-[22px] font-bold leading-[1.2] tracking-[-0.5px]"
            style={{ color: "#f1f5f9" }}
          >
            AI Resolution<br />Tracker
          </h1>
          <p className="text-[13px] font-light mt-[5px]" style={{ color: "hsl(215 16% 37%)" }}>
            10-Weekend Path to AI Fluency · 2026
          </p>
        </div>

        <div className="flex items-start gap-4">
          <div className="text-right">
            <div className="font-mono font-bold leading-none" style={{ fontSize: 40, color: "#f1f5f9" }}>
              {pct}
              <span className="text-[22px]" style={{ color: "hsl(215 16% 37%)" }}>%</span>
            </div>
            <div className="text-[11px] uppercase tracking-[1.2px] mt-1" style={{ color: "hsl(215 16% 37%)" }}>
              Complete
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="mt-1 rounded-[8px] border px-3 py-[6px] text-[11px] font-medium uppercase tracking-[0.8px] transition-colors duration-150"
            style={{
              background: "transparent",
              borderColor: "hsl(217 26% 20%)",
              color: "hsl(215 16% 37%)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "hsl(217 36% 26%)";
              (e.currentTarget as HTMLButtonElement).style.color = "#cbd5e1";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "hsl(217 26% 20%)";
              (e.currentTarget as HTMLButtonElement).style.color = "hsl(215 16% 37%)";
            }}
          >
            Log out
          </button>
        </div>
      </div>

      {/* Master progress bar */}
      <div className="h-[5px] rounded-[3px] overflow-hidden mb-6" style={{ background: "hsl(224 24% 14%)" }}>
        <div
          className="h-full rounded-[3px] transition-all duration-500"
          style={{
            width: `${pct}%`,
            background: "linear-gradient(90deg, #3b82f6, #06b6d4)",
            transitionTimingFunction: "cubic-bezier(.4,0,.2,1)",
          }}
        />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-[10px] mb-8">
        {[
          { num: doneCount,         color: "#22c55e", label: "Done" },
          { num: TOTAL - doneCount, color: "#3b82f6", label: "Remaining" },
          { num: avgQuality,        color: "#f59e0b", label: "Avg Quality" },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-[10px] border py-[14px] px-3 text-center"
            style={{ background: "hsl(222 19% 10%)", borderColor: "hsl(217 26% 20%)" }}
          >
            <div className="font-mono text-[24px] font-bold leading-none mb-[5px]" style={{ color: s.color }}>
              {s.num}
            </div>
            <div className="text-[10px] uppercase tracking-[1px]" style={{ color: "hsl(215 16% 37%)" }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Weekend list */}
      <div>
        {WEEKENDS.map((w) => (
          <div key={w.id}>
            {w.section && (
              <div
                className="text-[10px] font-semibold uppercase tracking-[1.8px] mt-6 mb-[10px] ml-[2px]"
                style={{ color: SECTION_COLORS[w.section] || "#64748b" }}
              >
                {w.section}
              </div>
            )}
            <ResolutionCard
              w={w}
              item={getItem(w.id)}
              onToggle={() => toggle(w.id)}
              onScore={(field, val) => setScore(w.id, field, val)}
              onNotes={(val) => setNotes(w.id, val)}
            />
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-10 text-center text-[12px] font-mono" style={{ color: "hsl(215 20% 27%)" }}>
        built with claude · ai resolution 2026
      </div>
    </div>
  );
}
