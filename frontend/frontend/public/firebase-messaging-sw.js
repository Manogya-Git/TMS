importScripts("https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyA_NB1erHnYVbouM0aZggDmwA1IhVNne4M",
  authDomain: "test-project-2df42.firebaseapp.com",
  projectId: "test-project-2df42",
  storageBucket: "test-project-2df42.firebasestorage.app",
  messagingSenderId: "989014393122",
  appId: "1:989014393122:web:d00605dad0bae54416a57b",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("Background message received:", payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/icon.png", // optional, swap for your app's icon if you have one
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});