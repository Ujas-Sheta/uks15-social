import {
  Bookmark,
  CalendarMonth,
  Groups,
  Home,
  PeopleAlt,
  Settings,
  Storefront,
  VideoLibrary,
} from "@mui/icons-material";
import { useContext } from "react";
import { Link, NavLink } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { profileUrl } from "../utils/upload";

const Leftbar = () => {
  const { currentUser } = useContext(AuthContext);

  const navItems = [
    { label: "Home Feed", icon: <Home />, to: "/" },
    { label: "Connections", icon: <PeopleAlt />, to: "/friends" },
    { label: "Communities", icon: <Groups />, to: "/groups" },
    { label: "Uks15 Market", icon: <Storefront />, to: "/marketplace" },
    { label: "Clips", icon: <VideoLibrary />, to: "/videos" },
    { label: "Events", icon: <CalendarMonth />, to: "/events" },
    { label: "Saved", icon: <Bookmark />, to: "/saved" },
    { label: "Settings", icon: <Settings />, to: "/settings" },
  ];

  return (
    <aside className="uks-sidebar uks-left-sidebar">
      <Link to={`/profile/${currentUser.id}`} className="uks-user-chip">
        <img
          src={profileUrl(currentUser.profilePic)}
          alt={`${currentUser.username} profile`}
        />
        <span>
          <strong>{currentUser.name || currentUser.username}</strong>
          <small>@{currentUser.username}</small>
        </span>
      </Link>

      <nav className="uks-side-nav">
        {navItems.map((item) => (
          <NavLink key={item.label} to={item.to} className="uks-side-link">
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Leftbar;
