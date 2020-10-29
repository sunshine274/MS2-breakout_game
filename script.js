const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const PADDLEWIDTH = 80;
const PADDLEHEIGHT = 20;
const MAXLEVEL = 3;
const BRICKROWCOUNT = 2;
const BRICKCOLUMNCOUNT = 9;

const hitWall = new Audio("sounds/hit-wall.mp3");
const hitPaddle = new Audio("sounds/hit-paddle.mp3");
const hitBrick = new Audio("sounds/hit-brick.mp3");
const win = new Audio("sounds/win.mp3");
const gameIsOver = new Audio("sounds/game-over.mp3");
const loseLife = new Audio("sounds/lose-life.mp3");

let currLevel = 1;
let currScore = 0;
let currLife = 3;
let isPaused = false;
let isGameOver = false;

const rulesBtn = document.getElementById("rules-btn");
const closeBtn = document.getElementById("close-btn");
const rules = document.getElementById("rules");

document.addEventListener("mousemove", mouseMoveHandler);
rulesBtn.addEventListener("click", () => rules.classList.add("show"));
closeBtn.addEventListener("click", () => rules.classList.remove("show"));

const ball = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  size: 10,
  speed: 5,
  dx: 4,
  dy: -4,
};

const paddle = {
  x: canvas.width / 2 - PADDLEWIDTH / 2,
  y: canvas.height - 40,
  w: PADDLEWIDTH,
  h: PADDLEHEIGHT,
  speed: 8,
  dx: 0,
};

const BRICKINFO = {
  w: 70,
  h: 20,
  padding: 10,
  offsetX: 45,
  offsetY: 60,
  visible: true,
};

function resetGame(){
  currLevel = 1;
  currScore = 0;
  currLife = 3;
  showAllBricks();
  resetBall();
}

function drawBricks() {
  bricks.forEach((column) => {
    column.forEach((brick) => {
      ctx.beginPath();
      ctx.rect(brick.x, brick.y, brick.w, brick.h);
      ctx.fillStyle = brick.visible ? "grey" : "transparent";
      ctx.fill();
      ctx.closePath();
    });
  });
}

function initialiseBricks(){
  console.log();
  for (let c = 0; c < BRICKCOLUMNCOUNT; c++) {
    bricks[c] = [];
    for (let r = 0; r < BRICKROWCOUNT; r++) {
      let x = c * (BRICKINFO.w + BRICKINFO.padding) + BRICKINFO.offsetX;
      let y = r * (BRICKINFO.h + BRICKINFO.padding) + BRICKINFO.offsetY;
      bricks[c][r] = {
        x,
        y,
        ...BRICKINFO,
      };
    }
  }
  console.log(bricks);
}

function drawBall() {
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.size, 0, Math.PI * 2);
  ctx.fillStyle = "gold";
  ctx.fill();
  ctx.closePath();
}

function drawPaddle() {
  ctx.beginPath();
  ctx.rect(paddle.x, paddle.y, paddle.w, paddle.h);
  ctx.fillStyle = "grey";
  ctx.fill();
  ctx.closePath();
}

function drawScore() {
  ctx.font = "20px 'Bungee Shade'";
  ctx.fillText(`Score: ${currScore}`, canvas.width - 200, 30);
}

function drawLife() {
  ctx.font = "20px 'Bungee Shade'";
  ctx.fillText(`Life: ${currLife}`, canvas.width - 750, 30);
}

function drawLevel(){
    ctx.font ="20px 'Bungee Shade'";
    ctx.fillText(`Level: ${currLevel}`, canvas.width/2 - 80, 30);
}

function movePaddle() {
  paddle.x += paddle.dx;
  if (paddle.x + paddle.w > canvas.width) {
    paddle.x = canvas.width - paddle.w;
  }
  if (paddle.x < 0) {
    paddle.x = 0;
  }
}

function showYouWin() {
  $("#modal-win").modal("show");
  win.play();
}

function showYouLose() {
  $("#modal-lose").modal("show");
  gameIsOver.play();
}

function gameOver() {
    showYouLose();
    isGameOver = true;
}

function noVisibleBrickLeft() {
  return bricks.every(c => c.every(r => !r.visible));  
}

function intersects(circle, rect)
{
    const circleDistance = {
      x: Math.abs(circle.x - rect.x),
      y: Math.abs(circle.y - rect.y)
    }

    if (circleDistance.x > (rect.w/2 + circle.size)) { return false; }
    if (circleDistance.y > (rect.h/2 + circle.size)) { return false; }

    if (circleDistance.x <= (rect.w/2)) { return true; } 
    if (circleDistance.y <= (rect.h/2)) { return true; }

    cornerDistance_sq = (circleDistance.x - rect.w/2)^2 +
                         (circleDistance.y - rect.h/2)^2;

    return (cornerDistance_sq <= (circle.r^2));
}

function moveBall() {
  ball.x += ball.dx;
  ball.y += ball.dy;

  if (ball.x + ball.size > canvas.width || ball.x - ball.size < 0) {
    hitWall.play();
    ball.dx *= -1;
  }

  // Wall detection (top/bottom)
  if (ball.y + ball.size > canvas.height || ball.y - ball.size < 0) {
    hitWall.play();
    ball.dy *= -1;
  }

  // Paddle collision
  if (intersects(ball, paddle)) {
    hitPaddle.play();
    ball.dy = -ball.speed;
  }

  // Brick collision
  bricks.forEach(column => {
    column.forEach(brick => {
        if (brick.visible && intersects(ball, brick)) {
          ball.dy *= -1;
          brick.visible = false;
          if(noVisibleBrickLeft()){
            levelUp();
          }
          hitBrick.play();
          increaseScore();
        }
    });
  });

  // Hit bottom wall - lose a life
  if (ball.y + ball.size >= canvas.height) {
    currLife--;
    if (currLife > 0) {
      loseLife.play();
      showAllBricks();
      score = 0;
      resetBall();
    } else {
      gameOver();
      return;
    }
  }
}

// Increase score
function increaseScore() {
  currScore += 10;
  if (currScore % (BRICKCOLUMNCOUNT * BRICKCOLUMNCOUNT) === 0) {
    showAllBricks();
  }
}

// Show all bricks
function showAllBricks() {
  bricks.forEach((column) => {
    column.forEach((brick) => (brick.visible = true));
  });
}

// Reset the ball
function resetBall() {
  ball.x = canvas.width / 2;
  ball.y = paddle.y;
  ball.x += ball.dx;
  ball.y += ball.dy;
}

function pause() {
  if (!isPaused) {
    isPaused = true;
    document.getElementById("pause-btn").innerHTML = "Start";
  } else {
    isPaused = false;
    document.getElementById("pause-btn").innerHTML = "Pause";
  }
}

// Move paddle through mouse
function mouseMoveHandler(e) {
  let relativeX = e.clientX - canvas.offsetLeft;
  if (relativeX > 0 && relativeX < canvas.width) {
    paddle.x = relativeX - paddle.w / 2;
  }
}

// level up
function levelUp() {
    if (currLevel === MAXLEVEL) {
      showYouWin();
      return;
    }
    win.play();
    showAllBricks();
    resetBall();
    currLevel++;
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBall();
  drawPaddle();
  drawScore();
  drawLife();
  drawLevel();
  drawBricks();
}

function loop() {
  if (!isPaused) {
    movePaddle();
    moveBall();
    draw();
  }
  if (!isGameOver) {
    requestAnimationFrame(loop);
  }
}

const bricks = [];
initialiseBricks();
loop();
