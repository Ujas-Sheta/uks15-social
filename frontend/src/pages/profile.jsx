import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import XIcon from "@mui/icons-material/X";
import EditIcon from "@mui/icons-material/Edit";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import { makeRequest } from "../axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AuthContext } from "../context/AuthContext";
import { Link, useLocation } from "react-router-dom";
import { useContext, useState } from "react";
import Posts from "../components/Posts";
import Update from "../components/update";
import { useToast } from "../context/useToast";
import { uploadUrl, profileUrl } from "../utils/upload";

const Profile = () => {
  const [openUpdate, setOpenUpdate] = useState(false);
  const [activeTab, setActiveTab] = useState("posts");
  const userId = parseInt(useLocation().pathname.split("/")[2]);
  const { currentUser } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const { isPending, isError, data } = useQuery({
    queryKey: ["user", userId],
    enabled: Number.isFinite(userId),
    retry: false,
    queryFn: () =>
      makeRequest.get("/users/find/" + userId).then((res) => res.data),
  });

  const { data: relationshipData = [] } = useQuery({
    queryKey: ["relationship", userId],
    enabled: Number.isFinite(userId),
    queryFn: () =>
      makeRequest
        .get("/relationships/?followedUserId=" + userId)
        .then((res) => res.data),
  });

  const { data: outgoingRequests = [] } = useQuery({
    queryKey: ["outgoing-requests"],
    queryFn: () =>
      makeRequest
        .get("/relationships/requests/outgoing")
        .then((res) => res.data),
  });

  const mutation = useMutation({
    mutationFn: async (following) => {
      if (following) {
        const res = await makeRequest.delete("/relationships?userId=" + userId);
        return res.data;
      } else {
        const res = await makeRequest.post("/relationships", { userId });
        return res.data;
      }
    },
    onSuccess: (message) => {
      queryClient.invalidateQueries({ queryKey: ["relationship", userId] });
      queryClient.invalidateQueries({ queryKey: ["outgoing-requests"] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["following-contacts"] });
      queryClient.invalidateQueries({ queryKey: ["followers", userId] });
      showToast(message || "Profile updated.");
    },
    onError: (error) => {
      const message =
        error.response?.data?.sqlMessage ||
        error.response?.data ||
        "Could not update follow status.";
      showToast(message, "error");
    },
  });

  const { data: profilePosts = [] } = useQuery({
    queryKey: ["posts", userId, "profile-tabs"],
    enabled: Number.isFinite(userId),
    queryFn: () =>
      makeRequest.get("/posts?userId=" + userId).then((res) => res.data),
  });

  const { data: connections = [] } = useQuery({
    queryKey: ["followers", userId],
    enabled: Number.isFinite(userId),
    queryFn: () =>
      makeRequest
        .get("/relationships/followers?userId=" + userId)
        .then((res) => res.data),
  });

  if (isPending) {
    return <div className="uks-card uks-empty">Loading profile...</div>;
  }

  if (!Number.isFinite(userId) || isError || !data) {
    return (
      <section className="uks-card uks-instagram-empty">
        <h3>Profile not found</h3>
        <p>This account was removed or the link is old after the database reset.</p>
        <Link className="uks-primary-btn" to="/friends">
          Discover people
        </Link>
      </section>
    );
  }

  if (!currentUser?.id) {
    return (
      <section className="uks-card uks-instagram-empty">
        <h3>Please log in again</h3>
        <p>Your saved browser session is old. Log in again before opening profiles.</p>
        <Link className="uks-primary-btn" to="/login">
          Log in
        </Link>
      </section>
    );
  }

  const isOwner = data.id === currentUser.id;
  const isFollowing = relationshipData.includes(currentUser.id);
  const requestPending = outgoingRequests.includes(userId);
  const isPrivateLocked = Boolean(data.isPrivate) && !isOwner && !isFollowing;

  const photos = profilePosts.filter((post) => post.img);

  const renderTabContent = () => {
    if (isPrivateLocked) {
      return (
        <div className="uks-card uks-private-state">
          <h2>This account is private</h2>
          <p>Follow this person to see their posts, photos, and connections.</p>
        </div>
      );
    }

    if (activeTab === "posts") {
      return <Posts userId={userId} />;
    }

    if (activeTab === "about") {
      return (
        <section className="uks-card uks-tab-panel">
          <h2>About</h2>
          {data.bio || data.website || data.city ? (
            <div className="uks-about-list">
              <p>{data.bio || "No bio added yet."}</p>
              {data.city && <p><strong>Lives in</strong> {data.city}</p>}
              {data.website && <p><strong>Website</strong> {data.website}</p>}
            </div>
          ) : (
            <div className="uks-instagram-empty">
              <h3>No details yet</h3>
              <p>When this person adds profile details, they will appear here.</p>
            </div>
          )}
        </section>
      );
    }

    if (activeTab === "photos") {
      return (
        <section className="uks-card uks-tab-panel">
          <h2>Photos</h2>
          {photos.length === 0 ? (
            <div className="uks-instagram-empty">
              <h3>No photos posted yet</h3>
              <p>Photo posts will show up here in a clean grid.</p>
            </div>
          ) : (
            <div className="uks-photo-grid">
              {photos.map((post) => (
                <img
                  key={post.id}
                  src={uploadUrl(post.img)}
                  alt="Profile post"
                />
              ))}
            </div>
          )}
        </section>
      );
    }

    return (
      <section className="uks-card uks-tab-panel">
        <h2>Connections</h2>
        {connections.length === 0 ? (
          <div className="uks-instagram-empty">
            <h3>No connections yet</h3>
            <p>Followers and connections will appear here.</p>
          </div>
        ) : (
          <div className="uks-connection-grid">
            {connections.map((person) => (
              <div key={person.id} className="uks-connection-card">
                <img
                  src={profileUrl(person.profilePic)}
                  alt=""
                />
                <strong>{person.name || person.username}</strong>
                <span>@{person.username}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    );
  };

  return (
    <div className="uks-profile">
      <section className="uks-profile-hero uks-card">
        <div
          className="uks-profile-cover"
          style={{
            backgroundImage: data.coverPic
              ? `url(${uploadUrl(data.coverPic)})`
              : "linear-gradient(135deg, #16a34a, #86efac)",
          }}
        />
        <div className="uks-profile-main">
          <img
            className="uks-profile-avatar"
            src={profileUrl(data.profilePic)}
            alt={`${data.username} profile`}
          />
          <div className="uks-profile-info">
            <h1>{data.name || data.username}</h1>
            <p>@{data.username}</p>
            <div className="uks-profile-stats">
              <span>
                <strong>{relationshipData.length}</strong> followers
              </span>
              <span>
                <strong>{data.isPrivate ? "Private" : "Public"}</strong> profile
              </span>
            </div>
          </div>
          <div className="uks-profile-actions">
            {isOwner ? (
              <button
                className="uks-primary-btn"
                onClick={() => setOpenUpdate(true)}
              >
                <EditIcon fontSize="small" /> Edit Profile
              </button>
            ) : (
              <>
                <button
                  onClick={() => mutation.mutate(isFollowing)}
                  className={isFollowing ? "uks-secondary-btn" : "uks-primary-btn"}
                  disabled={requestPending || mutation.isPending}
                >
                  <PersonAddIcon fontSize="small" />
                  {mutation.isPending
                    ? "Sending..."
                    : isFollowing
                    ? "Following"
                    : requestPending
                    ? "Request sent"
                    : data.isPrivate
                    ? "Request follow"
                    : "Follow"}
                </button>
                <Link className="uks-secondary-btn" to={`/messages/${userId}`}>
                  <ChatBubbleOutlineIcon fontSize="small" /> Message
                </Link>
              </>
            )}
          </div>
        </div>

        <nav className="uks-profile-tabs">
          <button
            className={activeTab === "posts" ? "is-active" : ""}
            onClick={() => setActiveTab("posts")}
          >
            Posts
          </button>
          <button
            className={activeTab === "about" ? "is-active" : ""}
            onClick={() => setActiveTab("about")}
          >
            About
          </button>
          <button
            className={activeTab === "photos" ? "is-active" : ""}
            onClick={() => setActiveTab("photos")}
          >
            Photos
          </button>
          <button
            className={activeTab === "connections" ? "is-active" : ""}
            onClick={() => setActiveTab("connections")}
          >
            Connections
          </button>
        </nav>
      </section>

      <div className="uks-profile-content">
        <aside className="uks-profile-aside">
          <section className="uks-card">
            <h2>Intro</h2>
            <p>{data.bio || "Building a circle on Uks15."}</p>
            <div className="uks-social-links">
              {data.facebookProfile && (
                <a href={data.facebookProfile} target="_blank" rel="noreferrer">
                  <FacebookIcon />
                </a>
              )}
              {data.instagramProfile && (
                <a href={data.instagramProfile} target="_blank" rel="noreferrer">
                  <InstagramIcon />
                </a>
              )}
              {data.XProfile && (
                <a href={data.XProfile} target="_blank" rel="noreferrer">
                  <XIcon />
                </a>
              )}
            </div>
          </section>
        </aside>
        <section className="uks-profile-feed">
          {renderTabContent()}
        </section>
      </div>

      {openUpdate && <Update setOpenUpdate={setOpenUpdate} user={data} />}
    </div>
  );
};

export default Profile;
