from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os
import json
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

app = Flask(__name__)
CORS(app)

# ===============================
# GROQ CONFIG
# ===============================
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"

chats = {}

def get_groq_response(user_message):
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": "llama-3.1-8b-instant",
        "messages": [
            {"role": "system", "content": "You are a friendly AI assistant."},
            {"role": "user", "content": user_message}
        ],
        "temperature": 0.7,
        "max_tokens": 256
    }

    response = requests.post(
        GROQ_API_URL,
        headers=headers,
        data=json.dumps(payload),
        timeout=20
    )

    if response.status_code == 200:
        return response.json()["choices"][0]["message"]["content"]
    else:
        return "⚠️ AI service temporarily unavailable."

# ===============================
# ROUTES
# ===============================
@app.route("/")
def home():
    return jsonify({
        "status": "running",
        "ai_provider": "Groq",
        "model": "llama-3.1-8b-instant"
    })

@app.route("/api/chat", methods=["POST"])
def chat():
    data = request.json
    user_message = data.get("message", "").strip()
    session_id = data.get("session_id", "default")

    if not user_message:
        return jsonify({"response": "Please enter a message."})

    if session_id not in chats:
        chats[session_id] = []

    chats[session_id].append({
        "role": "user",
        "content": user_message,
        "time": datetime.now().isoformat()
    })

    ai_response = get_groq_response(user_message)

    chats[session_id].append({
        "role": "assistant",
        "content": ai_response,
        "time": datetime.now().isoformat()
    })

    return jsonify({
        "response": ai_response,
        "session_id": session_id,
        "status": "success"
    })

@app.route("/api/history/<session_id>")
def history(session_id):
    return jsonify(chats.get(session_id, []))

# ===============================
# RUN SERVER
# ===============================
if __name__ == "__main__":
    print("\n" + "=" * 50)
    print("🚀 GROQ CHATBOT BACKEND RUNNING")
    print("=" * 50)
    print("🌐 http://localhost:5000")
    print("=" * 50 + "\n")

    app.run(debug=True, host="0.0.0.0", port=5000)
