import { Award, Leaf, Footprints, CalendarDays, Compass } from "lucide-react";

const icons = {
  first_quest: Footprints,
  explorer: Compass,
  weekly_adventurer: CalendarDays,
  nature_spotter: Leaf,
};

export default function BadgeCard({ badge }) {
  const Icon = icons[badge.code] || Award;

  return (
    <div className="badge">
      <span className="badge-icon">
        <Icon size={21} />
      </span>
      <span>
        <b>{badge.name}</b>
        <small>{badge.description}</small>
      </span>
    </div>
  );
}