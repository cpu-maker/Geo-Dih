const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const progressBar = document.getElementById("progressBar");

let distance = 0;
let gameSpeed = 6;
let shakeTime = 0;

class Player {
  constructor() {
    this.x = 200;
    this.y = 500;
    this.size = 40;

    this.velY = 0;
    this.gravity = 0.8;
    this.jumpForce = -16;

    this.coyoteTime = 0;
    this.jumpBuffer = 0;

    this.rotation = 0;
    this.trail = [];
  }

  update() {
    this.velY += this.gravity;
    this.y += this.velY;

    // Ground collision
    if (this.y + this.size >= 600) {
      this.y = 600 - this.size;
      this.velY = 0;
      this.coyoteTime = 10;
    } else {
      this.coyoteTime--;
    }

    if (this.jumpBuffer > 0) this.jumpBuffer--;

    if (this.jumpBuffer > 0 && this.coyoteTime > 0) {
      this.jump();
      this.jumpBuffer = 0;
    }

    this.rotation += 0.08;

    this.trail.push({ x: this.x, y: this.y });
    if (this.trail.length > 12) this.trail.shift();
  }

  jump() {
    this.velY = this.jumpForce;
    createParticles(this.x + this.size / 2, this.y + this.size);
  }

  draw() {
    // Shadow
    ctx.fillStyle = "rgba(0,0,0,0.4)";
    ctx.beginPath();
    ctx.ellipse(this.x + 20, 600, 28, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // Trail
    for (let t of this.trail) {
      ctx.fillStyle = "rgba(0,255,255,0.15)";
      ctx.fillRect(t.x, t.y, this.size, this.size);
    }

    ctx.save();
    ctx.translate(this.x + this.size / 2, this.y + this.size / 2);
    ctx.rotate(this.rotation);

    ctx.shadowColor = "cyan";
    ctx.shadowBlur = 25;

    let grad = ctx.createLinearGradient(
      -this.size / 2,
      -this.size / 2,
      this.size / 2,
      this.size / 2
    );
    grad.addColorStop(0, "#00ffff");
    grad.addColorStop(1, "#0055ff");

    ctx.fillStyle = grad;
    ctx.fillRect(
      -this.size / 2,
      -this.size / 2,
      this.size,
      this.size
    );

    ctx.shadowBlur = 0;
    ctx.restore();
  }
}

class Spike {
  constructor(x) {
    this.x = x;
    this.y = 560;
    this.width = 40;
    this.height = 40;
  }

  update() {
    this.x -= gameSpeed;
  }

  draw() {
    ctx.beginPath();
    ctx.moveTo(this.x, this.y + this.height);
    ctx.lineTo(this.x + this.width / 2, this.y);
    ctx.lineTo(this.x + this.width, this.y + this.height);
    ctx.closePath();

    ctx.shadowColor = "#ff3c3c";
    ctx.shadowBlur = 20;
    ctx.fillStyle = "#ff3c3c";
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}

class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = Math.random() * 4 + 2;
    this.velX = (Math.random() - 0.5) * 8;
    this.velY = (Math.random() - 0.5) * 8;
    this.life = 40;
  }

  update() {
    this.x += this.velX;
    this.y += this.velY;
    this.life--;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = "cyan";
    ctx.shadowColor = "cyan";
    ctx.shadowBlur = 15;
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}

let player = new Player();
let spikes = [];
let particles = [];

function createParticles(x, y) {
  for (let i = 0; i < 15; i++) {
    particles.push(new Particle(x, y));
  }
}

function spawnSpike() {
  spikes.push(new Spike(1300));
}

setInterval(spawnSpike, 1800);

function collision(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.size > b.x &&
    a.y < b.y + b.height &&
    a.y + a.size > b.y
  );
}

function drawBackground() {
  let gradient = ctx.createLinearGradient(0, 0, 0, 720);
  gradient.addColorStop(0, "#0f2027");
  gradient.addColorStop(0.5, "#203a43");
  gradient.addColorStop(1, "#2c5364");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1280, 720);

  drawMountains(distance * 0.2, 140, "rgba(0,0,0,0.3)");
  drawMountains(distance * 0.4, 90, "rgba(0,0,0,0.5)");

  let groundGrad = ctx.createLinearGradient(0, 600, 0, 720);
  groundGrad.addColorStop(0, "#1a1a1a");
  groundGrad.addColorStop(1, "#000");

  ctx.fillStyle = groundGrad;
  ctx.fillRect(0, 600, 1280, 120);
}

function drawMountains(offset, height, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, 600);

  for (let i = 0; i < 10; i++) {
    let x = i * 200 - (offset % 200);
    ctx.lineTo(x, 600 - height);
    ctx.lineTo(x + 100, 600);
  }

  ctx.lineTo(1280, 600);
  ctx.closePath();
  ctx.fill();
}

function update() {
  player.update();

  spikes.forEach(s => {
    s.update();
    if (collision(player, s)) {
      shakeTime = 12;
      resetGame();
    }
  });

  particles.forEach(p => p.update());
  particles = particles.filter(p => p.life > 0);

  distance += gameSpeed;
  progressBar.style.width = (distance / 5000 * 100) + "%";
}

function draw() {
  ctx.save();

  if (shakeTime > 0) {
    ctx.translate(
      Math.random() * 8 - 4,
      Math.random() * 8 - 4
    );
    shakeTime--;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawBackground();

  spikes.forEach(s => s.draw());
  particles.forEach(p => p.draw());
  player.draw();

  ctx.restore();
}

function resetGame() {
  player = new Player();
  spikes = [];
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
