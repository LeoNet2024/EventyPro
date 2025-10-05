import React, { useState } from "react";
import classes from "./edit.module.css";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";

export default function EditUser({ user, showForm, user_id }) {
  const { setUser } = useAuth();

  // image state
  const [imageFile, setImageFile] = useState(null);

  // use state for form
  const [formData, setFormData] = useState({
    first_name: user.first_name,
    last_name: user.last_name,
    user_name: user.user_name,
    user_id: user_id,
  });

  // update the form data
  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      user_id: user_id,
    }));
  }

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
    }
  }

  // sending the form by put
  function handleSubmit(e) {
    e.preventDefault();

    // image uploaded - upload image and change src value
    if (imageFile) {
      const data = new FormData();
      data.append("file", imageFile);

      axios
        .post("/upload", data, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        .then((up) => {
          const filename = up?.data?.file?.filename; // הגנה מ-undefined
          if (!filename)
            throw new Error("Upload succeeded but filename missing");

          return axios.put("/personal-area/editProfile", {
            first_name: formData.first_name,
            last_name: formData.last_name,
            user_name: formData.user_name,
            user_id: formData.user_id,
            src: `/uploads/${filename}`,
          });
        })
        .then((res) => {
          setUser(res.data);
          showForm(false);
        })
        .catch((error) => {
          console.error("Update failed:", error);
          alert("Something went wrong while updating. Please try again.");
        });

      return; // חשוב: לא להמשיך למסלול ללא קובץ
    }

    // no image file - changing only text fields
    axios
      .put("/personal-area/editProfile", {
        first_name: formData.first_name,
        last_name: formData.last_name,
        user_name: formData.user_name,
        user_id: formData.user_id,
      })
      .then((res) => {
        setUser(res.data);
        showForm(false);
      })
      .catch((error) => {
        console.error("Update failed:", error);
        alert("Something went wrong while updating. Please try again.");
      });
  }

  return (
    <div className={classes.backdrop}>
      <div className={classes.modal}>
        <h2>Edit User</h2>
        <form className={classes.form} onSubmit={handleSubmit}>
          <label>
            First Name:
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
            />
          </label>

          <label>
            Last Name:
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
            />
          </label>

          <label>
            Username:
            <input
              type="text"
              name="user_name"
              value={formData.user_name}
              onChange={handleChange}
            />
          </label>

          <label>
            Profile Image:
            <input type="file" accept="image/*" onChange={handleFileChange} />
          </label>

          {/* to do -> add cities */}

          <button type="submit">Save Changes</button>
          <button
            type="button"
            style={{ backgroundColor: "red" }}
            onClick={() => showForm(false)}
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
}
