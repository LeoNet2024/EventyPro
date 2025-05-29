import classes from "./UserSearchBar.module.css";

export default function UserSearchBar({ search, setSearch }) {
  return (
    <div className={classes.searchBar}>
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search users..."
        className={classes.input}
      />
    </div>
  );
}
