import { Flame, ArrowUpRight } from "lucide-react";

const marks = [0, 200, 600, 1200, 2000, 3000];

export default function XPProgress({ user, rewards }) {
  const xp = rewards?.total_xp ?? user?.total_xp ?? 0;
  const level =
    rewards?.level ??
    (xp >= 3000 ? 6 : xp >= 2000 ? 5 : xp >= 1200 ? 4 : xp >= 600 ? 3 : xp >= 200 ? 2 : 1);
  const floor = marks[level - 1] || 0;
  const next = marks[level] || floor + 1000;
  const pct = Math.min(100, ((xp - floor) / (next - floor)) * 100);

  return (
    <section className="xp-panel">
      <div className="panel-kicker">
        YOUR FIELD RECORD <ArrowUpRight size={15} />
      </div>

      <div className="level-row">
        <div>
          <small>CURRENT LEVEL</small>
          <h3>
            Wanderer <span className="clay">0{level}</span>
          </h3>
        </div>
        <div className="xp-total">
          <b>{xp.toLocaleString()}</b>
          <small>lifetime XP</small>
        </div>
      </div>

      <div className="track">
        <span style={{ width: `${pct}%` }} />
      </div>

      <div className="track-label">
        <span>{Math.max(0, next - xp)} XP to next level</span>
        <span>
          LVL {level} / {level + 1}
        </span>
      </div>

      <div className="streak">
        <Flame size={18} />
        <span>
          <b>{rewards?.current_streak ?? user?.current_streak ?? 0} day streak</b>
          <small>Small adventures add up.</small>
        </span>
        <small className="best">
          BEST {rewards?.longest_streak ?? user?.longest_streak ?? 0}
        </small>
      </div>
    </section>
  );
}