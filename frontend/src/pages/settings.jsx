import {
  DarkMode,
  DeleteForever,
  Edit,
  Lock,
  NotificationsActive,
  Palette,
  Person,
  Public,
  Security,
} from "@mui/icons-material";
import { useContext, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { makeRequest } from "../axios";
import Update from "../components/update";

const Settings = () => {
  const { currentUser, logoutLocal } = useContext(AuthContext);
  const [openUpdate, setOpenUpdate] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();

  const { data: user = currentUser } = useQuery({
    queryKey: ["user", currentUser.id],
    queryFn: () =>
      makeRequest.get("/users/find/" + currentUser.id).then((res) => res.data),
  });

  const settingsCards = [
    {
      icon: user.isPrivate ? <Lock /> : <Public />,
      title: "Profile privacy",
      value: user.isPrivate ? "Private account" : "Public account",
      note: user.isPrivate
        ? "Only accepted connections can see protected profile sections."
        : "People can discover your profile and public posts.",
    },
    {
      icon: <Person />,
      title: "Identity",
      value: user.name || user.username,
      note: `@${user.username}`,
    },
    {
      icon: <NotificationsActive />,
      title: "Notifications",
      value: "Enabled",
      note: "Follow requests, messages, reactions, and comments appear in Updates.",
    },
    {
      icon: <DarkMode />,
      title: "Theme",
      value: document.documentElement.getAttribute("data-theme") || "light",
      note: "Use the moon button in the header to switch appearance.",
    },
  ];

  return (
    <div className="uks-settings-page">
      <section className="uks-settings-hero">
        <div>
          <span className="uks-kicker">
            <Security fontSize="small" />
            Account control
          </span>
          <h1>Settings</h1>
          <p>Manage your public identity, privacy, media, and app preferences.</p>
        </div>
        <button className="uks-primary-btn" onClick={() => setOpenUpdate(true)}>
          <Edit fontSize="small" />
          Edit profile
        </button>
      </section>

      <section className="uks-settings-grid uks-settings-grid--rich">
        {settingsCards.map((card) => (
          <article key={card.title} className="uks-settings-tile">
            <span>{card.icon}</span>
            <strong>{card.title}</strong>
            <b>{card.value}</b>
            <p>{card.note}</p>
          </article>
        ))}
      </section>

      <section className="uks-card uks-settings-overview">
        <div className="uks-section-title">
          <div>
            <h2>Profile presentation</h2>
            <p>These fields shape how people see you across feed, stories, and messages.</p>
          </div>
          <Palette />
        </div>
        <div className="uks-settings-list">
          <div>
            <span>Display name</span>
            <strong>{user.name || user.username}</strong>
          </div>
          <div>
            <span>Bio</span>
            <strong>{user.bio || "No bio added yet"}</strong>
          </div>
          <div>
            <span>Website</span>
            <strong>{user.website || "No website added"}</strong>
          </div>
          <div>
            <span>Messaging rule</span>
            <strong>Only connected users can message each other</strong>
          </div>
        </div>
      </section>

          <section className="uks-card uks-settings-danger">
        <div className="uks-section-title">
          <div>
            <h2>Danger zone</h2>
            <p>Permanently delete your account, posts, messages, and all data. This cannot be undone.</p>
          </div>
          <DeleteForever />
        </div>

        {!confirmDelete ? (
          <button
            className="uks-danger-btn"
            onClick={() => setConfirmDelete(true)}
          >
            <DeleteForever fontSize="small" />
            Delete my account
          </button>
        ) : (
          <div className="uks-delete-confirm">
            <p>Are you sure? This will permanently delete your account and everything on it.</p>
            <div>
              <button
                className="uks-danger-btn"
                disabled={deleting}
                onClick={async () => {
                  setDeleting(true);
                  try {
                    await makeRequest.delete("/users");
                    logoutLocal();
                    navigate("/login");
                  } catch {
                    setDeleting(false);
                    setConfirmDelete(false);
                    alert("Something went wrong. Try again.");
                  }
                }}
              >
                {deleting ? "Deleting..." : "Yes, delete everything"}
              </button>
              <button
                className="uks-secondary-btn"
                onClick={() => setConfirmDelete(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </section>

      {openUpdate && <Update setOpenUpdate={setOpenUpdate} user={user} />}
    </div>
  );
};

export default Settings;
