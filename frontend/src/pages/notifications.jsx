import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { makeRequest } from "../axios";
import { getNotificationLink } from "../utils/notificationLink";
import { profileUrl } from "../utils/upload";

const Notifications = () => {
  const queryClient = useQueryClient();

  const { data: notifications = [], isPending } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => makeRequest.get("/notifications").then((res) => res.data),
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => makeRequest.patch("/notifications/read-all"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  return (
    <section className="uks-card uks-notifications-page">
      <div className="uks-page-header">
        <div>
          <h1>Updates</h1>
          <p>Follow requests, reactions, comments, and account activity.</p>
        </div>
        <button
          className="uks-secondary-btn"
          onClick={() => markAllReadMutation.mutate()}
        >
          Mark all read
        </button>
      </div>

      {isPending ? (
        <p className="uks-muted">Loading updates...</p>
      ) : notifications.length === 0 ? (
        <div className="uks-instagram-empty">
          <h3>No updates yet</h3>
          <p>When someone follows, reacts, or comments, it will appear here.</p>
        </div>
      ) : (
        <div className="uks-notification-list">
          {notifications.map((notification) => (
            <Link
              key={notification.id}
              to={getNotificationLink(notification)}
              className={`uks-update ${
                notification.isRead ? "" : "uks-update--unread"
              }`}
            >
              <img src={profileUrl(notification.profilePic)} alt="" />
              <span>{notification.message}</span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
};

export default Notifications;
