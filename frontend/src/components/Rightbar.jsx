import {
  ArrowForward,
  AutoAwesome,
  Bolt,
  Groups,
  Message,
  RadioButtonChecked,
  Storefront,
  TrendingUp,
} from "@mui/icons-material";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { makeRequest } from "../axios";

const imageUrl = (file) =>
  file
    ? `/uploads/posts/${file}`
    : "/default/default_profile.png";

const Rightbar = () => {
  const { data: people = [] } = useQuery({
    queryKey: ["user-suggestions"],
    queryFn: () => makeRequest.get("/users/search?q=e").then((res) => res.data),
  });

  const { data: contacts = [] } = useQuery({
    queryKey: ["following-contacts"],
    queryFn: () => makeRequest.get("/relationships/following").then((res) => res.data),
  });

  return (
    <aside className="uks-sidebar uks-right-sidebar">
      <section className="uks-panel uks-orbit-panel">
        <div className="uks-rail-heading">
          <span>
            <AutoAwesome fontSize="small" />
            Discover
          </span>
          <Link to="/friends">
            View all
            <ArrowForward fontSize="small" />
          </Link>
        </div>
        <div className="uks-suggestion-stack">
          {people.slice(0, 3).map((person, index) => (
            <Link
              key={person.id}
              to={`/profile/${person.id}`}
              className="uks-suggestion-card"
              style={{ "--delay": `${index * 70}ms` }}
            >
              <img src={imageUrl(person.profilePic)} alt={`${person.username} profile`} />
              <span>
                <strong>{person.name || person.username}</strong>
                <small>@{person.username}</small>
              </span>
              <ArrowForward fontSize="small" />
            </Link>
          ))}
        </div>
      </section>

      <section className="uks-panel uks-community-panel">
        <div className="uks-rail-heading uks-rail-heading--warm">
          <span>
            <TrendingUp fontSize="small" />
            Communities
          </span>
          <Link to="/groups">
            Open
            <ArrowForward fontSize="small" />
          </Link>
        </div>
        <Link to="/groups" className="uks-mini-card uks-mini-card--feature">
          <span>
            <Groups />
          </span>
          <strong>Frontend Builders</strong>
          <p>React, UI, portfolio work, and product polish.</p>
        </Link>
        <Link to="/marketplace" className="uks-mini-card uks-mini-card--feature">
          <span>
            <Storefront />
          </span>
          <strong>Uks15 Market</strong>
          <p>Local listings, creator tools, and useful finds.</p>
        </Link>
      </section>

      <section className="uks-panel uks-online-panel">
        <div className="uks-rail-heading uks-rail-heading--live">
          <span>
            <RadioButtonChecked fontSize="small" />
            Online contacts
          </span>
          <Link to="/messages">
            Inbox
            <ArrowForward fontSize="small" />
          </Link>
        </div>
        {contacts.length === 0 ? (
          <div className="uks-sidebar-empty">
            <Message />
            <strong>No contacts yet</strong>
            <p>Accept requests or follow people to start messages.</p>
          </div>
        ) : (
          contacts.slice(0, 3).map((person) => (
            <Link
              key={`online-${person.id}`}
              to={`/messages/${person.id}`}
              className="uks-contact-row uks-contact-row--rich"
            >
              <span className="uks-online-avatar">
                <img src={imageUrl(person.profilePic)} alt="" />
              </span>
              <span>
                <strong>{person.name || person.username}</strong>
                <small>
                  <Bolt fontSize="inherit" />
                  Available now
                </small>
              </span>
              <Message fontSize="small" />
            </Link>
          ))
        )}
      </section>
    </aside>
  );
};

export default Rightbar;
