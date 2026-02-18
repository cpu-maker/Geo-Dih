const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const progressBar = document.getElementById("progressBar");

let shakeTime = 0;

class Player {
  constructor() {
    this.x = 200;
    this.y = 500;
    this.size = 40;

    this.velY = 0;
    this.gravity = 0.7;
    this.jumpPower = -15;

    this.onGround = false;
    this.coyoteTime = 0;
    this.jumpBuffer = 0;

    this.trail = [];
  }

  update() {
    this.velY += this.gravity;
    this.y += this.velY;

    if (this.y + this.size >= 600) {
      this.y = 600 - this.size;
      this.velY = 0;
      this.onGround = true;
      this.coyoteTime = 10;
    } else {
      this.onGround = false;
      this.coyoteTime--;
    }

    if (this.jumpBuffer > 0) this.jumpBuffer--;

    if (this.jumpBuffer > 0 && this.coyoteTime > 0) {
      this.jump();
      this.jumpBuffer = 0;
    }

    this.trail.push({ x: this.x, y: this.y });
    if (this.trail.length > 10) this.trail.shift();
  }

  jump() {
    this.velY = this.jumpPower;
    this.onGround = false;
    createParticles(this.x + 20, this.y + 40);
  }

  draw() {
    for (let t of this.trail) {
      ctx.fillStyle = "rgba(0,255,255,0.2)";
      ctx.fillRect(t.x, t.y, this.size, this.size);
    }

    ctx.fillStyle = "cyan";
    ctx.fillRect(this.x, this.y, this.size, this.size);
  }
}

class Obstacle {
  constructor(x) {
    this.x = x;
    this.y = 560;
    this.width = 40;
    this.height = 40;
  }

  update(speed) {
    this.x -= speed;
  }

  draw() {
    ctx.fillStyle = "red";
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}

class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.velX = (Math.random() - 0.5) * 6;
    this.velY = (Math.random() - 0.5) * 6;
    this.life = 30;
  }

  update() {
    this.x += this.velX;
    this.y += this.velY;
    this.life--;
  }

  draw() {
    ctx.fillStyle = "white";
    ctx.fillRect(this.x, this.y, 4, 4);
  }
}

let player = new Player();
let obstacles = [];
let particles = [];
let gameSpeed = 6;
let distance = 0;

function createParticles(x, y) {
  for (let i = 0; i < 10; i++) {
    particles.push(new Particle(x, y));
  }
}

function spawnObstacle() {
  obstacles.push(new Obstacle(1300));
}

setInterval(spawnObstacle, 2000);

function collision(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.size > b.x &&
    a.y < b.y + b.height &&
    a.y + a.size > b.y
  );
}

function update() {
  player.update();

  for (let o of obstacles) {
    o.update(gameSpeed);
    if (collision(player, o)) {
      shakeTime = 10;
      resetGame();
    }
  }

  for (let p of particles) p.update();
  particles = particles.filter(p => p.life > 0);

  distance += gameSpeed;
  progressBar.style.width = (distance / 5000 * 100) + "%";
}

function draw() {
  ctx.save();

  if (shakeTime > 0) {
    ctx.translate(
      Math.random() * 10 - 5,
      Math.random() * 10 - 5
    );
    shakeTime--;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#222";
  ctx.fillRect(0, 600, 1280, 120);

  player.draw();
  obstacles.forEach(o => o.draw());
  particles.forEach(p => p.draw());

  ctx.restore();
}

function resetGame() {
  player = new Player();
  obstacles = [];
  distance = 0;
}

document.addEventListener("keydown", e => {
  if (e.code === "Space") {
    player.jumpBuffer = 10;
  }
});

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();
