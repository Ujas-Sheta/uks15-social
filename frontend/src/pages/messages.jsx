import { useContext, useState } from "react";
import { Lock, PersonAdd } from "@mui/icons-material";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { makeRequest } from "../axios";
import { AuthContext } from "../context/AuthContext";
import { profileUrl } from "../utils/upload";

const Messages = () => {
  const { userId } = useParams();
  const [body, setBody] = useState("");
  const { currentUser } = useContext(AuthContext);
  const queryClient = useQueryClient();

  const { data: contacts = [], isPending: contactsPending } = useQuery({
    queryKey: ["following-contacts"],
    queryFn: () => makeRequest.get("/relationships/following").then((res) => res.data),
  });

  const activeContact = contacts.find((contact) => String(contact.id) === String(userId));
  const isLockedConversation = Boolean(userId) && !contactsPending && !activeContact;

  const { data: targetUser } = useQuery({
    queryKey: ["message-target", userId],
    enabled: isLockedConversation,
    queryFn: () => makeRequest.get(`/users/find/${userId}`).then((res) => res.data),
  });

  const { data: messages = [], error } = useQuery({
    queryKey: ["messages", userId],
    enabled: Boolean(userId) && !contactsPending && !isLockedConversation,
    queryFn: () => makeRequest.get(`/messages/${userId}`).then((res) => res.data),
  });

  const sendMutation = useMutation({
    mutationFn: () => makeRequest.post(`/messages/${userId}`, { body }),
    onSuccess: () => {
      setBody("");
      queryClient.invalidateQueries({ queryKey: ["messages", userId] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!body.trim() || !userId) return;
    sendMutation.mutate();
  };

  return (
    <div className="uks-messages-page uks-card">
      <aside className="uks-message-contacts">
        <h2>Messages</h2>
        {contacts.length === 0 ? (
          <p className="uks-muted">Follow someone first to start a message.</p>
        ) : (
          contacts.map((contact) => (
            <Link
              key={contact.id}
              className={`uks-person-row ${String(contact.id) === String(userId) ? "is-active" : ""}`}
              to={`/messages/${contact.id}`}
            >
              <img src={profileUrl(contact.profilePic)} alt="" />
              <span>
                <strong>{contact.name || contact.username}</strong>
                <small>@{contact.username}</small>
              </span>
            </Link>
          ))
        )}
      </aside>

      <section className="uks-chat-panel">
        {!userId ? (
          <div className="uks-instagram-empty">
            <h3>Select a contact</h3>
            <p>Messages are available with your accepted/followed connections.</p>
          </div>
        ) : isLockedConversation ? (
          <div className="uks-message-lock">
            <span>
              <Lock />
            </span>
            <h3>You must be friends first</h3>
            <p>
              Messages open after you and {targetUser?.name || targetUser?.username || "this person"} are connected.
              Send or accept a follow request from their profile first.
            </p>
            <Link className="uks-primary-btn" to={`/profile/${userId}`}>
              <PersonAdd fontSize="small" />
              View profile
            </Link>
          </div>
        ) : error ? (
          <div className="uks-instagram-empty">
            <h3>Messaging locked</h3>
            <p>You must be friends first before sending messages.</p>
          </div>
        ) : (
          <>
            <header>
              <strong>{activeContact?.name || "Conversation"}</strong>
            </header>
            <div className="uks-message-list">
              {messages.length === 0 ? (
                <p className="uks-muted">No messages yet. Start the chat.</p>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`uks-message-bubble ${
                      message.senderId === currentUser.id ? "is-own" : ""
                    }`}
                  >
                    {message.body}
                  </div>
                ))
              )}
            </div>
            <form className="uks-message-form" onSubmit={handleSubmit}>
              <input
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write a message"
              />
              <button className="uks-primary-btn" type="submit">
                Send
              </button>
            </form>
          </>
        )}
      </section>
    </div>
  );
};

export default Messages;
