import { ArrowUpRight, Clock3, Sparkles } from "lucide-react";

export default function QuestCard({ quest, index = 0, onClick }) {
  return (
    <button className="quest-card" onClick={onClick}>
      <div className={`quest-art art-${index % 5}`}>
        <span className="art-id">
          GT / {String(quest.id).padStart(3, "0")}
        </span>
        <span className="art-tag">{quest.category}</span>
      </div>

      <div className="quest-body">
        <div className="meta">
          <span>{quest.difficulty}</span>
          <span>
            <Clock3 size={13} />
            {quest.estimated_minutes} min
          </span>
        </div>

        <h3>{quest.title}</h3>
        <p>{quest.description}</p>

        <div className="quest-foot">
          <span className="xp">
            <Sparkles size={14} />
            {quest.base_xp} XP
          </span>
          <span className="round-arrow">
            <ArrowUpRight size={17} />
          </span>
        </div>
      </div>
    </button>
  );
}