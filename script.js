const rulesBtn = document.getElementById("rules-btn");
const closeBtn = document.getElementById("close-btn");
const rules = document.getElementById("rules");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const paddleWidth = 80;
const paddleHeight = 20;
const paused = false;
const bricks = [];
const lifeLimit = 3;

let LEVEL =1;
let MAXLEVEL = 3;
let score = 0;
let LIFE = 3;
let GAMEOVER = false;

const brickRowCount = 9;
const brickColumnCount = 3;

// Create ball properties
const ball = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  size: 10,
  speed: 2,
  dx: 4,
  dy: -4,
};

// Create paddle properties
const paddle = {
  x: canvas.width / 2 - paddleWidth/2,
  y: canvas.height - paddleHeight,
  w: paddleWidth,
  h: paddleHeight,
  speed: 8,
  dx: 0,
};

// Create brick properties
const brickInfo = {
  w: 70,
  h: 20,
  padding: 10,
  offsetX: 45,
  offsetY: 60,
  visible: true,
};

// Create bricks : positions and status
function createBricks(){
for (let r = 0; r < brickRowCount; r++) {
  bricks[r] = [];
  for (let c = 0; c < brickColumnCount; c++) {
    const x = r * (brickInfo.w + brickInfo.padding) + brickInfo.offsetX;
    const y = c * (brickInfo.h + brickInfo.padding) + brickInfo.offsetY;
    bricks[r][c] = {
      x,
      y,
      ...brickInfo,
    };
  }
}
}

createBricks();

// Draw ball on canvas
function drawBall() {
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.size, 0, Math.PI * 2);
  ctx.fillStyle = "gold";
  ctx.fill();
  ctx.closePath();
}

// Draw paddle on canvas
function drawPaddle() {
  ctx.beginPath();
  ctx.rect(paddle.x, paddle.y, paddle.w, paddle.h);
  ctx.fillStyle = "grey";
  ctx.fill();
  ctx.closePath();
}

// Draw score on canvas
function drawScore() {
  ctx.font = "20px 'Bungee Shade'";
  ctx.fillText(`Score: ${score}`, canvas.width - 200, 30);
}

// Draw Life on canvas
function drawLIFE() {
  ctx.font = "20px 'Bungee Shade'";
  ctx.fillText(`Life: ${LIFE}`, canvas.width - 750, 30);
}

// Draw bricks on canvas
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

// Move paddle on canvas
function movePaddle() {
  paddle.x += paddle.dx;

  // Wall detection
  if (paddle.x + paddle.w > canvas.width) {
    paddle.x = canvas.width - paddle.w;
  }

  if (paddle.x < 0) {
    hitWall.play();
    paddle.x = 0;
  }
}

// Move ball
function moveBall() {
  ball.x += ball.dx;
  ball.y += ball.dy;

  // Wall detection (x)
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
  if (
    ball.x - ball.size > paddle.x &&
    ball.x + ball.size < paddle.x + paddle.w &&
    ball.y + ball.size > paddle.y
  ) {
    hitPaddle.play();
    ball.dy = -ball.speed;
  }

  // Brick collision
  bricks.forEach((column) => {
    column.forEach((brick) => {
      if (brick.visible) {
        if (
          ball.x - ball.size > brick.x &&
          ball.x + ball.size < brick.x + brick.w &&
          ball.y + ball.size > brick.y &&
          ball.y - ball.size < brick.y + brick.h
        ) {
          ball.dy *= -1;
          brick.visible = false;
          hitBrick.play();
          increaseScore();
        }
      }
    });
  });
  // Hit bottom wall - lose a life
  if (ball.y + ball.size >= canvas.height) {
 if(LIFE>0){
loseLife.play();
      showAllBricks();
      score = 0;
      LIFE--;
      resetBall();
      resetPaddle();
      GAMEOVER = false;
 } else if(LIFE<=0){
     GAMEOVER = true;
     gameOver();
 }
      

  }
}

// Increase score
function increaseScore() {
  score += 10;

  if (score % (brickRowCount * brickRowCount) === 0) {
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

function resetPaddle() {
  paddle.x = canvas.width / 2 + paddle.width / 2;
  paddle.y = canvas.height - paddleHeight;
  paddle.x += paddle.dx;
}

// Draw everything
function draw() {
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawBall();
  drawPaddle();

  drawScore();
  drawLIFE();
  drawBricks();
}

function update() {
  movePaddle();
  moveBall();
  //Draw everything
  draw();
  levelUp();
}

function loop() {
  draw();
  update();
  if (!GAMEOVER) {
    requestAnimationFrame(loop);
  }
}

loop();

// Move paddle through mouse
function mouseMoveHandler(e) {
  let relativeX = e.clientX - canvas.offsetLeft;
  if (relativeX > 0 && relativeX < canvas.width) {
    paddle.x = relativeX - paddle.w / 2;
  }
}

document.addEventListener("mousemove", mouseMoveHandler);

// Rules and close event handlers
rulesBtn.addEventListener("click", () => rules.classList.add("show"));
closeBtn.addEventListener("click", () => rules.classList.remove("show"));

// level up
function levelUp(){
    let thisLevelDone = true;

    for(let r = 0; r<brickRowCount;r++){
        for(let c = 0; c<brickColumnCount;c++){
            thisLevelDone = thisLevelDone && !bricks[r][c].visible;
        }
    }

    if(thisLevelDone){
        win.play();

        if(LEVEL >= MAXLEVEL){
            showYouWin();
            GAMEOVER = true;
            return;
        }
        brickRowCount+=2;
        createBricks();
        ball.speed += 1;
        resetBall();
        resetPaddle();
        LEVEL++;
    }
}

// adding sounds
const hitWall = new Audio("sounds/hit-wall.mp3");
const hitPaddle = new Audio("sounds/hit-paddle.mp3");
const hitBrick = new Audio("sounds/hit-brick.mp3");
const win = new Audio("sounds/win.mp3");
const gameIsOver = new Audio("sounds/game-over.mp3");
const loseLife = new Audio("sounds/lose-life.mp3");

// gameover modal
// const modalWin = document.getElementById("modal-win");
// const modalLose = document.getElementById("modal-lose")
// const overlay = document.getElementById("overlay");

function showYouWin(){
    $('#modal-win').modal("show");
    win.play();
}

function showYouLose() {
    $('#modal-lose').modal("show");
    gameIsOver.play();
}

function gameOver(){
    if(LIFE<=0){
        showYouLose();
        GAMEOVER = true; 
    }
}