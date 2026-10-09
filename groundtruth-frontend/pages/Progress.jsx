import { useEffect, useState } from "react";
import { BookOpen, CheckCircle2, Flame, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { rewards, submissions, quests } from "../api";
import XPProgress from "../components/XPProgress";
import BadgeCard from "../components/BadgeCard";

export default function Progress({ user }) {
  const [r, setR] = useState(null);
  const [ss, setS] = useState([]);
  const [qs, setQ] = useState([]);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    let live = true;

    Promise.all([rewards.mine(), submissions.mine(), quests.list()])
      .then(([a, b, c]) => {
        if (live) {
          setR(a);
          setS(b);
          setQ(c);
        }
      })
      .catch((e) => live && setErr(e.message))
      .finally(() => live && setBusy(false));

    return () => {
      live = false;
    };
  }, []);

  const map = Object.fromEntries(qs.map((q) => [q.id, q]));
  const approved = ss.filter((s) => s.status === "approved");
  const weekly = approved
    .filter(
      (s) =>
        s.reviewed_at && Date.now() - new Date(s.reviewed_at) < 7 * 864e5
    )
    .reduce((n, s) => n + s.xp_awarded, 0);

  return (
    <main className="shell">
      <div className="topline">
        <span>● PERSONAL FIELD JOURNAL</span>
        <span>YOUR RECORD / GT-01</span>
      </div>

      <section className="inner-hero">
        <small>EVERY LITTLE DISCOVERY COUNTS</small>
        <h1>
          A life, <em>observed.</em>
        </h1>
        <p>
          This isn't a race. It's a record of all the times you stepped out and paid
          attention.
        </p>
      </section>

      {err && <p className="error">{err}</p>}

      {busy ? (
        <p className="loading">Opening your journal…</p>
      ) : (
        <>
          <section className="progress-grid">
            <div>
              <XPProgress user={user} rewards={r} />
              <div className="stats">
                <div>
                  <small>
                    <CheckCircle2 size={12} /> APPROVED QUESTS
                  </small>
                  <b>{approved.length}</b>
                  <span>Moments made official</span>
                </div>
                <div>
                  <small>
                    <Sparkles size={12} /> THIS WEEK
                  </small>
                  <b>{weekly} XP</b>
                  <span>Approved, last 7 days</span>
                </div>
                <div>
                  <small>
                    <Flame size={12} /> BEST STREAK
                  </small>
                  <b>{r?.longest_streak || 0} days</b>
                  <span>Keep finding your way out</span>
                </div>
              </div>
            </div>

            <aside className="journal-note">
              <BookOpen />
              <small>A SMALL REMINDER</small>
              <h3>You're collecting a way of seeing.</h3>
              <p>
                Some days are for big adventures. Some days, noticing one small
                thing is enough.
              </p>
            </aside>
          </section>

          <section className="section">
            <div className="section-head">
              <div>
                <small>MARKS YOU'VE EARNED</small>
                <h2>
                  Your <em>field badges.</em>
                </h2>
              </div>
              <span>{r?.badges?.length || 0} EARNED</span>
            </div>

            {r?.badges?.length ? (
              <div className="badges">
                {r.badges.map((b) => (
                  <BadgeCard key={b.code} badge={b} />
                ))}
              </div>
            ) : (
              <div className="empty">
                No badges yet. Get your first quest approved to earn a field
                mark.
              </div>
            )}
          </section>

          <section className="section">
            <div className="section-head">
              <div>
                <small>THE THINGS YOU DID</small>
                <h2>
                  Recent <em>field notes.</em>
                </h2>
              </div>
              <span>{ss.length} ENTRIES</span>
            </div>

            {ss.length ? (
              <div className="submissions">
                {ss.map((s) => (
                  <div className="submission" key={s.id}>
                    <div>
                      <b>
                        {map[s.quest_id]?.title || `Quest #${s.quest_id}`}
                      </b>
                      <small>
                        Submitted{" "}
                        {new Date(s.submitted_at).toLocaleDateString("en-IN")}
                      </small>
                    </div>
                    <span className={`status status-${s.status}`}>
                      {s.status.replace("_", " ")}
                    </span>
                    <strong>
                      {s.status === "approved" ? `+${s.xp_awarded} XP` : "—"}
                    </strong>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty">
                <BookOpen />
                <h3>The first page is still blank.</h3>
                <p>Your submissions will appear here.</p>
                <Link to="/quests">Find your first quest ↗</Link>
              </div>
            )}
          </section>
        </>
      )}

      <footer className="footer">
        <span>GROUNDTRUTH / PERSONAL JOURNAL</span>
        <span>THE BEST DATA IS A DAY WELL SPENT.</span>
      </footer>
    </main>
  );
}