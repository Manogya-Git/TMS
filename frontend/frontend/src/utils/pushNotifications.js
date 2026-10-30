import { getMessaging, getToken, onMessage } from "firebase/messaging";
import api from "../api/axios";
import { messaging } from "../firebase";

const VAPID_KEY =
  "BFLBjCGxJHo_DLPBrRgOkocBCNTsaRdyzBjVccluz7oaCiVhXVjaQHsJpt8P1oCbMtG8KjO2agVE-YJlJsrJZL0";

export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
      console.log("Notification permission not granted");
      return;
    }

    const token = await getToken(messaging, { vapidKey: VAPID_KEY });

    if (!token) {
      console.log("No registration token available");
      return;
    }

    console.log("Device token:", token);

    // Send token to backend
    await api.post("/notifications/register-device/", { token });
  } catch (err) {
    console.error("Error getting notification permission or token:", err);
  }
};

export const listenForForegroundMessages = () => {
  onMessage(messaging, (payload) => {
    console.log("Foreground message received:", payload);

    new Notification(payload.notification.title, {
      body: payload.notification.body,
    });
  });
};
