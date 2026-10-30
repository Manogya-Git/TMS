import React, { Children, createContext, useCallback, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import api from "../api/axios";

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState(null);

  const fetchNotifications = useCallback(() => {
    if (!user) return;
    api
      .get("/notifications/")
      .then((res) => setNotifications(res.data))
      .catch(() => setError("Could not load notifications"));
  }, [user]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = (notificationId) => {
    api
      .patch(`/notifications/${notificationId}/`, { is_read: true })
      .then((res) => {
        setNotifications((prev) =>
          prev.map((n) => (n.id === notificationId ? res.data : n)),
        );
      })
      .catch(() => setError("Could not update notification"));
  };

  const removeTicketNotifications = (ticketId) => {
    setNotifications((prev) => prev.filter((n) => n.ticket !== ticketId));
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        error,
        fetchNotifications,
        markAsRead,
        removeTicketNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider",
    );
  }
  return context;
};

export default NotificationContext;
