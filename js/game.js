var game = this.game || {};


(function(module){
    // =================================================================
    // VARIABLES
    // =================================================================

    // Constants
    var FRAME_RATE = 60;

    var STAGE_WIDTH = 1366;
    var STAGE_HEIGHT = 768;
    var STAGE_PADDING = 50;

    var PADDLE_WIDTH = 120;
    var PADDLE_HEIGHT = 20;
    var PADDLE_SPEED = STAGE_WIDTH / 2;

    var BALL_SIZE = 10;
    var BALL_SPEED = STAGE_HEIGHT / 2;

    var BLOCK_WIDTH = 100;
    var BLOCK_HEIGHT = 25;
    var BLOCK_PADDING = 5;

    var SCORE_INCREMENT = 100;

    // Game Objects
    var stage = {};
    var paddle = {};
    var ball = {};
    var blocks = [];

    // Key States
    var leftDown = false;
    var rightDown = false;

    // Mouse States
    var dragging = false;
    var prevMouseX = 0;
    var currMouseX = 0;

    // Game State
    var STATE = { START: 0, PLAYING: 1, RESTART: 2, GAME_OVER: 3 };
    var currState = STATE.START;

    // Score
    var score = 0;
    var scoreText = {};
    

    // =================================================================
    // INITIALIZATION
    // =================================================================

    module.init = function() {
        stage = new createjs.Stage("js-canvas");
        initPaddle();
        initBall();
        initBlocks();
        initScore();
        initEvents();
    }

    function initPaddle() {
        paddle = new createjs.Shape();
        paddle.graphics.beginFill("white").drawRect(0, 0, PADDLE_WIDTH, PADDLE_HEIGHT);
        paddle.x = STAGE_WIDTH/2 - PADDLE_WIDTH/2;
        paddle.y = STAGE_HEIGHT - PADDLE_HEIGHT;
        stage.addChild(paddle);
    }

    function initBall() {
        ball = new createjs.Shape();
        ball.graphics.beginFill("white").drawRect(0, 0, BALL_SIZE * 2, BALL_SIZE * 2);
        ball.regX = BALL_SIZE;
        ball.regY = BALL_SIZE;
        ball.x = paddle.x + PADDLE_WIDTH/2;
        ball.y = paddle.y - BALL_SIZE;
        var theta = -(Math.random() * (Math.PI/2) + (Math.PI/4));
        ball.vx = Math.cos(theta) * BALL_SPEED;
        ball.vy = Math.sin(theta) * BALL_SPEED;
        stage.addChild(ball);
    }

    function initBlocks() {
        var numCols = Math.floor((STAGE_WIDTH - STAGE_PADDING * 2) / (BLOCK_WIDTH + BLOCK_PADDING));
        var numRows = Math.floor((STAGE_HEIGHT * (2/3) - STAGE_PADDING * 2) / (BLOCK_HEIGHT + BLOCK_PADDING));

        var leftMargin = (STAGE_WIDTH - (numCols * (BLOCK_WIDTH + BLOCK_PADDING))) / 2;
        console.log(leftMargin);
        console.log(numCols);
        for (var col = 0; col < numCols; col++) {
            var x = col * (BLOCK_WIDTH + BLOCK_PADDING) + BLOCK_PADDING + leftMargin;

            for (var row = 0; row < numRows; row++) {
                var y = row * (BLOCK_HEIGHT + BLOCK_PADDING) + BLOCK_PADDING + STAGE_PADDING;
                drawBlock(x, y);
            }
        }
    }

    function initScore() {
        scoreText = new createjs.Text("0", "bold 250px Arial", "white");
        scoreText.x = STAGE_PADDING;
        scoreText.y = STAGE_HEIGHT - 250 - STAGE_PADDING;
        scoreText.alpha = 0.125;
        stage.addChild(scoreText);
    }

    function initEvents() {
        window.onkeydown = keyDown;
        window.onkeyup = keyUp;
        window.onmousedown = mouseDown;
        window.onmouseup = mouseUp;
        createjs.Ticker.setFPS(FRAME_RATE);
        createjs.Ticker.useRAF = true;
        createjs.Ticker.addEventListener("tick", tick);
    }

    // =================================================================
    // EVENTS
    // =================================================================

    function keyDown(e) {
        var key = e.keyCode ? e.keyCode : e.which;

        if (key === 37 || key === 65)
            leftDown = true;
        else if (key === 39 || key === 68)
            rightDown = true;
    }

    function keyUp(e) {
        var key = e.keyCode ? e.keyCode : e.which;

        if (key === 37 || key === 65)
            leftDown = false;
        else if (key === 39 || key === 68)
            rightDown = false;
    }

    function mouseDown(e) {
        if (stage.mouseX > STAGE_HEIGHT * .75) {
            dragging = true;
            prevMouseX = currMouseX = stage.mouseX;
        }
        else {
            dragging = false;
        }
    }

    function mouseUp(e) {
        dragging = false;
    }

    function tick(e) {
        // Convert the delta to seconds, which is much more useful
        var delta = e.delta/1000;

        // Run update routines
        moveBall(delta);
        movePaddle(delta);
        checkCollisions();

        // Update score
        scoreText.text = score;

        // Draw
        stage.update();
    }

    // =================================================================
    // HELPERS
    // =================================================================

    function drawBlock(x, y) {
        var block = new createjs.Shape();
        block.graphics.beginFill("white").drawRect(0, 0, BLOCK_WIDTH, BLOCK_HEIGHT);
        block.x = x;
        block.y = y;
        stage.addChild(block);
        blocks.push(block);
    }

    function moveBall(delta) {
        ball.x += delta * ball.vx;
        ball.y += delta * ball.vy;
    }

    function movePaddle(delta) {
        if (!dragging) {
            if (leftDown)
                paddle.x -= delta * PADDLE_SPEED;
            if (rightDown)
                paddle.x += delta * PADDLE_SPEED;
        }
        else {
            currMouseX = stage.mouseX;
            paddle.x += currMouseX - prevMouseX;
            prevMouseX = currMouseX;
        }

        if (paddle.x < 0) {
            paddle.x = 0; 
        }
        else if (paddle.x + PADDLE_WIDTH > STAGE_WIDTH) {
            paddle.x = STAGE_WIDTH - PADDLE_WIDTH;
        }
        
    }

    function checkCollisions() {
        // Check collision with paddle
        if (isBallTouchingBlock(paddle) && ball.y + BALL_SIZE > paddle.y) {
            bounceOffPaddle();
        }

        // Check collisions with blocks
        for (var i = blocks.length - 1; i >= 0; i--) {
            if (checkCollisionWithBlock(blocks[i])) {
                stage.removeChild(blocks[i]);
                score += SCORE_INCREMENT;
                blocks.splice(i, 1);
            }
        }

        // Keep in the bounds of the stage
        if (ball.x + BALL_SIZE > STAGE_WIDTH) {
            ball.x = STAGE_WIDTH - BALL_SIZE;
            ball.vx = ball.vx * -1;
        }
        if (ball.x - BALL_SIZE < 0) {
            ball.x = BALL_SIZE;
            ball.vx = ball.vx * -1;
        }
        if (ball.y - BALL_SIZE < 0) {
            ball.y = BALL_SIZE;
            ball.vy = ball.vy * -1;
        }
        if (ball.y + BALL_SIZE > STAGE_HEIGHT) {
            ball.y = STAGE_HEIGHT - BALL_SIZE;
            ball.vy = ball.vy * -1;
            // loseLife();
        }
    }

    function checkCollisionWithBlock(block) {

        if (!isBallTouchingBlock(block))
            return false;

        if (ball.x < block.x) {
            ball.x = block.x - BALL_SIZE;
            ball.vx = ball.vx * -1;
        }
        else if (ball.x > (block.x + BLOCK_WIDTH)) {
            ball.x = block.x + BLOCK_WIDTH + BALL_SIZE;
            ball.vx = ball.vx * -1;
        }
        else if (ball.vy > 0) {
            ball.y = block.y - BALL_SIZE;
            ball.vy = ball.vy * -1;
        } else if (ball.vy <= 0) {
            ball.y = block.y + BLOCK_HEIGHT + BALL_SIZE;
            ball.vy = ball.vy *  -1;
        }

        return true;
    }

    function bounceOffPaddle() {
        ball.y = paddle.y - BALL_SIZE;
        ball.vy = ball.vy * -1;
    }

    function isBallTouchingBlock(block) {
        var tl = block.globalToLocal(ball.x - BALL_SIZE, ball.y - BALL_SIZE);
        var tr = block.globalToLocal(ball.x + BALL_SIZE, ball.y - BALL_SIZE);
        var bl = block.globalToLocal(ball.x - BALL_SIZE, ball.y + BALL_SIZE);
        var br = block.globalToLocal(ball.x + BALL_SIZE, ball.y + BALL_SIZE);

        if (block.hitTest(tl.x, tl.y))
            return true;
        else if (block.hitTest(tr.x, tr.y))
            return true;
        else if (block.hitTest(bl.x, bl.y))
            return true;
        else if (block.hitTest(br.x, br.y))
            return true;

        return false;
    }

    function loseLife() {
        alert("LOST LIFE");
    }

})(game);

window.onload = function() {
    game.init();    
}