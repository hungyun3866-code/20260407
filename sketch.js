let level = 1;
let gameState = "PLAY";
let gameStarted = false;
let boundaries = [];
let playerSize = 12;

function setup() {
  createCanvas(windowWidth, windowHeight);
  setupLevel(level);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  setupLevel(level);
}

function draw() {
  background(5, 5, 15);

  if (gameState === "PLAY") {
    drawZones();
    drawElectricBoundaries();
    checkCollision();
    drawPlayer();
  } else if (gameState === "FAIL") {
    showScreen("系統過載！\n點擊滑鼠重新挑戰", color(255, 50, 50));
  } else if (gameState === "WIN") {
    showScreen("全破成功！", color(50, 255, 50));
  }
}

function setupLevel(lvl) {
  boundaries = [];
  gameStarted = false;
  let uw = width / 10;
  let uh = height / 10;

  if (lvl === 1) {
    startZone = { x: 50, y: height/2-50, w: 80, h: 100 };
    endZone = { x: width-130, y: height/2-50, w: 80, h: 100 };
    addBoundary(0, height/2-60, width, height/2-60);
    addBoundary(0, height/2+60, width, height/2+60);
  } else if (lvl === 2) {
    startZone = { x: 50, y: 50, w: 80, h: 80 };
    endZone = { x: width-130, y: height-130, w: 80, h: 80 };
    // 閃電型路徑
    addBoundary(0, 150, width-150, 150);
    addBoundary(width-150, 150, width-150, height-200);
    addBoundary(width-150, height-200, 0, height-200);
    // 內縮邊界
    addBoundary(150, 0, 150, height-350);
    addBoundary(150, height-350, width, height-350);
  }
}

function addBoundary(x1, y1, x2, y2) {
  boundaries.push({ p1: createVector(x1, y1), p2: createVector(x2, y2) });
}

function drawElectricBoundaries() {
  drawingContext.shadowBlur = 15;
  drawingContext.shadowColor = color(0, 150, 255);
  for (let b of boundaries) {
    stroke(150, 230, 255, 180);
    strokeWeight(3);
    drawJitteryLine(b.p1, b.p2, 3);
    stroke(255, 255, 255, 255);
    strokeWeight(1);
    drawJitteryLine(b.p1, b.p2, 5);
  }
  drawingContext.shadowBlur = 0;
}

function drawJitteryLine(v1, v2, j) {
  let d = dist(v1.x, v1.y, v2.x, v2.y);
  beginShape();
  for (let i = 0; i <= d; i += 10) {
    let t = i / d;
    let x = lerp(v1.x, v2.x, t) + random(-j, j);
    let y = lerp(v1.y, v2.y, t) + random(-j, j);
    vertex(x, y);
  }
  vertex(v2.x, v2.y);
  endShape();
}

function drawZones() {
  noStroke();
  fill(0, 255, 100, 40); rect(startZone.x, startZone.y, startZone.w, startZone.h);
  fill(255, 0, 0, 40); rect(endZone.x, endZone.y, endZone.w, endZone.h);
}

function drawPlayer() {
  fill(255, 255, 0);
  ellipse(mouseX, mouseY, playerSize, playerSize);
}

function checkCollision() {
  if (mouseX > startZone.x && mouseX < startZone.x + startZone.w &&
      mouseY > startZone.y && mouseY < startZone.y + startZone.h) {
    gameStarted = true;
  }
  if (!gameStarted) return;

  // 遍歷所有邊界，使用手寫的碰撞函式
  for (let b of boundaries) {
    let hit = collidePointLineCustom(mouseX, mouseY, b.p1.x, b.p1.y, b.p2.x, b.p2.y, playerSize/2);
    if (hit) {
      gameState = "FAIL";
      gameStarted = false;
    }
  }

  if (mouseX > endZone.x && mouseX < endZone.x + endZone.w &&
      mouseY > endZone.y && mouseY < endZone.y + endZone.h) {
    if (level < 2) { level++; setupLevel(level); } else { gameState = "WIN"; }
  }
}

function showScreen(txt, clr) {
  background(0, 180);
  fill(clr); textAlign(CENTER); textSize(40);
  text(txt, width/2, height/2);
}

function mousePressed() {
  if (gameState !== "PLAY") {
    level = 1; setupLevel(level); gameState = "PLAY";
  }
}

// ==========================================
// 手寫碰撞偵測函式 (替代 p5.collide2D)
// ==========================================
function collidePointLineCustom(px, py, x1, y1, x2, y2, buffer) {
  let d1 = dist(px, py, x1, y1);
  let d2 = dist(px, py, x2, y2);
  let lineLen = dist(x1, y1, x2, y2);
  // 如果點到兩端點的距離和等於線段長度，則點在線上
  return (d1 + d2 >= lineLen - buffer && d1 + d2 <= lineLen + buffer);
}