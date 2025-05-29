import { useEffect, useState } from "react";
import axios from "axios";
import classes from "./UserList.module.css";
import { useAuth } from "../../context/AuthContext";
import UserRow from "../../components/UserRow/UserRow";
import UserSearchBar from "../../components/UserSearchBar/UserSearchBar";

export default function UserList() {
  const [users, setUsers] = useState([]);
  const { user } = useAuth();
  const [sortBy, setSortBy] = useState("first_name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    axios
      .get("/admin/users")
      .then((res) => setUsers(res.data))
      .catch((err) => console.error("Error fetching users:", err));
  };

  const handleBlock = (id, isBlocked) => {
    axios
      .patch(`/admin/users/${id}/block`, { blocked: !isBlocked })
      .then(() => fetchUsers())
      .catch((err) => console.error("Error blocking user:", err));
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      axios
        .delete(`/admin/users/${id}`)
        .then(() => fetchUsers())
        .catch((err) => console.error("Error deleting user:", err));
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const filteredUsers = users
    // Exclude the current logged-in user from the list
    .filter((u) => u.user_id !== user?.user_id)

    // Filter users based on the search term (case-insensitive match)
    .filter(
      (u) =>
        `${u.first_name} ${u.last_name} ${u.user_name} ${u.email}`
          .toLowerCase()
          .includes(search.toLowerCase()) // If there is a search string, it will filter the users with the searched filter
    )

    // Sort users based on the selected field and order
    .sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];

      // For string fields, use localeCompare for proper alphabetical sorting
      if (typeof aValue === "string") {
        return sortOrder === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      // For numeric/boolean fields, use basic comparison
      return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
    });

  return (
    <div className={classes.userList}>
      <h2 className={classes.sectionTitle}>Manage Users</h2>
      <UserSearchBar search={search} setSearch={setSearch} />
      <table>
        <thead>
          <tr>
            <th onClick={() => handleSort("first_name")}>
              Full Name{" "}
              {sortBy === "first_name" && (sortOrder === "asc" ? "▲" : "▼")}
            </th>
            <th onClick={() => handleSort("user_name")}>
              Username{" "}
              {sortBy === "user_name" && (sortOrder === "asc" ? "▲" : "▼")}
            </th>
            <th onClick={() => handleSort("email")}>
              Email {sortBy === "email" && (sortOrder === "asc" ? "▲" : "▼")}
            </th>
            <th onClick={() => handleSort("blocked")}>
              Status {sortBy === "blocked" && (sortOrder === "asc" ? "▲" : "▼")}
            </th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((currentUser) => (
            <UserRow
              key={currentUser.user_id}
              user={currentUser}
              onBlock={handleBlock}
              onDelete={handleDelete}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
