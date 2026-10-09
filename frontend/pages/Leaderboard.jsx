import { useEffect, useState } from "react";
import { MapPin, Trophy, Compass } from "lucide-react";
import { rewards } from "../api";

export default function Leaderboard({ user }) {
  const [type, setType] = useState("country");
  const [region, setRegion] = useState(user?.country || "India");
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(
    () => setRegion(user?.[type] || (type === "country" ? "India" : "")),
    [type, user]
  );

  useEffect(() => {
    if (!region.trim()) {
      setRows([]);
      return;
    }

    let live = true;
    setBusy(true);
    setErr("");

    rewards
      .board(type, region.trim())
      .then((r) => live && setRows(r))
      .catch((e) => {
        if (live) {
          setRows([]);
          setErr(e.message);
        }
      })
      .finally(() => live && setBusy(false));

    return () => {
      live = false;
    };
  }, [type, region]);

  return (
    <main className="shell">
      <div className="topline">
        <span>● THE WEEKLY FIELD CLUB</span>
        <span>APPROVED XP / UTC WEEK</span>
      </div>

      <section className="leader-hero">
        <div>
          <small>FRIENDLY FIELD COMPETITION</small>
          <h1>
            Out there, <em>together.</em>
          </h1>
          <p>
            A little friendly motivation to get outside. Rankings count approved
            quest XP this UTC week—not attempts, not promises.
          </p>
        </div>
        <div className="leader-land">
          <Trophy size={34} />
          <span>
            WEEKLY
            <br />
            FIELD CLUB
          </span>
        </div>
      </section>

      <section className="filters">
        <small>
          <MapPin size={13} /> CHOOSE YOUR PATCH
        </small>
        <div className="filter-row">
          {["country", "state", "city"].map((t) => (
            <button
              className={type === t ? "primary" : "outline"}
              key={t}
              onClick={() => setType(t)}
            >
              {t}
            </button>
          ))}
          <input
            aria-label="Region name"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            placeholder={`Enter ${type}`}
          />
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <small>THE CURRENT STANDINGS</small>
            <h2>
              {region || "Your region"} <em>on the board.</em>
            </h2>
          </div>
          <span>TOP 100</span>
        </div>

        {busy ? (
          <p className="loading">Checking the field board…</p>
        ) : err ? (
          <p className="error">{err}</p>
        ) : !rows.length ? (
          <div className="empty">
            <Trophy size={25} />
            <h3>No rankings here. Yet.</h3>
            <p>
              No approved XP records for this region this week. Be the first to
              get outside.
            </p>
          </div>
        ) : (
          <div className="table">
            <div className="table-head">
              <span>RANK</span>
              <span>EXPLORER</span>
              <span>LEVEL</span>
              <span>WEEKLY XP</span>
            </div>
            {rows.map((r) => (
              <div
                className={`table-row ${
                  r.username === user?.username ? "you" : ""
                }`}
                key={r.username}
              >
                <span>{String(r.rank).padStart(2, "0")}</span>
                <b>
                  {r.username}
                  {r.username === user?.username && <small> YOU</small>}
                </b>
                <span>LVL {r.level}</span>
                <strong>
                  {r.weekly_xp} <small>XP</small>
                </strong>
              </div>
            ))}
          </div>
        )}

        <p className="muted">
          <Compass size={13} /> Only XP from approved quests counts. Rankings
          reset Monday at 00:00 UTC.
        </p>
      </section>

      <footer className="footer">
        <span>GROUNDTRUTH / WEEKLY FIELD CLUB</span>
        <span>COMPETE WITH KINDNESS.</span>
      </footer>
    </main>
  );
}