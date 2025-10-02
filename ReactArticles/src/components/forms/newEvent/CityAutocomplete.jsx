import React, { useEffect, useMemo, useRef, useState } from "react";

const norm = (s) => (s || "").trim().toLowerCase();

function filterOptions(options, q) {
  const nq = norm(q);
  if (!nq) return options.slice(0, 50);
  return options.filter((o) => norm(o).includes(nq)).slice(0, 50);
}

export default function CityAutocomplete({
  options = [], // array of strings
  value = "", // selected city (must exist in options)
  onChange, // (val) => void
  placeholder = "Start typing a city…",
  className, // optional class for the input
  name = "city", // form field name
  required = true,
}) {
  const [input, setInput] = useState(value || "");
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [hi, setHi] = useState(-1); // highlighted index
  const boxRef = useRef(null);

  const filtered = useMemo(
    () => filterOptions(options, input),
    [options, input]
  );

  // keep input in sync when parent value changes
  useEffect(() => {
    setInput(value || "");
  }, [value]);

  function choose(val) {
    setInput(val);
    setOpen(false);
    setHi(-1);
    setError("");
    onChange?.(val);
  }

  function handleInputChange(e) {
    const v = e.target.value;
    setInput(v);
    setOpen(true);
    setHi(-1);
    // do NOT emit here; only emit on valid choose/blur
  }

  function handleKeyDown(e) {
    if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      setOpen(true);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHi((i) => Math.min((i < 0 ? -1 : i) + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHi((i) => Math.max((i < 0 ? 0 : i) - 1, 0));
    } else if (e.key === "Enter") {
      if (open && hi >= 0 && filtered[hi]) {
        e.preventDefault();
        choose(filtered[hi]);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
      setHi(-1);
    }
  }

  function handleBlur() {
    // Small delay to allow click selection before blur closes
    setTimeout(() => {
      const exists = options.some((o) => norm(o) === norm(input));
      if (!exists) {
        // Strategy: revert to last valid selected value (or clear)
        const lastValid = value || "";
        setInput(lastValid);
        setError("בחר עיר מהרשימה"); // Hebrew error
      } else {
        setError("");
        // If user typed exact match manually, emit it
        if (input !== value) onChange?.(input);
      }
      setOpen(false);
      setHi(-1);
    }, 120);
  }

  function handleOptionMouseDown(e, opt) {
    // use onMouseDown to select before input loses focus
    e.preventDefault();
    choose(opt);
  }

  return (
    <div ref={boxRef} style={{ position: "relative" }}>
      <input
        type="text"
        name={name}
        value={input}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => setOpen(true)}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={className}
        autoComplete="off"
        required={required}
      />
      {open && filtered.length > 0 && (
        <ul
          style={{
            position: "absolute",
            zIndex: 10,
            left: 0,
            right: 0,
            margin: 0,
            padding: 0,
            listStyle: "none",
            background: "white",
            border: "1px solid #ddd",
            maxHeight: 220,
            overflowY: "auto",
            borderTop: "none",
          }}
        >
          {filtered.map((opt, idx) => (
            <li
              key={opt + idx}
              onMouseDown={(e) => handleOptionMouseDown(e, opt)}
              style={{
                padding: "8px 12px",
                cursor: "pointer",
                background: hi === idx ? "#f0f0f0" : "white",
                whiteSpace: "nowrap",
                textOverflow: "ellipsis",
                overflow: "hidden",
              }}
              onMouseEnter={() => setHi(idx)}
            >
              {opt}
            </li>
          ))}
        </ul>
      )}
      {error && (
        <div style={{ color: "#d32f2f", fontSize: 12, marginTop: 4 }}>
          {error}
        </div>
      )}
    </div>
  );
}
