import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { quests } from "../api";
import QuestCard from "../components/QuestCard";
import TimeSlotSelector from "../components/TimeSlotSelector";

export default function Quests() {
  const [list, setList] = useState([]);
  const [slot, setSlot] = useState("all");
  const [diff, setDiff] = useState("all");
  const [cat, setCat] = useState("all");
  const [search, setSearch] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(true);

  const nav = useNavigate();

  useEffect(() => {
    let live = true;

    quests
      .list()
      .then((q) => live && setList(q))
      .catch((e) => live && setErr(e.message))
      .finally(() => live && setBusy(false));

    return () => {
      live = false;
    };
  }, []);

  const cats = [...new Set(list.map((q) => q.category).filter(Boolean))].sort();

  const shown = useMemo(
    () =>
      list.filter(
        (q) =>
          (slot === "all" || q.time_slot === slot) &&
          (diff === "all" || q.difficulty === diff) &&
          (cat === "all" || q.category === cat) &&
          `${q.title} ${q.description} ${q.category}`
            .toLowerCase()
            .includes(search.toLowerCase())
      ),
    [list, slot, diff, cat, search]
  );

  return (
    <main className="shell">
      <div className="topline">
        <span>● THE QUEST ARCHIVE</span>
        <span>COLLECT MOMENTS, NOT MILES</span>
      </div>

      <section className="inner-hero">
        <small>THE WORLD IS YOUR PLAYGROUND</small>
        <h1>
          Look closer.
          <br />
          <em>Find something.</em>
        </h1>
        <p>
          Little assignments for the curious. All you need is a little time and a
          reason to look twice.
        </p>
        <b className="count">
          {list.length.toString().padStart(2, "0")} FIELD ASSIGNMENTS IN THE
          ARCHIVE
        </b>
      </section>

      <section className="filters">
        <small>REFINE YOUR FIELD NOTES</small>
        <TimeSlotSelector
          value={slot === "all" ? "" : slot}
          onChange={(v) => setSlot(slot === v ? "all" : v)}
        />
        <div className="filter-row">
          <label className="search">
            <Search size={15} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Find a little adventure…"
            />
          </label>
          <select
            aria-label="Difficulty"
            value={diff}
            onChange={(e) => setDiff(e.target.value)}
          >
            <option value="all">All levels</option>
            <option>easy</option>
            <option>medium</option>
            <option>hard</option>
          </select>
          <select
            aria-label="Category"
            value={cat}
            onChange={(e) => setCat(e.target.value)}
          >
            <option value="all">All categories</option>
            {cats.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <button
            className="outline"
            onClick={() => {
              setSlot("all");
              setDiff("all");
              setCat("all");
              setSearch("");
            }}
          >
            Reset
          </button>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <small>
            {busy ? "SEARCHING…" : `${shown.length} QUESTS FOUND`}
          </small>
        </div>

        {err && <p className="error">{err}</p>}

        {busy ? (
          <p className="loading">Gathering field notes…</p>
        ) : shown.length ? (
          <div className="quest-grid">
            {shown.map((q, i) => (
              <QuestCard
                key={q.id}
                quest={q}
                index={i}
                onClick={() => nav(`/quests/${q.id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="empty">
            <h3>Nothing on this trail.</h3>
            <p>Try another filter or search term.</p>
          </div>
        )}
      </section>

      <footer className="footer">
        <span>GROUNDTRUTH / QUEST ARCHIVE</span>
        <span>STAY CURIOUS, STAY SAFE.</span>
      </footer>
    </main>
  );
}