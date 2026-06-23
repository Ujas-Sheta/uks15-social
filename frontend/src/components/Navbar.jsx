import {
  AccountCircle,
  Add,
  AddPhotoAlternate,
  CalendarMonth,
  DarkMode,
  GridView,
  Home,
  Logout,
  MailOutline,
  NotificationsNone,
  PeopleAlt,
  PostAdd,
  Search,
  Settings,
  Storefront,
  VideoLibrary,
} from "@mui/icons-material";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useContext, useEffect, useMemo, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { makeRequest } from "../axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getNotificationLink } from "../utils/notificationLink";
import { profileUrl } from "../utils/upload";

const Navbar = () => {
  const { currentUser } = useContext(AuthContext);
  const [theme, setTheme] = useState(
    localStorage.getItem("theme") ? localStorage.getItem("theme") : "light"
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => makeRequest.get("/notifications").then((res) => res.data),
    refetchInterval: 15000,
  });

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.isRead).length,
    [notifications]
  );

  useEffect(() => {
    localStorage.setItem("theme", theme);
    document.querySelector("html").setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    const trimmedSearch = searchTerm.trim();

    if (!trimmedSearch) {
      setSearchResults([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        const response = await makeRequest.get(
          `/users/search?q=${encodeURIComponent(trimmedSearch)}`
        );
        setSearchResults(response.data);
      } catch (error) {
        console.error("User search failed:", error);
        setSearchResults([]);
      }
    }, 250);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await makeRequest.post("/auth/logout");
      localStorage.removeItem("user");
      return response.data;
    },
    onSuccess: () => {
      queryClient.clear();
      navigate("/login");
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => makeRequest.patch("/notifications/read-all"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const handleResultClick = () => {
    setSearchTerm("");
    setSearchResults([]);
  };

  return (
    <header className="uks-header">
      <div className="uks-header__left">
        <Link to="/" className="uks-brand" aria-label="Uks15 home">
          <span className="uks-brand__mark">U</span>
          <span className="uks-brand__name">Uks15</span>
        </Link>

        <div className="uks-search">
          <Search fontSize="small" />
          <input
            aria-label="Search people"
            type="text"
            placeholder="Search Uks15"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchResults.length > 0 && (
            <div className="uks-search__results">
              {searchResults.map((user) => (
                <Link
                  key={user.id}
                  to={`/profile/${user.id}`}
                  className="uks-search__result"
                  onClick={handleResultClick}
                >
                  <img
                    src={profileUrl(user.profilePic)}
                    alt={`${user.username} profile`}
                  />
                  <span>
                    <strong>{user.name || user.username}</strong>
                    <small>@{user.username}</small>
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <nav className="uks-header__tabs" aria-label="Primary navigation">
        <NavLink to="/" className="uks-tab" title="Home">
          <Home />
        </NavLink>
        <NavLink to="/friends" className="uks-tab" title="Connections">
          <PeopleAlt />
        </NavLink>
        <NavLink to="/videos" className="uks-tab" title="Clips">
          <VideoLibrary />
        </NavLink>
        <NavLink to="/marketplace" className="uks-tab" title="Uks15 Market">
          <Storefront />
        </NavLink>
        <NavLink to="/groups" className="uks-tab" title="Communities">
          <GridView />
        </NavLink>
      </nav>

      <div className="uks-header__right">
        <div className="dropdown dropdown-end">
          <button tabIndex={0} className="uks-icon-btn" title="Create">
            <Add />
          </button>
          <div tabIndex={0} className="dropdown-content uks-dropdown uks-create-menu">
            <strong>Create</strong>
            <Link to="/" className="uks-create-menu__item">
              <PostAdd />
              <span>
                <b>Feed post</b>
                <small>Share text or a photo</small>
              </span>
            </Link>
            <Link to="/" className="uks-create-menu__item">
              <AddPhotoAlternate />
              <span>
                <b>Story</b>
                <small>Add a short visual update</small>
              </span>
            </Link>
            <Link to="/videos" className="uks-create-menu__item">
              <VideoLibrary />
              <span>
                <b>Clip</b>
                <small>Upload a short video</small>
              </span>
            </Link>
            <Link to="/marketplace" className="uks-create-menu__item">
              <Storefront />
              <span>
                <b>Market listing</b>
                <small>Post an item</small>
              </span>
            </Link>
            <Link to="/events" className="uks-create-menu__item">
              <CalendarMonth />
              <span>
                <b>Event</b>
                <small>Plan something with your circle</small>
              </span>
            </Link>
          </div>
        </div>
        <Link className="uks-icon-btn" title="Messages" to="/messages">
          <MailOutline />
        </Link>

        <div className="dropdown dropdown-end">
          <button
            tabIndex={0}
            className="uks-icon-btn uks-icon-btn--relative"
            title="Updates"
          >
            <NotificationsNone />
            {unreadCount > 0 && <span className="uks-badge">{unreadCount}</span>}
          </button>
          <div
            tabIndex={0}
            className="dropdown-content uks-dropdown uks-updates"
          >
            <div className="uks-dropdown__header">
              <strong>Updates</strong>
              <Link to="/notifications">View all</Link>
            </div>
            {notifications.length > 0 && (
              <button
                className="uks-mark-read"
                onClick={() => markAllReadMutation.mutate()}
              >
                Mark all read
              </button>
            )}
            {notifications.length === 0 ? (
              <p className="uks-empty">No updates yet.</p>
            ) : (
              notifications.map((notification) => (
                <Link
                  key={notification.id}
                  to={getNotificationLink(notification)}
                  className={`uks-update ${
                    notification.isRead ? "" : "uks-update--unread"
                  }`}
                >
                  <img
                    src={profileUrl(notification.profilePic)}
                    alt=""
                  />
                  <span>{notification.message}</span>
                </Link>
              ))
            )}
          </div>
        </div>

        <button
          className="uks-icon-btn"
          title="Toggle theme"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          <DarkMode />
        </button>

        <div className="dropdown dropdown-end">
          <button tabIndex={0} className="uks-profile-btn">
            <img
              src={profileUrl(currentUser.profilePic)}
              alt={`${currentUser.username} profile`}
            />
          </button>
          <ul tabIndex={0} className="dropdown-content uks-dropdown menu">
            <li>
              <Link to={`/profile/${currentUser.id}`}>
                <AccountCircle /> Profile
              </Link>
            </li>
            <li>
              <Link to="/settings">
                <Settings /> Settings
              </Link>
            </li>
            <li>
              <button onClick={() => logoutMutation.mutate()}>
                <Logout /> Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
