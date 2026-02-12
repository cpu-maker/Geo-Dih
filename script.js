const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const GRAVITY = 0.6;
const JUMP_FORCE = -12;
const GROUND_Y = 450;
const SPEED = 6;

let gameRunning = true;
let distance = 0;
let levelLength = 5000;

const player = {
    x: 150,
    y: GROUND_Y,
    size: 40,
    velocityY: 0,
    grounded: true
};

const obstacles = [
    { x: 600, width: 40, height: 40 },
    { x: 900, width: 40, height: 60 },
    { x: 1200, width: 40, height: 40 },
    { x: 1500, width: 40, height: 80 },
    { x: 2000, width: 40, height: 40 },
    { x: 2300, width: 40, height: 60 },
    { x: 2600, width: 40, height: 40 },
    { x: 3000, width: 40, height: 100 },
    { x: 3400, width: 40, height: 40 },
    { x: 4000, width: 40, height: 60 }
];

document.addEventListener("keydown", (e) => {
    if (e.code === "Space" && player.grounded && gameRunning) {
        player.velocityY = JUMP_FORCE;
        player.grounded = false;
    }

    if (e.code === "KeyR") {
        restartGame();
    }
});

function update() {
    if (!gameRunning) return;

    distance += SPEED;

    // Gravity
    player.velocityY += GRAVITY;
    player.y += player.velocityY;

    if (player.y >= GROUND_Y) {
        player.y = GROUND_Y;
        player.velocityY = 0;
        player.grounded = true;
    }

    checkCollisions();
    updateProgress();
}

function checkCollisions() {
    for (let obstacle of obstacles) {
        let obstacleX = obstacle.x - distance;

        if (
            player.x < obstacleX + obstacle.width &&
            player.x + player.size > obstacleX &&
            player.y < GROUND_Y + obstacle.height &&
            player.y + player.size > GROUND_Y
        ) {
            gameOver();
        }
    }
}

function updateProgress() {
    let percent = Math.min(100, Math.floor((distance / levelLength) * 100));
    document.getElementById("progress").innerText = percent + "%";

    if (percent >= 100) {
        gameRunning = false;
        alert("Level Complete!");
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Ground
    ctx.fillStyle = "#00ffcc";
    ctx.fillRect(0, GROUND_Y + player.size, canvas.width, 100);

    // Player
    ctx.fillStyle = "#ff00ff";
    ctx.fillRect(player.x, player.y, player.size, player.size);

    // Obstacles
    ctx.fillStyle = "#ff4444";
    for (let obstacle of obstacles) {
        let obstacleX = obstacle.x - distance;
        ctx.fillRect(
            obstacleX,
            GROUND_Y + player.size - obstacle.height,
            obstacle.width,
            obstacle.height
        );
    }

    if (!gameRunning) {
        ctx.fillStyle = "white";
        ctx.font = "40px Arial";
        ctx.fillText("Game Over - Press R to Restart", 200, 250);
    }
}

function gameOver() {
    gameRunning = false;
}

function restartGame() {
    distance = 0;
    player.y = GROUND_Y;
    player.velocityY = 0;
    gameRunning = true;
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();
