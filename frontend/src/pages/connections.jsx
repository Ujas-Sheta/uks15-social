import {
  ArrowForward,
  Check,
  Close,
  GroupAdd,
  MarkunreadMailbox,
  Message,
  PeopleAlt,
  PersonSearch,
} from "@mui/icons-material";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { makeRequest } from "../axios";
import { useToast } from "../context/useToast";

const imageUrl = (file) =>
  file
    ? `/uploads/posts/${file}`
    : "/default/default_profile.png";

const Connections = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const { data: requests = [] } = useQuery({
    queryKey: ["connection-requests"],
    queryFn: () => makeRequest.get("/relationships/requests").then((res) => res.data),
  });

  const { data: following = [] } = useQuery({
    queryKey: ["following-contacts"],
    queryFn: () => makeRequest.get("/relationships/following").then((res) => res.data),
  });

  const { data: suggestions = [] } = useQuery({
    queryKey: ["connection-suggestions"],
    queryFn: () => makeRequest.get("/users/search?q=e").then((res) => res.data),
  });

  const acceptMutation = useMutation({
    mutationFn: (id) => makeRequest.post(`/relationships/requests/${id}/accept`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["connection-requests"] });
      queryClient.invalidateQueries({ queryKey: ["following-contacts"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      showToast("Request accepted. You are connected now.");
    },
    onError: (error) => {
      const message =
        error.response?.data?.sqlMessage ||
        error.response?.data ||
        "Could not accept that request. Please try again.";
      showToast(message, "error");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (id) => makeRequest.post(`/relationships/requests/${id}/reject`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["connection-requests"] });
      showToast("Request removed.");
    },
    onError: (error) => {
      const message =
        error.response?.data?.sqlMessage ||
        error.response?.data ||
        "Could not remove that request. Please try again.";
      showToast(message, "error");
    },
  });

  const knownIds = new Set(following.map((person) => person.id));
  const discoverPeople = suggestions.filter((person) => !knownIds.has(person.id)).slice(0, 6);

  return (
    <div className="uks-connections-page">
      <section className="uks-connections-hero">
        <div>
          <span className="uks-kicker">
            <PeopleAlt fontSize="small" />
            Connections
          </span>
          <h1>Your social circle</h1>
          <p>Accept private requests, open messages, and discover people worth following.</p>
        </div>
        <div className="uks-connection-stats">
          <div>
            <PeopleAlt />
            <strong>{following.length}</strong>
            <span>Contacts</span>
          </div>
          <div>
            <MarkunreadMailbox />
            <strong>{requests.length}</strong>
            <span>Requests</span>
          </div>
          <div>
            <PersonSearch />
            <strong>{discoverPeople.length}</strong>
            <span>Suggestions</span>
          </div>
        </div>
      </section>

      <section className="uks-card uks-tab-panel">
        <div className="uks-section-title">
          <div>
            <h2>Follow requests</h2>
            <p>Private-account requests need your approval before they can see protected content.</p>
          </div>
        </div>
        {requests.length === 0 ? (
          <div className="uks-instagram-empty">
            <h3>No pending requests</h3>
            <p>When someone asks to follow your private profile, it will appear here.</p>
          </div>
        ) : (
          <div className="uks-connection-grid">
            {requests.map((request) => (
              <article key={request.id} className="uks-connection-card uks-request-card">
                <img src={imageUrl(request.profilePic)} alt="" />
                <strong>{request.name || request.username}</strong>
                <span>@{request.username}</span>
                <div className="uks-card-actions">
                  <button
                    className="uks-primary-btn"
                    onClick={() => acceptMutation.mutate(request.id)}
                    disabled={acceptMutation.isPending}
                  >
                    <Check fontSize="small" />
                    Accept
                  </button>
                  <button
                    className="uks-secondary-btn"
                    onClick={() => rejectMutation.mutate(request.id)}
                    disabled={rejectMutation.isPending}
                  >
                    <Close fontSize="small" />
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="uks-card uks-tab-panel">
        <div className="uks-section-title">
          <div>
            <h2>Your contacts</h2>
            <p>Messages unlock when a request is accepted or a relationship exists.</p>
          </div>
          <Link to="/messages" className="uks-secondary-btn">
            <Message fontSize="small" />
            Inbox
          </Link>
        </div>
        {following.length === 0 ? (
          <div className="uks-instagram-empty">
            <h3>No contacts yet</h3>
            <p>Follow people or accept requests to build your message list.</p>
          </div>
        ) : (
          <div className="uks-connection-grid">
            {following.map((person) => (
              <article key={person.id} className="uks-connection-card">
                <img src={imageUrl(person.profilePic)} alt="" />
                <strong>{person.name || person.username}</strong>
                <span>@{person.username}</span>
                <div className="uks-card-actions">
                  <Link className="uks-primary-btn" to={`/messages/${person.id}`}>
                    <Message fontSize="small" />
                    Message
                  </Link>
                  <Link className="uks-secondary-btn" to={`/profile/${person.id}`}>
                    View
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="uks-card uks-tab-panel">
        <div className="uks-section-title uks-discovery-title">
          <div>
            <h2>Discover people</h2>
            <p>Open a profile first. Private users receive a request instead of an instant follow.</p>
          </div>
        </div>
        <div className="uks-discovery-grid">
          {discoverPeople.map((person) => (
            <Link key={person.id} to={`/profile/${person.id}`} className="uks-discovery-card">
              <span className="uks-discovery-avatar">
                <img src={imageUrl(person.profilePic)} alt="" />
              </span>
              <span className="uks-discovery-copy">
                <strong>{person.name || person.username}</strong>
                <small>@{person.username}</small>
                <em>{person.isPrivate ? "Private profile" : "Public profile"}</em>
              </span>
              <span className="uks-discovery-action">
                <GroupAdd />
                <ArrowForward fontSize="small" />
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Connections;
