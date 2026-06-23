import {
  AutoAwesome,
  Bolt,
  Forum,
  GraphicEq,
  PeopleAlt,
  VideoLibrary,
} from "@mui/icons-material";
import { useContext } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AuthContext } from "../context/AuthContext";
import { makeRequest } from "../axios";

const HomePulse = () => {
  const { currentUser } = useContext(AuthContext);

  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => makeRequest.get("/notifications").then((res) => res.data),
  });

  const { data: contacts = [] } = useQuery({
    queryKey: ["following-contacts"],
    queryFn: () => makeRequest.get("/relationships/following").then((res) => res.data),
  });

  const unread = notifications.filter((notification) => !notification.isRead).length;

  return (
    <section className="uks-pulse">
      <div className="uks-pulse__copy">
        <span className="uks-kicker">
          <GraphicEq fontSize="small" />
          Live social pulse
        </span>
        <h1>{currentUser.name || currentUser.username}</h1>
        <p>Your circle is moving. Catch the best updates before they disappear.</p>
        <div className="uks-pulse__actions">
          <Link to="/videos" className="uks-primary-btn">
            <VideoLibrary fontSize="small" />
            Open clips
          </Link>
          <Link to="/friends" className="uks-secondary-btn">
            <PeopleAlt fontSize="small" />
            Connections
          </Link>
        </div>
      </div>

      <div className="uks-pulse__metrics">
        <Link to="/notifications" className="uks-metric-card">
          <span>
            <Bolt />
          </span>
          <strong>{unread}</strong>
          <small>Unread updates</small>
        </Link>
        <Link to="/messages" className="uks-metric-card">
          <span>
            <Forum />
          </span>
          <strong>{contacts.length}</strong>
          <small>Active contacts</small>
        </Link>
        <Link to="/groups" className="uks-metric-card uks-metric-card--wide">
          <span>
            <AutoAwesome />
          </span>
          <strong>Uks15</strong>
          <small>Community layer</small>
        </Link>
      </div>
    </section>
  );
};

export default HomePulse;
