let secretNumber = 0;
let attempts = 0;
let playerName = "";
let gameMode = "single";
let roomCode = "";

// Sounds
const winSound = new Audio("static/sounds/win.wav");
const loseSound = new Audio("static/sounds/lose.wav");
const clickSound = new Audio("static/sounds/click.wav");

// DOM Elements
const startBtn = document.getElementById("startBtn");
const guessBtn = document.getElementById("guessBtn");
const guessInput = document.getElementById("guessInput");
const attemptsText = document.getElementById("attemptsText");
const hintText = document.getElementById("hintText");
const leaderboardList = document.getElementById("leaderboardList");

// Start Game
startBtn.addEventListener("click", async () => {
    clickSound.play();

    playerName = document.getElementById("playerName").value || "Player";
    gameMode = document.getElementById("modeSelect").value;
    roomCode = document.getElementById("roomCode").value;

    const response = await fetch("/start_game", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: playerName, mode: gameMode, room: roomCode })
    });

    const data = await response.json();
    secretNumber = data.secret;
    attempts = 0;

    document.getElementById("startScreen").style.display = "none";
    document.getElementById("gameScreen").style.display = "block";
    attemptsText.textContent = "Attempts: 0";
    hintText.textContent = "";
});

// Make Guess
guessBtn.addEventListener("click", async () => {
    clickSound.play();

    const guess = Number(guessInput.value);
    if (!guess || guess < 1 || guess > 100) {
        hintText.textContent = "⚠️ Enter a number between 1-100";
        return;
    }

    attempts++;

    const response = await fetch("/check_guess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guess: guess, secret: secretNumber, name: playerName, attempts: attempts })
    });

    const data = await response.json();
    hintText.textContent = data.hint;
    attemptsText.textContent = `Attempts: ${attempts}`;

    // Update leaderboard
    leaderboardList.innerHTML = "";
    data.leaderboard.forEach((entry, index) => {
        const li = document.createElement("li");
        li.textContent = `${index + 1}. ${entry.name} - ${entry.attempts} attempts`;
        leaderboardList.appendChild(li);
    });

    if (data.result === "win") {
        winSound.play();
        alert(`🎉 ${playerName}, you won in ${attempts} attempts!`);
        document.getElementById("gameScreen").style.display = "none";
        document.getElementById("startScreen").style.display = "block";
    } else {
        loseSound.play();
    }

    guessInput.value = "";
    guessInput.focus();
});
