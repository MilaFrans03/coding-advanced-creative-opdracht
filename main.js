// Laad het geluidseffect
const bubblePopSound = new Audio('bubble_pop.mp3');

// Speel het geluid af wanneer een bubbel wordt geklikt
bubblePopSound.play();

const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

const bubbles = [];
let score = 0;

// Particle object voor burst effect
class Particle {
  constructor(x, y, radius, gradient, speedX, speedY, life) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.gradient = gradient;
    this.speedX = speedX;
    this.speedY = speedY;
    this.life = life;
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    this.life -= 1;

    if (this.life <= 0 || this.x - this.radius < 0 || this.x + this.radius > canvas.width || 
        this.y - this.radius < 0 || this.y + this.radius > canvas.height) {
      return true;
    }
    return false;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    ctx.fillStyle = this.gradient;
    ctx.fill();
  }
}

// Bubble object
class Bubble {
  constructor(x, y, radius, gradient, speedX, speedY, isGlowy = false) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.gradient = gradient;
    this.isPopped = false;
    this.speedX = speedX;
    this.speedY = speedY;
    this.particles = [];
    this.isGlowy = isGlowy;
  }

  update() {
    if (this.isPopped) {
      this.particles.forEach((particle, index) => {
        if (particle.update()) {
          this.particles.splice(index, 1);
        }
      });
    } else {
      this.x += this.speedX;
      this.y -= this.speedY;

      // Laat de bubbel poppen als deze de bovenkant raakt
      if (this.y - this.radius < 0) {
        this.y = this.radius;
        this.pop(); // Pop de bubbel
      }

      // Controleer of de bubbel buiten het canvas gaat
      if (this.x - this.radius < 0) this.x = this.radius;
      if (this.x + this.radius > canvas.width) this.x = canvas.width - this.radius;
      if (this.y + this.radius > canvas.height) this.y = canvas.height - this.radius;
    }
  }

  draw() {
    if (this.isPopped) {
      this.particles.forEach(particle => particle.draw());
    } else {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
      ctx.fillStyle = this.gradient;
      ctx.fill();
      ctx.stroke();

      // Extra glowy effect voor glowy bubbels
      if (this.isGlowy) {
        ctx.shadowBlur = 20;
        ctx.shadowColor = "rgba(255, 255, 255, 0.8)";
      } else {
        ctx.shadowBlur = 0;
      }
    }
  }

  checkIfClicked(mouseX, mouseY) {
    const dist = Math.sqrt((mouseX - this.x) ** 2 + (mouseY - this.y) ** 2);
    if (dist < this.radius && !this.isPopped) {
      this.isPopped = true;
      this.createBurstEffect();
      bubblePopSound.play(); 
      
      // Verhoog de score, 3 punten voor glowy bubbels
      if (this.isGlowy) {
        score += 3;
      } else {
        score++; // 1 punt voor normale bubbels
      }
      
      return true;
    }
    return false;
  }

  pop() {
    this.isPopped = true;
    this.createBurstEffect();
    bubblePopSound.play(); // Geluid afspelen
  }

  createBurstEffect() {
    const numParticles = 20;
    for (let i = 0; i < numParticles; i++) {
      const speedX = (Math.random() - 0.5) * 5;
      const speedY = (Math.random() - 0.5) * 5;
      const radius = Math.random() * 5 + 1;
      const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, radius);
      gradient.addColorStop(0, `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 1)`);
      gradient.addColorStop(1, `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.2)`);
      this.particles.push(new Particle(this.x, this.y, radius, gradient, speedX, speedY, 30));
    }
  }
}

// Maak een willekeurige bubbel aan
function createRandomBubble() {
  const side = Math.floor(Math.random() * 4);
  const radius = Math.random() * 50 + 20;
  const speedY = Math.random() * 2 + 1;
  const speedX = (Math.random() - 0.5) * 2;

  let x, y;
  let isGlowy = Math.random() < 0.2;  // 20% kans op glowy bubbels

  if (side === 0) {
    x = Math.random() * canvas.width;
    y = canvas.height + radius;
  } else if (side === 1) {
    x = Math.random() * canvas.width;
    y = 0 - radius;
  } else if (side === 2) {
    x = 0 - radius;
    y = Math.random() * canvas.height;
  } else {
    x = canvas.width + radius;
    y = Math.random() * canvas.height;
  }

  const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
  gradient.addColorStop(0, `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 1)`);
  gradient.addColorStop(1, `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.4)`);

  // Maak een nieuwe bubbel (glowy of niet)
  const bubble = new Bubble(x, y, radius, gradient, speedX, speedY, isGlowy);
  bubbles.push(bubble);
}

// Teken de bubbels en score
function drawBubbles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  bubbles.forEach(bubble => {
    bubble.update();
    bubble.draw();
  });

  ctx.fillStyle = "#fff";
  ctx.font = "24px Arial";
  ctx.fillText("Score: " + score, 20, 30);
}

// Verwerk de muisklik
canvas.addEventListener('click', (event) => {
  const mouseX = event.offsetX;
  const mouseY = event.offsetY;

  let bubbleClicked = false;
  bubbles.forEach(bubble => {
    if (bubble.checkIfClicked(mouseX, mouseY)) {
      bubbleClicked = true;
    }
  });

  if (bubbleClicked) {
    drawBubbles();
  }
});

// Maak bubbels op regelmatige intervallen
setInterval(createRandomBubble, 1000);

// Verander achtergrondkleur met een gradient
let gradientStart = [
  { r: 15, g: 15, b: 15 },  // Donkerder grijs (bijna zwart)
  { r: 0, g: 255, b: 0 },   // Groene patch
  { r: 255, g: 0, b: 0 },   // Rode patch
  { r: 0, g: 0, b: 255 },   // Blauwe patch
];
let gradientProgress = 0; // Progress van de gradient overgang

function changeBackgroundColor() {
  gradientProgress += 0.002; // Verhoog langzaam voor de overgang

  if (gradientProgress >= 1) {
    gradientProgress = 0; // Reset voor een nieuwe cyclus
    gradientStart = [
      { r: 15, g: 15, b: 15 },
      { r: Math.random() * 255, g: Math.random() * 255, b: Math.random() * 255 },
      { r: Math.random() * 255, g: Math.random() * 255, b: Math.random() * 255 },
      { r: Math.random() * 255, g: Math.random() * 255, b: Math.random() * 255 }
    ];
  }

  const r1 = Math.floor(gradientStart[0].r + (gradientStart[1].r - gradientStart[0].r) * gradientProgress);
  const g1 = Math.floor(gradientStart[0].g + (gradientStart[1].g - gradientStart[0].g) * gradientProgress);
  const b1 = Math.floor(gradientStart[0].b + (gradientStart[1].b - gradientStart[0].b) * gradientProgress);
  
  const r2 = Math.floor(gradientStart[2].r + (gradientStart[3].r - gradientStart[2].r) * gradientProgress);
  const g2 = Math.floor(gradientStart[2].g + (gradientStart[3].g - gradientStart[2].g) * gradientProgress);
  const b2 = Math.floor(gradientStart[2].b + (gradientStart[3].b - gradientStart[2].b) * gradientProgress);

  const gradient = `linear-gradient(to bottom right, rgba(${r1}, ${g1}, ${b1}, 0.7), rgba(${r2}, ${g2}, ${b2}, 0.4))`;
  document.querySelector('.gradient-overlay').style.background = gradient;
}

// Hoofdlus voor het tekenen
function animate() {
  changeBackgroundColor();
  drawBubbles();
  requestAnimationFrame(animate);
}

animate();
