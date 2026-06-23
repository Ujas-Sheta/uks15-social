import PropTypes from "prop-types";
import { useState } from "react";
import { makeRequest } from "../axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const Update = ({ setOpenUpdate, user }) => {
  const [profile, setProfile] = useState(null);
  const [cover, setCover] = useState(null);
  const [info, setInfo] = useState({
    name: user.name || "",
    bio: user.bio || "",
    website: user.website || "",
    isPrivate: Boolean(user.isPrivate),
  });

  const queryClient = useQueryClient();

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    setInfo((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const upload = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await makeRequest.post("/upload", formData);
    return res.data.filename || res.data;
  };

  const mutation = useMutation({
    mutationFn: (updatedUser) => makeRequest.put("/users", updatedUser),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", user.id] });
      setOpenUpdate(false);
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const coverUrl = cover ? await upload(cover) : user.coverPic;
    const profileUrl = profile ? await upload(profile) : user.profilePic;

    mutation.mutate({
      ...info,
      coverPic: coverUrl,
      profilePic: profileUrl,
    });
  };

  return (
    <div className="uks-modal-backdrop">
      <form className="uks-settings-card" onSubmit={handleSubmit}>
        <div className="uks-settings-card__header">
          <div>
            <h2>Edit profile</h2>
            <p>Update your public info, images, and account privacy.</p>
          </div>
          <button type="button" onClick={() => setOpenUpdate(false)}>
            Close
          </button>
        </div>

        <label>
          Display name
          <input
            type="text"
            name="name"
            value={info.name}
            onChange={handleChange}
          />
        </label>

        <label>
          Bio
          <textarea name="bio" value={info.bio} onChange={handleChange} />
        </label>

        <label>
          Website
          <input
            type="url"
            name="website"
            value={info.website}
            onChange={handleChange}
          />
        </label>

        <label>
          Profile picture
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setProfile(e.target.files[0])}
          />
        </label>

        <label>
          Cover photo
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setCover(e.target.files[0])}
          />
        </label>

        <label className="uks-toggle-row">
          <span>
            <strong>Private account</strong>
            <small>Only followers can see your posts, photos, and connections.</small>
          </span>
          <input
            type="checkbox"
            name="isPrivate"
            checked={info.isPrivate}
            onChange={handleChange}
          />
        </label>

        <button className="uks-primary-btn" type="submit">
          Save changes
        </button>
      </form>
    </div>
  );
};

Update.propTypes = {
  setOpenUpdate: PropTypes.func.isRequired,
  user: PropTypes.object.isRequired,
};

export default Update;
