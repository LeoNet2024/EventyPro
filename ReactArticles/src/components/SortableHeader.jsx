export default function SortableHeader({
  label,
  field,
  sortBy,
  sortOrder,
  onSort,
}) {
  const isActive = sortBy === field;
  const arrow = isActive ? (sortOrder === "asc" ? "▲" : "▼") : "";

  return (
    <th onClick={() => onSort(field)} style={{ cursor: "pointer" }}>
      {label} <span style={{ fontSize: "1rem" }}>{arrow}</span>
    </th>
  );
}
