import { useEffect, useState } from "react";
import { ArrowRight, Compass, MapPin, Trophy } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { quests, rewards, submissions } from "../api";
import TimeSlotSelector from "../components/TimeSlotSelector";
import QuestCard from "../components/QuestCard";
import XPProgress from "../components/XPProgress";
import BadgeCard from "../components/BadgeCard";

export default function Home({ user }) {
  const [slot, setSlot] = useState("morning");
  const [list, setList] = useState([]);
  const [reward, setReward] = useState(null);
  const [subs, setSubs] = useState([]);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(true);
  const nav = useNavigate();

  useEffect(() => {
    let live = true;
    setBusy(true);

    Promise.all([quests.daily(slot), rewards.mine(), submissions.mine()])
      .then(([q, r, s]) => {
        if (live) {
          setList(q);
          setReward(r);
          setSubs(s);
        }
      })
      .catch((e) => live && setErr(e.message))
      .finally(() => live && setBusy(false));

    return () => {
      live = false;
    };
  }, [slot]);

  return (
    <main className="shell">
      <div className="topline">
        <span>● YOUR DAILY FIELD NOTE</span>
        <span>
          {new Date()
            .toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
            .toUpperCase()}
        </span>
      </div>

      <section className="intro">
        <div>
          <small>HELLO, {user?.username?.toUpperCase()}</small>
          <h1>
            Outside is calling.
            <br />
            <em>Pick up.</em>
          </h1>
          <p>One small quest can change the way you see a familiar place.</p>
        </div>
        <div className="stamp">
          <Compass size={26} />
          <b>
            GO WHERE
            <br />
            CURIOSITY LEADS
          </b>
          <small>FIELD CLUB</small>
        </div>
      </section>

      <section className="hero">
        <div>
          <small>TODAY'S INVITATION</small>
          <h2>
            A little less
            <br />
            screen. A little
            <br />
            <em>more world.</em>
          </h2>
          <p>
            Choose a moment. Find one thing you haven't noticed. Bring back a
            story.
          </p>
          <a href="#moments">FIND YOUR QUEST ↘</a>
        </div>
        <div
          className="landscape"
          role="img"
          aria-label="Stylized hills in morning light"
        >
          <span className="sun" />
          <span className="hill h1" />
          <span className="hill h2" />
          <span className="hill h3" />
          <small>
            <MapPin size={12} /> SOMEWHERE CLOSE TO YOU
          </small>
        </div>
      </section>

      <section className="section" id="moments">
        <div className="section-head">
          <div>
            <small>CHOOSE YOUR MOMENT</small>
            <h2>
              What does the day <em>hold?</em>
            </h2>
          </div>
          <span>01 — 03</span>
        </div>
        <TimeSlotSelector value={slot} onChange={setSlot} />
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <small>YOUR FIELD ASSIGNMENTS</small>
            <h2>
              Small quests. <em>Fresh eyes.</em>
            </h2>
          </div>
          <Link to="/quests">ALL QUESTS ↗</Link>
        </div>

        {err && <p className="error">{err}</p>}

        {busy ? (
          <p className="loading">Loading field notes…</p>
        ) : list.length ? (
          <div className="quest-grid">
            {list.slice(0, 3).map((q, i) => (
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
            <h3>No quests in this time slot.</h3>
            <p>Try another time of day or explore all quests.</p>
            <Link to="/quests">Explore quests ↗</Link>
          </div>
        )}
      </section>

      <section className="bottom-grid">
        <div>
          <div className="section-head">
            <div>
              <small>THE LONG GAME</small>
              <h2>
                Your trail, <em>so far.</em>
              </h2>
            </div>
            <Link to="/progress">JOURNAL ↗</Link>
          </div>
          <XPProgress user={user} rewards={reward} />
          <div className="badge-list">
            {reward?.badges?.length ? (
              reward.badges
                .slice(0, 2)
                .map((b) => <BadgeCard key={b.code} badge={b} />)
            ) : (
              <p className="muted">
                Your first badge is out there. Get a quest approved.
              </p>
            )}
          </div>
        </div>

        <aside className="leader-preview">
          <Trophy size={20} />
          <small>THE LOCAL FIELD CLUB</small>
          <h3>
            Good adventures
            <br />
            travel <em>further.</em>
          </h3>
          <p>
            {subs.filter((s) => s.status === "approved").length} quests approved.
            Rankings count approved quest XP only.
          </p>
          <Link className="outline" to="/leaderboard">
            Visit leaderboard <ArrowRight size={15} />
          </Link>
        </aside>
      </section>

      <footer className="footer">
        <b>
          groundtruth<span>.</span>
        </b>
        <span>LESS SCROLLING. MORE EXPLORING.</span>
        <span>STAY CURIOUS, STAY SAFE.</span>
      </footer>
    </main>
  );
}