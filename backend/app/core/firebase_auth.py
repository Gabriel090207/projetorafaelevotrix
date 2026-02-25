import firebase_admin
from firebase_admin import credentials, auth

# Evita inicializar duas vezes
if not firebase_admin._apps:
    cred = credentials.Certificate("firebase-key.json")
    firebase_admin.initialize_app(cred)


def verify_firebase_token(token: str):
    return auth.verify_id_token(token)