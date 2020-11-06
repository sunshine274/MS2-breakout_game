$(document).ready(function () {
  const closeBtn = document.getElementById("close-btn");
  const rules = document.getElementById("rules");
  const canvas = document.getElementById("canvas");
  const CANVASWIDTH = window.innerWidth * 0.8;
  canvas.width = CANVASWIDTH;
  canvas.height = window.innerHeight * 0.8;
  const ctx = canvas.getContext("2d");
  const paddleWidth = 80;
  const paddleHeight = 20;
  const paddleBottomMargin = 20;
  const MAXLEVEL = 3;
  const gradient = ctx.createLinearGradient(0, 0, CANVASWIDTH, 0);
    gradient.addColorStop("0", "red");
    gradient.addColorStop("0.25", "blue");
    gradient.addColorStop("0.5", "yellow");
    gradient.addColorStop("1.0", "#00cc00");

 // adding sounds
  const hitWall = new Audio("assets/sounds/hit-wall.mp3");
  const hitPaddle = new Audio("assets/sounds/hit-paddle.mp3");
  const hitBrick = new Audio("assets/sounds/hit-brick.mp3");
  const win = new Audio("assets/sounds/win.mp3");
  const gameIsOver = new Audio("assets/sounds/game-over.mp3");
  const loseLife = new Audio("assets/sounds/lose-life.mp3");


  let rulesShown = false;
  let currLevel = 1;
  let currScore = 0;
  let currLife = 3;
  let paused = false;
  let gameStarted = false;
  let GAMEOVER = false;
  let bricks = [];
  let brickColumnCount = (CANVASWIDTH * 0.8) / 80;

  // Create ball properties
  const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 10,
    speed: 6,
    dx: 4,
    dy: -4,
  };

  // Create paddle properties
  const paddle = {
    x: canvas.width / 2 - paddleWidth / 2,
    y: canvas.height - paddleHeight - paddleBottomMargin,
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
  function createBricks() {
    bricks = [];
    const startPosition =
      CANVASWIDTH / 2 -
      (brickColumnCount / 2) * (brickInfo.w + brickInfo.padding) -
      brickInfo.padding;
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
    ctx.font = "18px 'Anton'";
    ctx.fillText(`SCORE : ${currScore}`, canvas.width * 0.65, 30);
    ctx.fillStyle = gradient;
  }

  // Draw Life on canvas
  function drawLife() {
    ctx.font = "18px 'Anton'";
    ctx.fillText(`LIFE : ${currLife}`, canvas.width * 0.4, 30);
    ctx.fillStyle = gradient;
  }

  function drawLevel() {
    ctx.font = "18px 'Anton'";
    ctx.fillText(`LEVEL : ${currLevel}`, canvas.width * 0.1, 30);
    ctx.fillStyle = gradient;
  }

  // Draw bricks on canvas
  function drawBricks() {
    bricks.forEach((column) => {
      column.forEach((brick) => {
        ctx.beginPath();
        ctx.rect(brick.x, brick.y, brick.w, brick.h);
        ctx.fillStyle = brick.visible ? gradient : "transparent";
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

  function noVisibleBrick() {
    return bricks.every((c) => c.every((r) => !r.visible));
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
      ball.dy = - ball.speed;
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
            if (noVisibleBrick()) {
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
    currScore += 15;
  }

  // Show all bricks
  function showAllBricks() {
    bricks.forEach((column) => {
      column.forEach((brick) => (brick.visible = true));
    });
  }

  // Reset the ball
  function resetBall() {
      console.log(ball.speed);
    ball.x = canvas.width / 2;
    ball.y = paddle.y - ball.radius - 3;
    ball.x += ball.dx;
    ball.y += ball.dy;
    ball.speed = 5;
  }

  $("#pause-btn").click(function () {
    if (!paused) {
      paused = true;
      document.getElementById("pause-btn").innerHTML = "Continue";
    } else {
      paused = false;
      document.getElementById("pause-btn").innerHTML = "Pause";
    }
  });

  $("#start-btn").click(function () {
      
        startGame();
        gameStarted = true; 
        document.getElementById("start-btn").innerHTML = "Restart";
        currLevel = 1;
        currScore = 0;
        currLife = 3;
        showAllBricks();
        resetBall();
      if(!paused){
          
          movePaddle();
          moveBall();
        //Draw everything
        draw();
        
      }
     
  });

  // Draw everything
  function draw() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawBall();
    drawPaddle();
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
    drawScore();
    drawLife();
    drawLevel();
    if (!GAMEOVER) {
      requestAnimationFrame(startGame);
    }
  }

  

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
  function touchBar(e) {
    let x = e.touches[0].clientX;
    paddle.x = x - canvas.offsetLeft - paddle.w / 2;
  }

  // Rules and close event handlers
  $("#rules-btn").click(function () {
    if (!rulesShown) {
      rules.classList.add("show");
      rulesShown = true;
      document.getElementById("rules-btn").innerHTML = "Hide Rules";
    } else {
      hideRules();
    }
  });

  function hideRules(){
      rules.classList.remove("show");
      rulesShown = false;
      document.getElementById("rules-btn").innerHTML = "Show Rules";
  }

  closeBtn.addEventListener("click", hideRules);

  // level up
  function levelUp() {
    if (currLevel === MAXLEVEL) {
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

  
  function showYouWin() {
    $("#modal-win").modal("show");
    win.play();
    GAMEOVER = true;
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
});
