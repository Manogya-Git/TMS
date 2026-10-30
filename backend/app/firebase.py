import firebase_admin
from firebase_admin import credentials, messaging
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
cred_path = os.path.join(BASE_DIR, "firebase-credentials.json")

cred = credentials.Certificate(cred_path)
firebase_admin.initialize_app(cred)

def send_push_notification(token, title, body, data=None):
    message = messaging.Message(
        notification=messaging.Notification(
            title=title,
            body=body,
        ),
        data=data or {},
        token=token,
    )
    try:
        response = messaging.send(message)
        return response
    except Exception as e:
        print(f"Failed to send push notification: {e}")
        return None