import os
import json
import firebase_admin
from firebase_admin import credentials, firestore

firebase_json = os.getenv("FIREBASE_CREDENTIALS")

if firebase_json:
    cred_dict = json.loads(firebase_json)
    cred = credentials.Certificate(cred_dict)
    firebase_admin.initialize_app(cred)
else:
    # fallback para ambiente local
    cred = credentials.Certificate("firebase_key.json")
    firebase_admin.initialize_app(cred)

db = firestore.client()