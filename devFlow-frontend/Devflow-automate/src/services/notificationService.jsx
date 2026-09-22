import api from "./api";

export const getNotifications = async () => {
  const response = await api.get("/notifications");
  return response.data;
};

export const getUnreadNotificationCount = async () => {
  const response = await api.get("/notifications/unread-count");
  return response.data;
};

export const markNotificationAsRead = async (notificationId) => {
  const response = await api.put(
    `/notifications/${notificationId}/read`
  );

  // Tell the Topbar to refresh the unread count immediately
  window.dispatchEvent(new Event("notifications-updated"));

  return response.data;
};