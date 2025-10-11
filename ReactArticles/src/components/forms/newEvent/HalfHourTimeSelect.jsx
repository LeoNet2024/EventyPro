// HalfHourTimeSelect.jsx
import React, { useMemo } from "react";

function pad(n) {
  return String(n).padStart(2, "0");
}

export default function HalfHourTimeSelect({
  value,
  onChange,
  startHour,
  endHour = 23,
  name = "startTime",
  className,
  is_today,
}) {
  console.log("halfHourFunction() ");
  // if today the start time will start from the current hour, otherwise from 0
  const beginingOFStartTimeEventRange = is_today
    ? new Date().getHours() + 1
    : 0;

  const options = useMemo(() => {
    const out = [];
    for (let h = beginingOFStartTimeEventRange; h <= endHour; h++) {
      for (const m of [0, 30]) out.push(`${pad(h)}:${pad(m)}`);
    }
    return out;
  }, [beginingOFStartTimeEventRange, endHour]);

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
