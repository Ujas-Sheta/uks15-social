export const getNotificationLink = (notification) => {
  if (notification.type === "follow" || notification.type === "follow_request") {
    return `/profile/${notification.senderId}`;
  }

  if (notification.type === "request_accepted") {
    return `/profile/${notification.senderId}`;
  }

  if (notification.type === "message") {
    return `/messages/${notification.senderId}`;
  }

  return "/";
};
