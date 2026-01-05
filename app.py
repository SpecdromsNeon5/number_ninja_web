from flask import Flask, render_template, request, jsonify
import random
import json
import os

app = Flask(__name__)

LEADERBOARD_FILE = "leaderboard.json"

# Load leaderboard
if os.path.exists(LEADERBOARD_FILE):
    with open(LEADERBOARD_FILE, "r") as f:
        leaderboard = json.load(f)
else:
    leaderboard = []

rooms = {}

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/start_game", methods=["POST"])
def start_game():
    data = request.json
    player_name = data.get("name", "Player")
    mode = data.get("mode", "single")
    room_code = data.get("room", None)

    secret_number = random.randint(1, 100)

    if mode == "multi" and room_code:
        if room_code not in rooms:
            rooms[room_code] = {"secret": secret_number, "players": []}
        rooms[room_code]["players"].append(player_name)
        game_data = {"mode": "multi", "room": room_code, "secret": rooms[room_code]["secret"]}
    else:
        game_data = {"mode": "single", "secret": secret_number}

    return jsonify(game_data)

@app.route("/check_guess", methods=["POST"])
def check_guess():
    data = request.json
    guess = data.get("guess")
    secret = data.get("secret")
    player_name = data.get("name", "Player")
    attempts = data.get("attempts", 1)

    if guess == secret:
        result = "win"
        leaderboard.append({"name": player_name, "attempts": attempts})
        # Sort leaderboard: lowest attempts first
        leaderboard.sort(key=lambda x: x["attempts"])
        with open(LEADERBOARD_FILE, "w") as f:
            json.dump(leaderboard, f)
        hint = "Correct! You won!"
    elif guess < secret:
        result = "continue"
        hint = "Too low!"
    else:
        result = "continue"
        hint = "Too high!"

    return jsonify({"result": result, "hint": hint, "leaderboard": leaderboard})

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    app.run(host="0.0.0.0", port=port)
