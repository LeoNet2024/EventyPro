import classes from "./EventSearchBar.module.css";

export default function EventSearchBar({ search, setSearch }) {
  return (
    <div className={classes.searchContainer}>
      <input
        type="text"
        placeholder="Search events..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className={classes.searchInput}
      />
    </div>
  );
}
