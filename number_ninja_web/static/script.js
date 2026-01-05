let attempts = 0;
let startTime = 0;
let secret = Math.floor(Math.random()*100)+1;

function startGame() {
    document.getElementById("clickSound").play();
    attempts = 0;
    startTime = Date.now();

    fetch("/start", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({
            mode: mode.value,
            room: room.value
        })
    });

    login.classList.add("hidden");
    game.classList.remove("hidden");
}

function makeGuess() {
    const g = Number(guess.value);
    attempts++;
    attemptsText.innerText = "Attempts: " + attempts;

    fetch("/guess", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({
            name: name.value,
            guess: g,
            mode: mode.value,
            room: room.value,
            secret: secret
        })
    })
    .then(res=>res.json())
    .then(data=>{
        if(data.result==="win"){
            win();
        }else if(data.result==="very close"){
            hint.innerText="🔥 Very Close!";
        }else if(data.result==="high"){
            hint.innerText="📉 Too High";
        }else{
            hint.innerText="📈 Too Low";
        }
    });
}

function win(){
    document.getElementById("winSound").play();
    const time = Math.floor((Date.now()-startTime)/1000);

    fetch("/submit",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
            name:name.value,
            attempts:attempts,
            time:time
        })
    });

    game.classList.add("hidden");
    winDiv.classList.remove("hidden");
}
