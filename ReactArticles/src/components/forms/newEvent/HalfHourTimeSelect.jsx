// HalfHourTimeSelect.jsx
import React, { useMemo } from "react";

function pad(n) {
  return String(n).padStart(2, "0");
}

export default function HalfHourTimeSelect({
  value,
  onChange,
  startHour = 0,
  endHour = 23,
  name = "startTime",
  className,
}) {
  const options = useMemo(() => {
    const out = [];
    for (let h = startHour; h <= endHour; h++) {
      for (const m of [0, 30]) out.push(`${pad(h)}:${pad(m)}`);
    }
    return out;
  }, [startHour, endHour]);

  return (
    <select
      name={name}
      className={className}
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      required
    >
      <option value="">-- Select time --</option>
      {options.map((t) => (
        <option key={t} value={t}>
          {t}
        </option>
      ))}
    </select>
  );
}
