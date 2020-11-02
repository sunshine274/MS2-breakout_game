$(document).ready(function(){

const rulesBtn = document.getElementById("rules-btn");
const closeBtn = document.getElementById("close-btn");
const rules = document.getElementById("rules");
const canvas = document.getElementById("canvas");
const CANVASWIDTH = window.innerWidth * 0.8;
canvas.width = CANVASWIDTH;
canvas.height = window.innerHeight * 0.8;
const ctx = canvas.getContext("2d");
const paddleWidth = 80;
const paddleHeight = 20;
const MAXLEVEL = 3;

let currLevel = 1;
let currScore = 0;
let currLife = 3;
let paused = false;
let GAMEOVER = false;
let bricks = [];
let brickColumnCount = CANVASWIDTH * 0.8 / 80;

// Create ball properties
const ball = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  radius: 10,
  speed: 5,
  dx: 4,
  dy: -4,
};

// Create paddle properties
const paddle = {
  x: canvas.width / 2 - paddleWidth / 2,
  y: canvas.height - 40,
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
    bricks = [];
    const startPosition = CANVASWIDTH / 2 - brickColumnCount/2 * (brickInfo.w + brickInfo.padding)
for (let c = 0; c < brickColumnCount; c++) {
    bricks[c] = [];
    for (let r = 0; r < currLevel * 2; r++) {
      let x = c * (brickInfo.w + brickInfo.padding) + startPosition;
      let y = r * (brickInfo.h + brickInfo.padding) + brickInfo.offsetY;
      bricks[c][r] = {
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
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
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
  ctx.fillText(`Score: ${currScore}`, canvas.width - 200, 30);
}

// Draw Life on canvas
function drawLife() {
  ctx.font = "20px 'Bungee Shade'";
  ctx.fillText(`Life: ${currLife}`, canvas.width - 750, 30);
}

function drawLevel(){
    ctx.font ="20px 'Bungee Shade'";
    ctx.fillText(`Level: ${currLevel}`, canvas.width/2 - 80, 30);
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

    paddle.x = 0;
  }
}

function noVisibleBrick () {
return bricks.every(c=> c.every(r => !r.visible));
}

// Move ball
function moveBall() {
  ball.x += ball.dx;
  ball.y += ball.dy;

  // Wall detection (x)
  if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) {
    hitWall.play();
    ball.dx *= -1;
  }

  // Wall detection (top/bottom)
  if (ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0) {
    hitWall.play();
    ball.dy *= -1;
  }

  // Paddle collision
  if (
    ball.x - ball.radius > paddle.x &&
    ball.x + ball.radius < paddle.x + paddle.w &&
    ball.y + ball.radius > paddle.y
  ) {
    hitPaddle.play();
    ball.dy = -ball.speed;
  }

  // Brick collision
  bricks.forEach((column) => {
    column.forEach((brick) => {
      if (brick.visible) {
        if (
          ball.x - ball.radius > brick.x &&
          ball.x + ball.radius < brick.x + brick.w &&
          ball.y + ball.radius > brick.y &&
          ball.y - ball.radius < brick.y + brick.h
        ) {
          ball.dy *= -1;
          brick.visible = false;
          if(noVisibleBrick()){
              levelUp();
          }
          hitBrick.play();
          increaseScore();
        }
      }
    });
  });
  // Hit bottom wall - lose a life
  if (ball.y + ball.radius > canvas.height) {
       currLife--;
    if (currLife >= 1) {
      loseLife.play();
      showAllBricks();
      currScore = 0;
      resetBall();
      GAMEOVER = false;
    } else {
      gameOver();
      return;
    }
  }
}

// Increase score
function increaseScore() {
  currScore += 10;

  if (currScore % (brickColumnCount * brickColumnCount) === 0) {
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

$('#pause-btn').click(function(){
  if (!paused) {
    paused = true;
    document.getElementById("pause-btn").innerHTML = "Start";
  } else {
    paused = false;
    document.getElementById("pause-btn").innerHTML = "Pause";
  }

});

$('#restart-btn').click(function(){
    currLevel = 1;
    currScore = 0;
    currLife = 3;
    showAllBricks();
    resetBall();
});



// Draw everything
function draw() {
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  

  drawBall();
  drawPaddle();

  drawScore();
  drawLife();
  drawLevel();

  drawBricks();
}

function update() {
  if (!paused) {
    movePaddle();
    moveBall();
    //Draw everything
    draw();
  }
}

function startGame() {
  draw();
  update();
  if (!GAMEOVER) {
    requestAnimationFrame(startGame);
  }
}

startGame();

// Move paddle through mouse 
function mouseMoveHandler(e) {
  let relativeX = e.clientX - canvas.offsetLeft;
  if (relativeX > 0 && relativeX < canvas.width) {
    paddle.x = relativeX - paddle.w / 2;
  }
}

document.addEventListener("mousemove", mouseMoveHandler);

// Move paddle by touching screen
document.ontouchmove = touchBar;
function touchBar(e){
    let x = e.touches[0].clientX;
    paddle.x = x - canvas.offsetLeft - paddle.w/2;
}

// Rules and close event handlers
rulesBtn.addEventListener("click", () => rules.classList.add("show"));
closeBtn.addEventListener("click", () => rules.classList.remove("show"));

// level up
function levelUp() {
    
  if( currLevel === MAXLEVEL){
      showYouWin();
      return;
  }
win.play();
currLevel++;
showAllBricks();
createBricks();
    ball.speed += 1;
    resetBall();
  }


// adding sounds
const hitWall = new Audio("sounds/hit-wall.mp3");
const hitPaddle = new Audio("sounds/hit-paddle.mp3");
const hitBrick = new Audio("sounds/hit-brick.mp3");
const win = new Audio("sounds/win.mp3");
const gameIsOver = new Audio("sounds/game-over.mp3");
const loseLife = new Audio("sounds/lose-life.mp3");


function showYouWin() {
  $("#modal-win").modal("show");
  win.play();
}

function showYouLose() {
  $("#modal-lose").modal("show");
  gameIsOver.play();
}

function gameOver() {
  if (currLife <= 0) {
    showYouLose();
    GAMEOVER = true;
  }
}

})
