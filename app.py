from flask import Flask, render_template, request, jsonify
import random, json, os, time

app = Flask(__name__)

LEADERBOARD_FILE = "leaderboard.json"

# In-memory multiplayer rooms
rooms = {}

def load_leaderboard():
    if not os.path.exists(LEADERBOARD_FILE):
        return []
    with open(LEADERBOARD_FILE, "r") as f:
        return json.load(f)

def save_leaderboard(data):
    with open(LEADERBOARD_FILE, "w") as f:
        json.dump(data, f, indent=4)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/start", methods=["POST"])
def start():
    data = request.json
    mode = data["mode"]
    room = data.get("room")

    secret = random.randint(1, 100)

    if mode == "multi":
        rooms[room] = {
            "number": secret,
            "players": {}
        }

    return jsonify({"status": "started"})

@app.route("/guess", methods=["POST"])
def guess():
    data = request.json
    name = data["name"]
    guess = data["guess"]
    mode = data["mode"]
    room = data.get("room")

    secret = rooms[room]["number"] if mode == "multi" else data["secret"]

    diff = abs(secret - guess)

    if guess == secret:
        return jsonify({"result": "win"})
    elif diff <= 5:
        return jsonify({"result": "very close"})
    elif guess > secret:
        return jsonify({"result": "high"})
    else:
        return jsonify({"result": "low"})

@app.route("/submit", methods=["POST"])
def submit():
    data = request.json
    leaderboard = load_leaderboard()

    leaderboard.append({
        "name": data["name"],
        "attempts": data["attempts"],
        "time": data["time"]
    })

    leaderboard = sorted(leaderboard, key=lambda x: x["attempts"])[:10]
    save_leaderboard(leaderboard)

    return jsonify({"saved": True})

@app.route("/leaderboard")
def leaderboard():
    return jsonify(load_leaderboard())

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=10000)
