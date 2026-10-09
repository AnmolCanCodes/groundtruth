import { Sun, Sunset, MoonStar } from "lucide-react";

const slots = [
  ["morning", "Morning", "Start with the light", Sun],
  ["evening", "Evening", "Look a little closer", Sunset],
  ["night", "Night", "Optional, stay safe", MoonStar],
];

export default function TimeSlotSelector({ value, onChange }) {
  return (
    <div className="slots">
      {slots.map(([id, title, note, Icon]) => (
        <button
          key={id}
          className={value === id ? "slot selected" : "slot"}
          onClick={() => onChange(id)}
          aria-pressed={value === id}
        >
          <Icon size={20} />
          <span>
            <b>{title}</b>
            <small>{note}</small>
          </span>
        </button>
      ))}
    </div>
  );
}